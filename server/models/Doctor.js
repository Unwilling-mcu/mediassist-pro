const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  organisation: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', default: null },

  // Professional details
  specialisation: { type: String, required: true, trim: true },
  licenceNumber:  { type: String, required: true, trim: true },
  experience:     { type: Number, required: true, min: 0 },  // years
  qualification:  { type: String, trim: true },              // e.g. MBBS, MD
  hospital:       { type: String, trim: true },
  bio:            { type: String, maxlength: 500 },
  consultFee:     { type: Number, default: 0 },              // in INR

  // Availability
  availableDays:  [{ type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] }],
  availableFrom:  { type: String, default: '09:00' },
  availableTo:    { type: String, default: '17:00' },

  // Approval
  status:         { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason:{ type: String },
  approvedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt:     { type: Date },

  // Stats
  totalPatients:  { type: Number, default: 0 },
  rating:         { type: Number, default: 0, min: 0, max: 5 },
  reviewCount:    { type: Number, default: 0 },
}, { timestamps: true });

doctorSchema.index({ organisation: 1, status: 1 });
doctorSchema.index({ specialisation: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);