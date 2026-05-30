const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organisation = require('../models/Organisation');

// ─── Startup safety check ────────────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Exiting.');
  process.exit(1);
}

// ─── Base auth middleware ─────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password').populate('organisation');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
};

// ─── Require a specific role ──────────────────────────────────────────────────
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: `Requires role: ${roles.join(' or ')}` });
  }
  next();
};

// ─── Require the user to belong to an organisation ───────────────────────────
const requireOrg = async (req, res, next) => {
  if (!req.user.organisation) {
    return res.status(403).json({ success: false, message: 'No organisation associated with this account' });
  }
  // Attach full org to req for convenience
  req.org = req.user.organisation; // already populated via populate()
  next();
};

// ─── Require org_admin role within an org ────────────────────────────────────
const requireOrgAdmin = async (req, res, next) => {
  await requireOrg(req, res, async () => {
    if (req.user.role !== 'org_admin' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Organisation admin access required' });
    }
    next();
  });
};

// ─── Scope patient queries to org ────────────────────────────────────────────
// Adds req.orgFilter — use this in any query that should be org-scoped
const scopeToOrg = async (req, res, next) => {
  if (req.user.organisation) {
    req.orgFilter = { organisation: req.user.organisation._id };
  } else {
    req.orgFilter = {}; // individual user — no org filter
  }
  next();
};

module.exports = { protect, requireRole, requireOrg, requireOrgAdmin, scopeToOrg };