const jwt = require('jsonwebtoken');
const Organisation = require('../models/Organisation');
const User = require('../models/User');
const Patient = require('../models/Patient');

// ─── POST /api/organisations  (create a new org) ──────────────────────────────
exports.createOrganisation = async (req, res) => {
  try {
    const { name, type, email, phone, address, city, state } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    // Create the org
    const org = await Organisation.create({
      name, type, email, phone, address, city, state,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'org_admin' }],
    });

    // Upgrade the creating user to org_admin and link to org
    await User.findByIdAndUpdate(req.user._id, {
      role: 'org_admin',
      organisation: org._id,
    });

    // Return fresh token so frontend picks up new org association
    const freshToken = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ success: true, data: org, token: freshToken });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'An organisation with that name already exists' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/organisations/me  (get current user's org) ─────────────────────
exports.getMyOrganisation = async (req, res) => {
  try {
    const org = await Organisation.findById(req.user.organisation)
      .populate('owner', 'name email')
      .populate('members.user', 'name email role');

    if (!org) return res.status(404).json({ success: false, message: 'No organisation found' });

    // Count patients in this org
    const patientCount = await Patient.countDocuments({ organisation: org._id });

    res.json({ success: true, data: { ...org.toObject(), patientCount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/organisations/me  (update org details) ─────────────────────────
exports.updateOrganisation = async (req, res) => {
  try {
    const allowed = ['name', 'type', 'email', 'phone', 'address', 'city', 'state', 'logoUrl'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const org = await Organisation.findByIdAndUpdate(
      req.user.organisation,
      { $set: updates },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: org });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/organisations/invite  (invite a user by email) ────────────────
exports.inviteMember = async (req, res) => {
  try {
    const { email, role = 'staff' } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const validRoles = ['org_admin', 'doctor', 'staff'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `Role must be one of: ${validRoles.join(', ')}` });
    }

    const invitee = await User.findOne({ email });
    if (!invitee) {
      return res.status(404).json({ success: false, message: 'No user found with that email. Ask them to register first.' });
    }

    const org = await Organisation.findById(req.user.organisation);
    if (org.hasMember(invitee._id)) {
      return res.status(400).json({ success: false, message: 'User is already a member of this organisation' });
    }

    // Add to org members
    org.members.push({ user: invitee._id, role });
    await org.save();

    // Link user to org
    await User.findByIdAndUpdate(invitee._id, {
      organisation: org._id,
      role: role === 'org_admin' ? 'org_admin' : role === 'doctor' ? 'doctor' : invitee.role,
    });

    res.json({ success: true, message: `${invitee.name} added to ${org.name}`, data: org });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/organisations/members/:userId  (remove a member) ────────────
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const org = await Organisation.findById(req.user.organisation);

    if (userId === org.owner.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot remove the organisation owner' });
    }

    org.members = org.members.filter(m => m.user.toString() !== userId);
    await org.save();

    // Unlink user from org
    await User.findByIdAndUpdate(userId, { organisation: null, role: 'patient' });

    res.json({ success: true, message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/organisations/stats  (usage stats for admin dashboard) ──────────
exports.getOrgStats = async (req, res) => {
  try {
    const orgId = req.user.organisation;
    const org = await Organisation.findById(orgId).populate('members.user', 'name email role');

    const Patient = require('../models/Patient');
    const Appointment = require('../models/Appointment');

    const [patientCount, appointmentCount] = await Promise.all([
      Patient.countDocuments({ organisation: orgId }),
      Appointment.countDocuments({ organisation: orgId }),
    ]);

    res.json({
      success: true,
      data: {
        org: {
          name: org.name,
          plan: org.plan,
          memberCount: org.members.length,
          patientCount,
          appointmentCount,
          trialEndsAt: org.plan.trialEndsAt,
        },
        members: org.members,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};