/**
 * Global error handling middleware
 */
const logger = require('../utils/logger.js');
const ApiError = require('../utils/ApiError.js');
const config = require('../config');

/**
 * Error converter - converts non-ApiError instances to ApiError
 */
exports.errorConverter = (err, req, res, next) => {
  let error = err;
  
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || 'Internal server error';
    error = new ApiError(statusCode, message, false, err.stack);
  }
  
  next(error);
};

/**
 * Global error handler
 */
exports.errorHandler = (err, req, res, next) => {
  const { statusCode, message, isOperational, stack } = err;
  
  // Log error
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.path} >> StatusCode: ${statusCode}, Message: ${message}\n${stack}`);
  } else {
    logger.warn(`[${req.method}] ${req.path} >> StatusCode: ${statusCode}, Message: ${message}`);
  }
  
  // Set response
  const response = {
    status: 'error',
    code: statusCode,
    message,
    ...(config.server.nodeEnv === 'development' && { stack: stack }),
    ...(req.id && { requestId: req.id })
  };
  
  res.status(statusCode).json(response);
};