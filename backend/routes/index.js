/**
 * API routes aggregator
 */
const express = require('express');
const toneRoutes = require('./toneRoute');
const { publicLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Health check endpoint
router.get('/status', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is operational',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Register route modules
router.use('/', toneRoutes);

module.exports = router;