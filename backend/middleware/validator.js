/**
 * Request validation middleware
 */
const { body, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Tone adjustment request validation rules
 */
exports.validateToneAdjustment = [
  body('text')
    .exists()
    .withMessage('Text is required')
    .notEmpty()
    .withMessage('Text cannot be empty')
    .isString()
    .withMessage('Text must be a string')
    .isLength({ max: 5000 })
    .withMessage('Text cannot exceed 5000 characters'),
  
  body('toneValue')
    .exists()
    .withMessage('Tone value is required')
    .isInt({ min: 0, max: 100 })
    .withMessage('Tone value must be between 0 and 100'),
  
  // Validation middleware to check for errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors.array().map(err => err.msg).join(', ');
      return next(new ApiError(400, message));
    }
    next();
  }
];