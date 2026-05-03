const Patient = require('../models/Patient');

// GET /api/patients/me
exports.getProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id }).populate('user', 'name email');
    if (!patient) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/patients/me
exports.updateProfile = async (req, res) => {
  try {
    const allowed = [
      'dateOfBirth','gender','bloodGroup','phone','address','city','state',
      'heightCm','weightKg','waistCm','allergies','chronicConditions',
      'pastSurgeries','familyHistory','smokingStatus','alcoholUse','emergencyContacts','location',
    ];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const patient = await Patient.findOneAndUpdate(
      { user: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
