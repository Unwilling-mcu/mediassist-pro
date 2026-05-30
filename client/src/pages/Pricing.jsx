import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Building2, Crown, AlertCircle, Loader2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PLAN_ICONS = {
  starter:    <Zap className="w-6 h-6" />,
  pro:        <Building2 className="w-6 h-6" />,
  enterprise: <Crown className="w-6 h-6" />,
};

const PLAN_COLORS = {
  starter:    { bg: 'from-blue-500/20 to-cyan-500/20',    border: 'border-blue-500/30',    btn: 'bg-blue-500 hover:bg-blue-600',    badge: '' },
  pro:        { bg: 'from-teal-500/20 to-emerald-500/20', border: 'border-teal-400',        btn: 'bg-teal-500 hover:bg-teal-600',    badge: 'Most Popular' },
  enterprise: { bg: 'from-purple-500/20 to-pink-500/20',  border: 'border-purple-500/30',   btn: 'bg-purple-500 hover:bg-purple-600', badge: '' },
};

export default function Pricing() {
  const [plans, setPlans]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [subscribing, setSubscribing] = useState(null);
  const [error, setError]           = useState('');
  const [billingStatus, setBillingStatus] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPlans();
    if (token) fetchBillingStatus();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${API}/billing/plans`);
      const data = await res.json();
      if (data.success) setPlans(data.data);
    } catch (err) {
      setError('Could not load plans. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBillingStatus = async () => {
    try {
      const res = await fetch(`${API}/billing/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setBillingStatus(data.data);
    } catch {}
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleSubscribe = async (planKey) => {
    if (!token) {
      navigate('/login?redirect=pricing');
      return;
    }

    setError('');
    setSubscribing(planKey);

    try {
      // 1. Create subscription on backend
      const res = await fetch(`${API}/billing/subscribe`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ planKey }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        setSubscribing(null);
        return;
      }

      // 2. Load Razorpay checkout
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError('Could not load payment gateway. Please check your connection.');
        setSubscribing(null);
        return;
      }

      // 3. Open Razorpay modal
      const options = {
        key:             data.data.razorpayKeyId,
        subscription_id: data.data.subscriptionId,
        name:            'MediAssist Pro',
        description:     `${data.data.planName} Plan — Monthly Subscription`,
        image:           '/logo.png',
        prefill: {
          name:  data.data.userName,
          email: data.data.userEmail,
        },
        theme: { color: '#00D4A8' },
        handler: async (response) => {
          // 4. Verify payment on backend
          const verifyRes = await fetch(`${API}/billing/verify`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body:    JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            await fetchBillingStatus();
            navigate('/dashboard?subscribed=true');
          } else {
            setError('Payment received but verification failed. Contact support.');
          }
        },
        modal: {
          ondismiss: () => setSubscribing(null),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setError(`Payment failed: ${response.error.description}`);
        setSubscribing(null);
      });
      rzp.open();
    } catch (err) {
      setError(err.message);
      setSubscribing(null);
    }
  };

  const isCurrentPlan = (planKey) => billingStatus?.plan === planKey && billingStatus?.status === 'active';
  const isTrialing    = billingStatus?.status === 'trialing';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] py-16 px-4">
      {/* Header */}
      <div className="text-center mb-14">
        <span className="inline-block px-4 py-1 rounded-full text-xs font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20 mb-4">
          Simple, transparent pricing
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Choose your <span className="text-teal-400">plan</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          All plans include a 14-day free trial. No credit card required to start.
        </p>

        {isTrialing && (
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            You are on a free trial — subscribe to keep access after it ends
          </div>
        )}
      </div>

      {error && (
        <div className="max-w-md mx-auto mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Plan cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const colors  = PLAN_COLORS[plan.key] || PLAN_COLORS.starter;
          const current = isCurrentPlan(plan.key);
          const busy    = subscribing === plan.key;
          const popular = colors.badge === 'Most Popular';

          return (
            <div
              key={plan.key}
              className={`relative rounded-2xl border bg-gradient-to-b ${colors.bg} ${colors.border} p-8 flex flex-col transition-transform hover:-translate-y-1`}
            >
              {popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full text-xs font-semibold bg-teal-500 text-white shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              {current && (
                <div className="absolute -top-3 right-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
                    Current Plan
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg bg-white/10 text-white`}>
                  {PLAN_ICONS[plan.key]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                  <p className="text-xs text-gray-400">per organisation / month</p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">₹{plan.price.toLocaleString('en-IN')}</span>
                <span className="text-gray-400 text-sm ml-1">/mo</span>
              </div>

              {/* Limits */}
              <div className="flex gap-4 mb-6 text-sm text-gray-300">
                <span>👥 {plan.maxPatients >= 99999 ? 'Unlimited' : plan.maxPatients} patients</span>
                <span>🩺 {plan.maxDoctors >= 99999 ? 'Unlimited' : plan.maxDoctors} doctors</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => !current && handleSubscribe(plan.key)}
                disabled={busy || current}
                className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
                  current
                    ? 'bg-green-600/50 cursor-default'
                    : busy
                    ? 'opacity-70 cursor-wait'
                    : colors.btn
                }`}
              >
                {busy ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing…
                  </span>
                ) : current ? (
                  '✓ Active'
                ) : (
                  `Start with ${plan.name}`
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-center text-gray-500 text-sm mt-10">
        Secure payments powered by Razorpay · Cancel anytime · Amounts in INR + GST
      </p>
    </div>
  );
}