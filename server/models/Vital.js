const mongoose = require('mongoose');

const vitalSchema = new mongoose.Schema({
  patient:     { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  source:      { type: String, default: 'manual' }, // 'manual', 'samsung_watch', 'fitbit', 'apple_watch'
  heartRate:   { type: Number },
  bpSystolic:  { type: Number },
  bpDiastolic: { type: Number },
  spo2:        { type: Number },
  temperature: { type: Number },
  glucoseLevel:{ type: Number },
  steps:       { type: Number },
  calories:    { type: Number },
  sleepHours:  { type: Number },
  weight:      { type: Number },
  recordedAt:  { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Vital', vitalSchema);
