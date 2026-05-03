const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup for prescription image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/prescriptions');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `rx_${req.user._id}_${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/prescriptions
router.get('/', protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return res.json({ success: true, data: [] });
    const prescriptions = await Prescription.find({ patient: patient._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/prescriptions
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found' });

    const { medicineName, dosage, frequency, timing, duration, purpose, prescribedBy,
            prescribedAt, daysSupply, costPerUnit, refillsLeft, pharmacy, notes } = req.body;

    const rx = await Prescription.create({
      patient: patient._id,
      medicineName, dosage, frequency, timing, duration, purpose, prescribedBy,
      prescribedAt, daysSupply: Number(daysSupply) || 30,
      daysRemaining: Number(daysSupply) || 30,
      costPerUnit, refillsLeft: Number(refillsLeft) || 0, pharmacy, notes,
      imageUrl: req.file ? `/uploads/prescriptions/${req.file.filename}` : null,
    });

    res.status(201).json({ success: true, data: rx });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/prescriptions/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    const rx = await Prescription.findOneAndUpdate(
      { _id: req.params.id, patient: patient._id },
      { $set: req.body },
      { new: true }
    );
    if (!rx) return res.status(404).json({ success: false, message: 'Prescription not found' });
    res.json({ success: true, data: rx });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/prescriptions/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    await Prescription.findOneAndDelete({ _id: req.params.id, patient: patient._id });
    res.json({ success: true, message: 'Prescription deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
