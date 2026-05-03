const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
  name:         { type: String },
  relationship: { type: String },
  phone:        { type: String },
}, { _id: false });

const patientSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  patientId:   { type: String, unique: true },
  dateOfBirth: { type: Date },
  gender:      { type: String, enum: ['Male', 'Female', 'Other'] },
  bloodGroup:  { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] },
  phone:       { type: String },
  address:     { type: String },
  city:        { type: String },
  state:       { type: String },

  // Physical stats
  heightCm:    { type: Number },
  weightKg:    { type: Number },
  waistCm:     { type: Number },

  // Medical history
  allergies:         [{ type: String }],
  chronicConditions: [{ type: String }],
  pastSurgeries:     [{ type: String }],
  familyHistory:     [{ type: String }],
  smokingStatus:     { type: String, enum: ['Non-Smoker', 'Smoker', 'Former Smoker'], default: 'Non-Smoker' },
  alcoholUse:        { type: String, enum: ['None', 'Occasional', 'Regular'], default: 'None' },

  // Emergency contacts
  emergencyContacts: [emergencyContactSchema],

  // Location (for nearby search)
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [86.97, 23.68] }, // [lng, lat]
  },
}, { timestamps: true });

patientSchema.index({ location: '2dsphere' });

// Auto-generate patientId
patientSchema.pre('save', async function (next) {
  if (!this.patientId) {
    const count = await mongoose.model('Patient').countDocuments();
    this.patientId = `MA-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Virtual: BMI
patientSchema.virtual('bmi').get(function () {
  if (!this.heightCm || !this.weightKg) return null;
  const h = this.heightCm / 100;
  return Math.round((this.weightKg / (h * h)) * 10) / 10;
});

// Virtual: age
patientSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const dob = new Date(this.dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
});

patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Patient', patientSchema);
