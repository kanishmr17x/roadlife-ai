const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

const JWT_SECRET = process.env.JWT_SECRET || 'roadlife-ai-development-secret-jwt-key-2026';

/**
 * Middleware: Verify Bearer JWT token and attach user to request
 */
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required. Missing Bearer authorization token.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await userService.findById(decoded.id || decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid token. The user account associated with this session no longer exists.'
      });
    }

    if (user.status !== 'ACTIVE' || user.isApproved === false) {
      return res.status(403).json({
        error: 'Account inactive or pending approval. Access denied.',
        status: user.status
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Session expired. Please log in again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(401).json({
      error: 'Invalid or malformed authentication token.'
    });
  }
}

/**
 * Normalizes role matching so MUNICIPAL_AUTHORITY, GOVERNMENT, and ADMIN
 * are interoperable across existing components.
 */
function normalizeRole(role) {
  if (role === 'GOVERNMENT' || role === 'ADMIN' || role === 'MUNICIPAL_AUTHORITY') {
    return 'MUNICIPAL_AUTHORITY';
  }
  return role;
}

/**
 * Middleware factory: Enforce role-based access control
 * @param  {...string} allowedRoles Allowed roles
 */
function requireRole(...allowedRoles) {
  const normalizedAllowed = allowedRoles.map(normalizeRole);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = normalizeRole(req.user.role);

    // If ADMIN or userRole matches allowed set
    if (req.user.role === 'ADMIN' || normalizedAllowed.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      error: `Access restricted. Your account role (${req.user.role}) is not authorized to access this resource.`,
      requiredRoles: allowedRoles
    });
  };
}

module.exports = {
  authenticateToken,
  requireRole,
  normalizeRole,
  JWT_SECRET
};
