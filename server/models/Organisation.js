const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role:      { type: String, enum: ['org_admin', 'doctor', 'staff'], default: 'staff' },
  joinedAt:  { type: Date, default: Date.now },
}, { _id: false });

const organisationSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, required: true, unique: true, lowercase: true }, // e.g. "apollo-asansol"
  type:        { type: String, enum: ['clinic', 'hospital', 'diagnostic_lab', 'corporate', 'other'], default: 'clinic' },
  email:       { type: String, required: true, lowercase: true },
  phone:       { type: String },
  address:     { type: String },
  city:        { type: String },
  state:       { type: String },
  logoUrl:     { type: String },

  // The user who owns/created this org
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // All members of this org
  members:     [memberSchema],

  // Subscription / plan
  plan: {
    type:      { type: String, enum: ['free', 'starter', 'pro', 'enterprise'], default: 'free' },
    status:    { type: String, enum: ['active', 'trialing', 'past_due', 'cancelled'], default: 'trialing' },
    trialEndsAt: { type: Date, default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) }, // 14-day trial
    currentPeriodEnd: { type: Date },
    maxPatients:  { type: Number, default: 50 },   // free tier limit
    maxDoctors:   { type: Number, default: 2 },
  },

  // Razorpay identifiers (filled in Step 2)
  razorpay: {
    customerId:      { type: String },
    subscriptionId:  { type: String },
  },

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Auto-generate slug from name if not provided
organisationSchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Helper: check if a user is a member
organisationSchema.methods.hasMember = function (userId) {
  return this.members.some(m => m.user.toString() === userId.toString());
};

// Helper: get a member's role
organisationSchema.methods.getMemberRole = function (userId) {
  const m = this.members.find(m => m.user.toString() === userId.toString());
  return m ? m.role : null;
};

module.exports = mongoose.model('Organisation', organisationSchema);