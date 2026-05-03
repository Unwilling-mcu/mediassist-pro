const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Vital = require('../models/Vital');
const Patient = require('../models/Patient');

// GET /api/vitals?limit=20&days=7
router.get('/', protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return res.json({ success: true, data: [] });
    const limit = parseInt(req.query.limit) || 20;
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const vitals = await Vital.find({ patient: patient._id, recordedAt: { $gte: since } })
      .sort({ recordedAt: -1 }).limit(limit);
    res.json({ success: true, data: vitals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/vitals/latest
router.get('/latest', protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return res.json({ success: true, data: null });
    const vital = await Vital.findOne({ patient: patient._id }).sort({ recordedAt: -1 });
    res.json({ success: true, data: vital });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/vitals
router.post('/', protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    const vital = await Vital.create({ patient: patient._id, ...req.body });
    res.status(201).json({ success: true, data: vital });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
