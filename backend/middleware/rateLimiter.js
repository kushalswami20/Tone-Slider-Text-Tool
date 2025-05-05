/**
 * Custom rate limiting middleware with separate limits for authenticated users
 */
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const config = require('../config');
const logger = require('../utils/logger');

// Create different limiters based on authentication status
const createLimiter = (options) => {
  const limiterConfig = {
    windowMs: config.api.rateLimit.windowMs,
    max: options.max || config.api.rateLimit.max,
    standardHeaders: config.api.rateLimit.standardHeaders,
    legacyHeaders: config.api.rateLimit.legacyHeaders,
    message: config.api.rateLimit.message,
    keyGenerator: (req) => {
      // Use API key or IP address as identifier
      return req.headers['x-api-key'] || req.ip;
    },
    skip: (req) => {
      // Skip rate limiting for internal requests
      return req.headers['x-internal-request'] === process.env.INTERNAL_API_SECRET;
    }
  };

  // Use Redis store if available
  if (process.env.REDIS_URL) {
    try {
      const Redis = require('ioredis');
      const client = new Redis(process.env.REDIS_URL);
      
      limiterConfig.store = new RedisStore({
        sendCommand: (...args) => client.call(...args),
        prefix: 'ratelimit:'
      });
      
      logger.info('Rate limiter using Redis store');
    } catch (error) {
      logger.error(`Redis connection failed: ${error.message}. Using memory store for rate limiting.`);
    }
  }
  
  return rateLimit(limiterConfig);
};

// Public API rate limiter
exports.publicLimiter = createLimiter({ max: config.api.rateLimit.max });

// Authenticated API rate limiter (higher limits)
exports.authLimiter = createLimiter({ max: config.api.rateLimit.max * 5 });