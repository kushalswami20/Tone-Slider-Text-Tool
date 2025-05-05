const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger.js');

// Start server
const server = app.listen(config.server.port, () => {
  logger.info(`Server running in ${config.server.nodeEnv} mode on port ${config.server.port}`);
  logger.info(`API is available at: http://localhost:${config.server.port}${config.api.prefix}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});
