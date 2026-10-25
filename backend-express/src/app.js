const express = require('express');

const app = express();

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'roadsense-backend',
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Role-protected resource routes
const resourceRoutes = require('./routes/resourceRoutes');
app.use('/api', resourceRoutes);

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

// Generic 500 error handler (does not expose stack traces or secrets)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
