/**
 * Controller for text tone adjustment functionality
 */
const crypto = require('crypto');
const logger = require('../utils/logger');
const mistralService = require('../services/mistralService');
const cacheService = require('../services/cacheService');
const ApiError = require('../utils/ApiError');

/**
 * Generate a cache key for tone adjustment
 * @param {string} text - Original text
 * @param {number} toneValue - Tone value
 * @returns {string} - Cache key
 */
const generateCacheKey = (text, toneValue) => {
  const hash = crypto.createHash('md5').update(`${text}:${toneValue}`).digest('hex');
  return `tone:${hash}`;
};

/**
 * Adjust text tone
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
exports.adjustTone = async (req, res, next) => {
  try {
    const { text, toneValue } = req.body;
    const requestId = req.id || 'unknown';
    
    logger.info(`[${requestId}] Tone adjustment request received: ${text.length} chars, tone: ${toneValue}`);
    
    // Generate cache key
    const cacheKey = generateCacheKey(text, toneValue);
    
    // Try to get from cache
    const cachedResponse = cacheService.get(cacheKey);
    if (cachedResponse) {
      logger.info(`[${requestId}] Cache hit for tone adjustment`);
      return res.status(200).json({
        status: 'success',
        requestId,
        data: {
          originalText: text,
          adjustedText: cachedResponse,
          toneValue,
          cached: true
        }
      });
    }
    
    // Adjust tone with Mistral AI
    const adjustedText = await mistralService.adjustTextTone(text, toneValue);
    
    // Save to cache
    cacheService.set(cacheKey, adjustedText);
    
    // Send response
    logger.info(`[${requestId}] Tone adjustment successful`);
    res.status(200).json({
      status: 'success',
      requestId,
      data: {
        originalText: text,
        adjustedText,
        toneValue,
        cached: false
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get cache statistics
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
exports.getCacheStats = (req, res, next) => {
  try {
    const stats = cacheService.getStats();
    
    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear the cache
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
exports.clearCache = (req, res, next) => {
  try {
    cacheService.clear();
    
    res.status(200).json({
      status: 'success',
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};
