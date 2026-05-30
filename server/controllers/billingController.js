const Razorpay  = require('razorpay');
const crypto    = require('crypto');
const Organisation = require('../models/Organisation');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Plan config (fill RAZORPAY_PLAN_* in .env once you create plans) ─────────
const PLANS = {
  starter: {
    id:          process.env.RAZORPAY_PLAN_STARTER || 'plan_STARTER_PLACEHOLDER',
    name:        'Starter',
    price:       2000,
    maxPatients: 100,
    maxDoctors:  5,
    features:    ['AI symptom checker', 'Appointment booking', 'Prescription tracking', 'Up to 100 patients', 'Up to 5 doctors', 'Email support'],
  },
  pro: {
    id:          process.env.RAZORPAY_PLAN_PRO || 'plan_PRO_PLACEHOLDER',
    name:        'Pro',
    price:       5000,
    maxPatients: 500,
    maxDoctors:  20,
    features:    ['Everything in Starter', 'Health analytics dashboard', 'Real-time doctor chat', 'Wearable integrations', 'Up to 500 patients', 'Up to 20 doctors', 'Priority support'],
  },
  enterprise: {
    id:          process.env.RAZORPAY_PLAN_ENTERPRISE || 'plan_ENTERPRISE_PLACEHOLDER',
    name:        'Enterprise',
    price:       10000,
    maxPatients: 99999,
    maxDoctors:  99999,
    features:    ['Everything in Pro', 'White-label option', 'Custom integrations', 'Unlimited patients & doctors', 'Dedicated account manager', 'SLA guarantee', 'On-premise deployment option'],
  },
};

// ─── GET /api/billing/plans  (public — show pricing page) ────────────────────
exports.getPlans = (req, res) => {
  const plans = Object.entries(PLANS).map(([key, plan]) => ({
    key,
    name:        plan.name,
    price:       plan.price,
    features:    plan.features,
    maxPatients: plan.maxPatients,
    maxDoctors:  plan.maxDoctors,
  }));
  res.json({ success: true, data: plans });
};

// ─── POST /api/billing/subscribe  (create Razorpay subscription) ──────────────
exports.createSubscription = async (req, res) => {
  try {
    const { planKey } = req.body;
    const plan = PLANS[planKey];
    if (!plan) {
      return res.status(400).json({ success: false, message: 'Invalid plan. Choose: starter, pro, or enterprise' });
    }

    const org = await Organisation.findById(req.user.organisation);
    if (!org) {
      return res.status(404).json({ success: false, message: 'No organisation found. Create one first.' });
    }

    // If already has active subscription, don't create another
    if (org.razorpay.subscriptionId && org.plan.status === 'active') {
      return res.status(400).json({ success: false, message: 'Already has an active subscription. Cancel it first to switch plans.' });
    }

    // Create Razorpay customer if not exists
    let customerId = org.razorpay.customerId;
    if (!customerId) {
      const customer = await razorpay.customers.create({
        name:    req.user.name,
        email:   req.user.email,
        contact: org.phone || '',
        notes:   { orgId: org._id.toString(), orgName: org.name },
      });
      customerId = customer.id;
      org.razorpay.customerId = customerId;
    }

    // Create subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id:         plan.id,
      customer_notify: 1,
      quantity:        1,
      total_count:     12,      // 12 months; renews automatically
      notes: {
        orgId:   org._id.toString(),
        orgName: org.name,
        planKey,
      },
    });

    // Save subscription ID to org
    org.razorpay.subscriptionId = subscription.id;
    org.plan.type   = planKey;
    org.plan.status = 'trialing';
    await org.save();

    res.json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        razorpayKeyId:  process.env.RAZORPAY_KEY_ID,
        planName:       plan.name,
        amount:         plan.price * 100, // paise
        orgName:        org.name,
        userEmail:      req.user.email,
        userName:       req.user.name,
      },
    });
  } catch (err) {
    console.error('Subscription error:', err);
    res.status(500).json({ success: false, message: err.error?.description || err.message });
  }
};

// ─── POST /api/billing/verify  (called after frontend payment success) ────────
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;

    const generated = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest('hex');

    if (generated !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed — invalid signature' });
    }

    // Activate the org plan
    const org = await Organisation.findOne({ 'razorpay.subscriptionId': razorpay_subscription_id });
    if (org) {
      org.plan.status = 'active';
      org.plan.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Update limits based on plan
      const plan = Object.values(PLANS).find(p => p.id === org.plan.type) ||
                   PLANS[org.plan.type];
      if (plan) {
        org.plan.maxPatients = plan.maxPatients;
        org.plan.maxDoctors  = plan.maxDoctors;
      }
      await org.save();
    }

    res.json({ success: true, message: 'Payment verified. Subscription activated!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/billing/webhook  (Razorpay server-to-server events) ────────────
exports.webhook = async (req, res) => {
  try {
    const secret    = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    const body      = JSON.stringify(req.body);

    if (secret) {
      const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
      if (expected !== signature) {
        return res.status(400).json({ message: 'Invalid webhook signature' });
      }
    }

    const { event, payload } = req.body;
    const subId = payload?.subscription?.entity?.id;

    if (!subId) return res.json({ received: true });

    const org = await Organisation.findOne({ 'razorpay.subscriptionId': subId });
    if (!org) return res.json({ received: true });

    switch (event) {
      case 'subscription.activated':
        org.plan.status = 'active';
        break;
      case 'subscription.charged':
        org.plan.status = 'active';
        org.plan.currentPeriodEnd = new Date(
          payload.subscription.entity.current_end * 1000
        );
        break;
      case 'subscription.halted':
      case 'subscription.cancelled':
        org.plan.status = 'cancelled';
        // Downgrade to free limits
        org.plan.maxPatients = 50;
        org.plan.maxDoctors  = 2;
        break;
      case 'subscription.paused':
        org.plan.status = 'past_due';
        break;
    }

    await org.save();
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/billing/status  (get current org billing status) ────────────────
exports.getBillingStatus = async (req, res) => {
  try {
    const org = await Organisation.findById(req.user.organisation)
      .select('name plan razorpay');

    if (!org) return res.status(404).json({ success: false, message: 'No organisation found' });

    const planDetails = PLANS[org.plan.type] || null;

    res.json({
      success: true,
      data: {
        plan:             org.plan.type,
        status:           org.plan.status,
        trialEndsAt:      org.plan.trialEndsAt,
        currentPeriodEnd: org.plan.currentPeriodEnd,
        maxPatients:      org.plan.maxPatients,
        maxDoctors:       org.plan.maxDoctors,
        features:         planDetails?.features || [],
        hasSubscription:  !!org.razorpay.subscriptionId,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/billing/cancel  (cancel subscription) ─────────────────────────
exports.cancelSubscription = async (req, res) => {
  try {
    const org = await Organisation.findById(req.user.organisation);
    if (!org?.razorpay?.subscriptionId) {
      return res.status(400).json({ success: false, message: 'No active subscription found' });
    }

    await razorpay.subscriptions.cancel(org.razorpay.subscriptionId, true); // cancel at end of period

    org.plan.status = 'cancelled';
    await org.save();

    res.json({ success: true, message: 'Subscription cancelled. Access continues until end of billing period.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.error?.description || err.message });
  }
};