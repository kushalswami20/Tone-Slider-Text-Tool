require('dotenv').config();

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 5001, // Make sure this matches your frontend's expectation
    nodeEnv: process.env.NODE_ENV || 'development',
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
    }
  },
  
  // API configuration
  api: {
    prefix: '/api/v1', // This should match the API_BASE_URL in your frontend
    versions: ['1.0.0'],
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: process.env.RATE_LIMIT_MAX || 100, // requests per window
      standardHeaders: true,
      legacyHeaders: false,
      message: { status: 'error', code: 429, message: 'Too many requests, please try again later' }
    }
  },
  
  // Mistral AI configuration
  mistral: {
    apiKey: process.env.MISTRAL_API_KEY,
    model: process.env.MISTRAL_MODEL || 'mistral-small',
    timeout: 30000, // 30 seconds
    temperature: 0.3,
    maxTokens: 1000
  },
  
  // Cache configuration
  cache: {
    enabled: process.env.ENABLE_CACHE !== 'false',
    ttl: parseInt(process.env.CACHE_TTL) || 30 * 60 * 1000, // 30 minutes
    maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 500,
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD) || 60 * 1000 // 1 minute
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined'
  }
};