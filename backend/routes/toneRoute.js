/**
 * Routes for tone adjustment functionality
 */
const express = require('express');
const { validateToneAdjustment } = require('../middleware/validator');
const { publicLimiter, authLimiter } = require('../middleware/rateLimiter');
const toneController = require('../controller/toneController');

const router = express.Router();

/**
 * @route POST /tone
 * @desc Adjust text tone
 * @access Public
 */
router.post(
  '/tone',
  publicLimiter,
  validateToneAdjustment,
  toneController.adjustTone
);

/**
 * @route GET /tone/cache
 * @desc Get cache statistics
 * @access Admin
 */
router.get(
  '/tone/cache',
  authLimiter,
  toneController.getCacheStats
);

/**
 * @route DELETE /tone/cache
 * @desc Clear cache
 * @access Admin
 */
router.delete(
  '/tone/cache',
  authLimiter,
  toneController.clearCache
);

module.exports = router;