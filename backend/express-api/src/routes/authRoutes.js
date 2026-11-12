const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userService = require('../services/userService');
const { authenticateToken, normalizeRole, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/login
 * Validates credentials, checks role compatibility, and returns JWT session
 */
router.post('/login', async (req, res) => {
  const { email, password, portalRole } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      error: 'Please provide both email address and password.'
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await userService.findByEmail(normalizedEmail);

  if (!user) {
    return res.status(401).json({
      error: 'Invalid email address or password.'
    });
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      error: 'Invalid email address or password.'
    });
  }

  // Account status verification
  if (user.status === 'PENDING_APPROVAL' || user.isApproved === false) {
    return res.status(403).json({
      error: 'Your contractor account is currently pending municipal authority approval or has been disabled. Please contact the administrator.',
      code: 'PENDING_APPROVAL'
    });
  }

  if (user.status === 'SUSPENDED') {
    return res.status(403).json({
      error: 'Your account has been suspended. Please contact platform administration.',
      code: 'ACCOUNT_SUSPENDED'
    });
  }

  // Role & portal compatibility check if the user selected a specific portal
  if (portalRole) {
    const userNormalizedRole = normalizeRole(user.role);
    const portalNormalizedRole = normalizeRole(portalRole);

    if (user.role !== 'ADMIN' && userNormalizedRole !== portalNormalizedRole) {
      const roleDisplayNames = {
        CITIZEN: 'Citizen Observer',
        CONTRACTOR: 'Road Contractor',
        MUNICIPAL_AUTHORITY: 'Municipal Authority'
      };

      return res.status(403).json({
        error: `Portal access denied. Your account is registered as ${roleDisplayNames[userNormalizedRole] || user.role} and cannot be used to enter the ${roleDisplayNames[portalNormalizedRole] || portalRole} portal. Please select the correct portal.`,
        code: 'ROLE_MISMATCH',
        actualRole: user.role
      });
    }
  }

  // Issue 24-hour signed JWT
  const userId = user.id || (user._id && user._id.toString());
  const token = jwt.sign(
    {
      id: userId,
      userId: userId,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.status(200).json({
    message: 'Authentication successful',
    token,
    user: typeof user.toJSON === 'function' ? user.toJSON() : user
  });
});

/**
 * POST /api/auth/register
 * Public registration for Citizens and onboarding application for Contractors.
 * Disallows self-assigning Municipal Authority or Admin roles.
 */
router.post('/register', async (req, res) => {
  const { email, password, fullName, role = 'CITIZEN', phone, companyName, licenseNumber } = req.body || {};

  if (!email || !password || !fullName) {
    return res.status(400).json({
      error: 'Email address, password, and full name are required.'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: 'Password must be at least 6 characters in length.'
    });
  }

  // Security gate: Disallow self-assigning privileged roles
  const requestedRole = (role || 'CITIZEN').toUpperCase();
  if (
    requestedRole === 'MUNICIPAL_AUTHORITY' ||
    requestedRole === 'GOVERNMENT' ||
    requestedRole === 'ADMIN'
  ) {
    return res.status(403).json({
      error: 'Municipal Authority accounts cannot be created via public registration. Please contact the department administrator.',
      code: 'PRIVILEGED_ROLE_NOT_PERMITTED'
    });
  }

  const existing = await userService.findByEmail(email);
  if (existing) {
    return res.status(409).json({
      error: 'An account with this email address is already registered.'
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  if (requestedRole === 'CONTRACTOR') {
    if (!companyName || !licenseNumber) {
      return res.status(400).json({
        error: 'Contractor onboarding requires both company name and official contractor license number.'
      });
    }

    const newContractor = await userService.createUser({
      email,
      passwordHash,
      fullName,
      role: 'CONTRACTOR',
      status: 'PENDING_APPROVAL',
      isApproved: false,
      companyName,
      licenseNumber,
      phone
    });

    return res.status(201).json({
      message: 'Contractor registration submitted successfully. Your account is pending municipal authority verification before work orders can be accessed.',
      status: 'PENDING_APPROVAL',
      user: typeof newContractor.toJSON === 'function' ? newContractor.toJSON() : newContractor
    });
  }

  // Default Citizen registration: immediately active
  const newCitizen = await userService.createUser({
    email,
    passwordHash,
    fullName,
    role: 'CITIZEN',
    status: 'ACTIVE',
    isApproved: true,
    phone
  });

  const userId = newCitizen.id || (newCitizen._id && newCitizen._id.toString());
  const token = jwt.sign(
    {
      id: userId,
      userId: userId,
      email: newCitizen.email,
      role: newCitizen.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.status(201).json({
    message: 'Citizen observer registration completed successfully.',
    token,
    user: typeof newCitizen.toJSON === 'function' ? newCitizen.toJSON() : newCitizen
  });
});

/**
 * GET /api/auth/me
 * Restores and verifies authenticated session
 */
router.get('/me', authenticateToken, (req, res) => {
  return res.status(200).json({
    user: typeof req.user.toJSON === 'function' ? req.user.toJSON() : req.user
  });
});

/**
 * POST /api/auth/logout
 * Invalidate client session
 */
router.post('/logout', (req, res) => {
  return res.status(200).json({
    message: 'Session closed successfully'
  });
});

module.exports = router;
