const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patient:       { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  medicineName:  { type: String, required: true },
  dosage:        { type: String, required: true },
  frequency:     { type: String, required: true },  // e.g. "Twice daily"
  timing:        { type: String },                  // e.g. "After meals"
  duration:      { type: String },                  // e.g. "30 days"
  purpose:       { type: String },
  prescribedBy:  { type: String },
  prescribedAt:  { type: String },
  daysSupply:    { type: Number, default: 30 },
  daysRemaining: { type: Number },
  costPerUnit:   { type: String },
  refillsLeft:   { type: Number, default: 0 },
  pharmacy:      { type: String },
  notes:         { type: String },
  imageUrl:      { type: String },    // uploaded scan
  status: {
    type: String,
    enum: ['active', 'refill_needed', 'expired', 'completed'],
    default: 'active',
  },
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
