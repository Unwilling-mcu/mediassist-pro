import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API = BASE.endsWith('/api') ? BASE : `${BASE}/api`;

const PLAN_META = {
  starter:    { icon: '⚡', color: 'var(--blue)',   border: 'rgba(74,159,213,0.3)',   btnBg: 'var(--blue)',   popular: false },
  pro:        { icon: '🏥', color: 'var(--mint)',   border: 'var(--mint)',            btnBg: 'var(--mint)',   popular: true  },
  enterprise: { icon: '👑', color: 'var(--purple)', border: 'rgba(155,130,244,0.3)', btnBg: 'var(--purple)', popular: false },
};

export default function Pricing() {
  const [plans,         setPlans]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [subscribing,   setSubscribing]   = useState(null);
  const [error,         setError]         = useState('');
  const [billingStatus, setBillingStatus] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPlans();
    if (token) fetchBillingStatus();
  }, []);

  const fetchPlans = async () => {
    try {
      const res  = await fetch(`${API}/billing/plans`);
      const data = await res.json();
      if (data.success) setPlans(data.data);
      else setError('Could not load plans. Please refresh.');
    } catch { setError('Could not load plans. Please refresh.'); }
    finally   { setLoading(false); }
  };

  const fetchBillingStatus = async () => {
    try {
      const res  = await fetch(`${API}/billing/status`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setBillingStatus(data.data);
    } catch {}
  };

  const loadRazorpay = () => new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  const handleSubscribe = async (planKey) => {
    if (!token) { navigate('/login?redirect=pricing'); return; }
    setError(''); setSubscribing(planKey);
    try {
      const res  = await fetch(`${API}/billing/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ planKey }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); setSubscribing(null); return; }

      const loaded = await loadRazorpay();
      if (!loaded) { setError('Could not load payment gateway.'); setSubscribing(null); return; }

      const rzp = new window.Razorpay({
        key:             data.data.razorpayKeyId,
        subscription_id: data.data.subscriptionId,
        name:            'MediAssist Pro',
        description:     `${data.data.planName} Plan — Monthly`,
        prefill:         { name: data.data.userName, email: data.data.userEmail },
        theme:           { color: '#00D4A8' },
        handler: async (response) => {
          const vr   = await fetch(`${API}/billing/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(response),
          });
          const vd = await vr.json();
          if (vd.success) { await fetchBillingStatus(); navigate('/?subscribed=true'); }
          else setError('Verification failed. Contact support.');
        },
        modal: { ondismiss: () => setSubscribing(null) },
      });
      rzp.on('payment.failed', r => { setError(`Payment failed: ${r.error.description}`); setSubscribing(null); });
      rzp.open();
    } catch (err) { setError(err.message); setSubscribing(null); }
  };

  const isCurrentPlan = k => billingStatus?.plan === k && billingStatus?.status === 'active';
  const isTrialing    = billingStatus?.status === 'trialing';

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 8px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '4px 14px', borderRadius: 99, background: 'var(--mintd)', color: 'var(--mint)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
          Simple, transparent pricing
        </span>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px', color: 'var(--text)' }}>
          Choose your <span style={{ color: 'var(--mint)' }}>plan</span>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', margin: 0 }}>
          All plans include a 14-day free trial. No credit card required to start.
        </p>

        {isTrialing && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 14, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,170,68,.08)', border: '1px solid rgba(255,170,68,.25)', color: 'var(--amber)', fontSize: 13 }}>
            ⏳ You are on a free trial — subscribe to keep access after it ends
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ maxWidth: 420, margin: '0 auto 20px', padding: '10px 16px', borderRadius: 10, background: 'rgba(255,107,107,.08)', border: '1px solid rgba(255,107,107,.2)', color: 'var(--coral)', fontSize: 13, textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>⏳ Loading plans…</div>
      )}

      {/* Plan cards grid */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {plans.map(plan => {
            const meta    = PLAN_META[plan.key] || PLAN_META.starter;
            const current = isCurrentPlan(plan.key);
            const busy    = subscribing === plan.key;

            return (
              <div key={plan.key} style={{ position: 'relative', background: 'var(--card)', border: `1px solid ${meta.popular ? meta.border : 'var(--border)'}`, borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', boxShadow: meta.popular ? `0 0 0 1px ${meta.border}, 0 8px 32px rgba(0,212,168,0.08)` : 'none', transform: meta.popular ? 'scale(1.03)' : 'scale(1)', transition: 'transform .2s' }}>

                {/* Popular badge */}
                {meta.popular && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--mint)', color: '#080E1C', fontSize: 11, fontWeight: 700, padding: '3px 14px', borderRadius: 99 }}>
                    Most Popular
                  </div>
                )}

                {/* Current plan badge */}
                {current && (
                  <div style={{ position: 'absolute', top: -12, right: 16, background: 'var(--green)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 99 }}>
                    ✓ Active
                  </div>
                )}

                {/* Icon + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    {meta.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{plan.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>per organisation / month</div>
                  </div>
                </div>

                {/* Price */}
                <div style={{ marginBottom: 14 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: meta.color, letterSpacing: -1 }}>
                    ₹{plan.price.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text3)', marginLeft: 4 }}>/mo</span>
                </div>

                {/* Limits */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, fontSize: 12, color: 'var(--text2)' }}>
                  <span>👥 {plan.maxPatients >= 99999 ? '∞' : plan.maxPatients} patients</span>
                  <span>🩺 {plan.maxDoctors >= 99999 ? '∞' : plan.maxDoctors} doctors</span>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'var(--border)', marginBottom: 16 }} />

                {/* Features */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text2)' }}>
                      <span style={{ color: meta.color, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <button
                  onClick={() => !current && !busy && handleSubscribe(plan.key)}
                  disabled={busy || current}
                  style={{
                    width: '100%', padding: '11px', borderRadius: 10, border: 'none',
                    background: current ? 'var(--bg3)' : meta.btnBg,
                    color: current ? 'var(--text3)' : (plan.key === 'pro' ? '#080E1C' : '#fff'),
                    fontWeight: 700, fontSize: 14, cursor: current ? 'default' : busy ? 'wait' : 'pointer',
                    opacity: busy ? 0.7 : 1, transition: 'opacity .2s',
                    fontFamily: 'var(--sans)',
                  }}
                >
                  {busy ? '⏳ Processing…' : current ? '✓ Current Plan' : `Start with ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
        🔒 Secure payments powered by Razorpay · Cancel anytime · Amounts in INR + GST
      </p>
    </div>
  );
}