const express = require('express');
const router  = express.Router();
const { protect, requireOrg, requireOrgAdmin } = require('../middleware/auth');
const {
  createOrganisation,
  getMyOrganisation,
  updateOrganisation,
  inviteMember,
  removeMember,
  getOrgStats,
} = require('../controllers/organisationController');

// Create a new org (any logged-in user can create one)
router.post('/',          protect, createOrganisation);

// Get / update current user's org
router.get('/me',         protect, requireOrg, getMyOrganisation);
router.put('/me',         protect, requireOrgAdmin, updateOrganisation);

// Member management (org admin only)
router.post('/invite',             protect, requireOrgAdmin, inviteMember);
router.delete('/members/:userId',  protect, requireOrgAdmin, removeMember);

// Stats for admin dashboard
router.get('/stats',      protect, requireOrgAdmin, getOrgStats);

module.exports = router;