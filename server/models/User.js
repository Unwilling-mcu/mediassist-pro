const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },

  // Extended roles — 'org_admin' manages an organisation
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin', 'org_admin'],
    default: 'patient',
  },

  // Which org this user belongs to (null = individual/no org)
  organisation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organisation',
    default: null,
  },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);