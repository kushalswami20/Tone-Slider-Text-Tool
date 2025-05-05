/**
 * Express application setup
 */
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const config = require('./config');
const logger = require('./utils/logger.js');
const routes = require('./routes');
const { errorConverter, errorHandler } = require('./middleware/errorHandler');

// Initialize express app
const app = express();

// Request ID middleware
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Security middleware
app.use(helmet());

// CORS setup
app.use(cors(config.server.cors));

// Request body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Compress responses
app.use(compression());

// Request logging
const morganFormat = config.server.nodeEnv === 'development' ? 'dev' : config.logging.format;
app.use(morgan(morganFormat, {
  stream: { write: message => logger.http(message.trim()) }
}));

// API routes
app.use(config.api.prefix, routes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    code: 404,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware
app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
