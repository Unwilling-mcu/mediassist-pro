const mongoose = require('mongoose');

const conditionSchema = new mongoose.Schema({
  name:       { type: String },
  confidence: { type: Number },
  description:{ type: String },
}, { _id: false });

const symptomLogSchema = new mongoose.Schema({
  patient:    { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  symptoms:   { type: String, required: true },
  bodyPart:   { type: String },
  severity:   { type: String, enum: ['mild', 'moderate', 'severe', 'emergency'] },
  conditions: [conditionSchema],
  specialist: { type: String },
  actions:    [{ type: String }],
  emergency:  { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('SymptomLog', symptomLogSchema);
