const express = require('express');
const router  = express.Router();
const { protect, requireOrgAdmin } = require('../middleware/auth');
const {
  registerDoctor,
  getMyProfile,
  updateMyProfile,
  listDoctors,
  listPending,
  approveDoctor,
  rejectDoctor,
  getDoctorById,
} = require('../controllers/doctorController');

// Public-ish (requires login)
router.get('/',              protect, listDoctors);       // list approved doctors
router.get('/pending',       protect, requireOrgAdmin, listPending);  // pending approvals
router.get('/me',            protect, getMyProfile);
router.post('/register',     protect, registerDoctor);
router.put('/me',            protect, updateMyProfile);
router.get('/:id',           protect, getDoctorById);

// Org admin only
router.put('/:id/approve',   protect, requireOrgAdmin, approveDoctor);
router.put('/:id/reject',    protect, requireOrgAdmin, rejectDoctor);

module.exports = router;