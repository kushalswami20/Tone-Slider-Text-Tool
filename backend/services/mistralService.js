/**
 * Mistral AI service for text tone adjustment
 */
// Change from require to dynamic import for MistralClient
// We'll create the client in the constructor with await import()
const config = require('../config');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const dotenv = require('dotenv');
dotenv.config();
const { createToneAdjustmentPrompt } = require('../utils/prompts');



class MistralService {
  constructor() {
    this.model = config.mistral.model;
    this.timeout = config.mistral.timeout;
    // We'll initialize the client in an async method
    this.client = null;
    this.initialize();
  }
  
  /**
   * Initialize the Mistral client asynchronously
   */
  async initialize() {
    try {
      const mistralModule = await import('@mistralai/mistralai');
      const MistralClient = mistralModule.default || mistralModule.MistralClient;
    
      if (!MistralClient) {
        throw new Error('MistralClient not found in module');
      }
    
      this.client = new MistralClient(process.env.MISTRAL_API_KEY); // Added this.client =
      console.log('Mistral AI client initialized successfully');
      process.removeAllListeners('warning');
  
    } catch (error) {
      console.error('Failed to initialize Mistral AI client:', error);
      this.client = null;
    }
  }

  /**
   * Ensure client is initialized
   */
  async ensureClient() {
    if (!this.client) {
      await this.initialize();
      if (!this.client) {
        throw new Error('Mistral AI client is not initialized');
      }
    }
    return this.client;
  }
  
  /**
   * Map tone value to descriptive text
   * @param {number} toneValue - Numeric tone value (0-100)
   * @returns {string} - Descriptive tone text
   */
  getToneDescription(toneValue) {
    const toneMap = [
      { max: 10, description: 'extremely formal and professional with academic language' },
      { max: 20, description: 'very formal and professional' },
      { max: 40, description: 'formal and professional' },
      { max: 60, description: 'neutral and balanced' },
      { max: 80, description: 'conversational and friendly' },
      { max: 90, description: 'casual and relaxed' },
      { max: 100, description: 'very casual, informal and colloquial' }
    ];
    
    for (const tone of toneMap) {
      if (toneValue <= tone.max) {
        return tone.description;
      }
    }
    
    return 'very casual and informal';
  }
  
  /**
   * Adjust text tone using Mistral AI
   * @param {string} text - Original text to adjust
   * @param {number} toneValue - Tone value (0-100)
   * @returns {Promise<string>} - Adjusted text
   */
  async adjustTextTone(text, toneValue) {
    try {
      // Ensure the client is initialized
      const client = await this.ensureClient();
      
      const toneDescription = this.getToneDescription(toneValue);
      const prompt = createToneAdjustmentPrompt(text, toneDescription);
      
      logger.debug(`Sending request to Mistral AI with ${text.length} chars, tone: ${toneDescription}`);
      
      // Set request timeout
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), this.timeout);
      
      // Call Mistral AI API
      const response = await client.chat({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: config.mistral.temperature,
        max_tokens: config.mistral.maxTokens,
        signal: abortController.signal
      });
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      // Extract adjusted text
      const adjustedText = response.choices[0].message.content.trim();
      
      logger.debug(`Received ${adjustedText.length} chars response from Mistral AI`);
      return adjustedText;
    } catch (error) {
      // Handle specific error types
      if (error.name === 'AbortError') {
        logger.error('Mistral AI request timed out');
        throw new ApiError(504, 'AI service request timed out');
      }
      
      // Handle API errors
      if (error.response) {
        const status = error.response.status;
        
        if (status === 429) {
          logger.warn('Mistral AI rate limit exceeded');
          throw new ApiError(429, 'AI service rate limit exceeded');
        } else if (status >= 500) {
          logger.error(`Mistral AI server error: ${status}`);
          throw new ApiError(502, 'AI service unavailable');
        }
      }
      
      // General error handling
      logger.error(`Mistral AI error: ${error.message}`);
      throw new ApiError(500, 'Failed to adjust text tone');
    }
  }
}

module.exports = new MistralService();