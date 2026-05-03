const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const Patient     = require('../models/Patient');

// GET /api/appointments
router.get('/', protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return res.json({ success: true, data: [] });
    const appts = await Appointment.find({ patient: patient._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: appts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/appointments
router.post('/', protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    const appt = await Appointment.create({ patient: patient._id, ...req.body });
    res.status(201).json({ success: true, data: appt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/appointments/:id  (confirm, cancel, reschedule)
router.put('/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    const appt = await Appointment.findOneAndUpdate(
      { _id: req.params.id, patient: patient._id },
      { $set: req.body },
      { new: true }
    );
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: appt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/appointments/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    await Appointment.findOneAndDelete({ _id: req.params.id, patient: patient._id });
    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;