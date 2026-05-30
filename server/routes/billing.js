const express = require('express');
const router  = express.Router();
const { protect, requireOrg, requireOrgAdmin } = require('../middleware/auth');
const {
  getPlans,
  createSubscription,
  verifyPayment,
  webhook,
  getBillingStatus,
  cancelSubscription,
} = require('../controllers/billingController');

// Public — anyone can see pricing
router.get('/plans', getPlans);

// Webhook — raw body needed for signature verification (no auth)
router.post('/webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    if (req.body && Buffer.isBuffer(req.body)) {
      req.body = JSON.parse(req.body.toString());
    }
    next();
  },
  webhook
);

// Protected — must be logged in + have an org
router.get('/status',    protect, requireOrg, getBillingStatus);
router.post('/subscribe', protect, requireOrg, createSubscription);
router.post('/verify',    protect, requireOrg, verifyPayment);
router.post('/cancel',    protect, requireOrgAdmin, cancelSubscription);

module.exports = router;