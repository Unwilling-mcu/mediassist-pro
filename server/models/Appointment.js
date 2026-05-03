const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient:      { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId:     { type: Number, required: true },
  doctorName:   { type: String, required: true },
  doctorSpec:   { type: String },
  clinic:       { type: String },
  address:      { type: String },
  phone:        { type: String },
  fee:          { type: Number },
  date:         { type: String, required: true },
  time:         { type: String, required: true },
  reason:       { type: String },
  status:       { type: String, enum: ['pending','confirmed','cancelled','completed'], default: 'pending' },
  notes:        { type: String },
  reminderSent: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);