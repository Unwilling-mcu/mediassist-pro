const Doctor = require('../models/Doctor');
const User   = require('../models/User');
const Organisation = require('../models/Organisation');

// ─── POST /api/doctors/register  (doctor submits their profile) ───────────────
exports.registerDoctor = async (req, res) => {
  try {
    const { specialisation, licenceNumber, experience, qualification, hospital, bio, consultFee, availableDays, availableFrom, availableTo } = req.body;

    if (!specialisation || !licenceNumber || experience === undefined) {
      return res.status(400).json({ success: false, message: 'Specialisation, licence number, and experience are required' });
    }

    // Check if already registered
    const existing = await Doctor.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Doctor profile already exists. Contact your admin to update it.' });
    }

    const doctor = await Doctor.create({
      user:           req.user._id,
      organisation:   req.user.organisation,
      specialisation, licenceNumber, experience,
      qualification, hospital, bio,
      consultFee:     consultFee || 0,
      availableDays:  availableDays || ['Mon','Tue','Wed','Thu','Fri'],
      availableFrom:  availableFrom || '09:00',
      availableTo:    availableTo || '17:00',
      status:         'pending',
    });

    // Update user role to doctor
    await User.findByIdAndUpdate(req.user._id, { role: 'doctor' });

    res.status(201).json({ success: true, message: 'Doctor profile submitted for approval', data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/doctors/me  (get own doctor profile) ───────────────────────────
exports.getMyProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id }).populate('user', 'name email');
    if (!doctor) return res.status(404).json({ success: false, message: 'No doctor profile found' });
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/doctors/me  (update own profile) ───────────────────────────────
exports.updateMyProfile = async (req, res) => {
  try {
    const allowed = ['bio', 'consultFee', 'availableDays', 'availableFrom', 'availableTo', 'hospital', 'qualification'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user._id },
      { $set: updates },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/doctors  (list approved doctors — for booking) ──────────────────
exports.listDoctors = async (req, res) => {
  try {
    const { specialisation, orgId } = req.query;
    const filter = { status: 'approved' };
    if (specialisation) filter.specialisation = new RegExp(specialisation, 'i');
    if (orgId) filter.organisation = orgId;
    else if (req.user?.organisation) filter.organisation = req.user.organisation;

    const doctors = await Doctor.find(filter)
      .populate('user', 'name email')
      .sort({ rating: -1, experience: -1 });

    res.json({ success: true, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/doctors/pending  (org admin — see pending approvals) ────────────
exports.listPending = async (req, res) => {
  try {
    const doctors = await Doctor.find({
      organisation: req.user.organisation,
      status: 'pending',
    }).populate('user', 'name email createdAt');
    res.json({ success: true, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/doctors/:id/approve  (org admin approves) ──────────────────────
exports.approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    // Only approve doctors in your own org
    if (doctor.organisation?.toString() !== req.user.organisation?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised to approve this doctor' });
    }

    doctor.status     = 'approved';
    doctor.approvedBy = req.user._id;
    doctor.approvedAt = new Date();
    await doctor.save();

    res.json({ success: true, message: 'Doctor approved successfully', data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/doctors/:id/reject  (org admin rejects) ────────────────────────
exports.rejectDoctor = async (req, res) => {
  try {
    const { reason } = req.body;
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    if (doctor.organisation?.toString() !== req.user.organisation?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised' });
    }

    doctor.status          = 'rejected';
    doctor.rejectionReason = reason || 'Does not meet requirements';
    await doctor.save();

    // Revert user role back to patient
    await User.findByIdAndUpdate(doctor.user, { role: 'patient' });

    res.json({ success: true, message: 'Doctor rejected', data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/doctors/:id  (get single doctor profile) ───────────────────────
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};