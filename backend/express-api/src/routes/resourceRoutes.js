const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all resource routes
router.use(authenticateToken);

/**
 * Citizen Endpoints: Accessible to Citizens and Oversight Officers
 */
router.get('/citizen/reports', requireRole('CITIZEN', 'MUNICIPAL_AUTHORITY'), (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Citizen reports retrieved successfully',
    reports: []
  });
});

/**
 * Contractor Endpoints: Accessible only to Contractors (and Municipal Oversight)
 */
router.get('/contractor/projects', requireRole('CONTRACTOR', 'MUNICIPAL_AUTHORITY'), (req, res) => {
  res.status(200).json({
    status: 'ok',
    contractor: req.user.companyName || req.user.fullName,
    assignedProjects: []
  });
});

/**
 * Municipal Authority Endpoints: Strictly accessible only to Municipal Authority / Admin
 */
router.get('/government/audit-logs', requireRole('MUNICIPAL_AUTHORITY', 'ADMIN'), (req, res) => {
  res.status(200).json({
    status: 'ok',
    logs: [
      {
        id: 'log-001',
        action: 'USER_LOGIN',
        officer: req.user.fullName,
        timestamp: new Date().toISOString()
      }
    ]
  });
});

module.exports = router;
