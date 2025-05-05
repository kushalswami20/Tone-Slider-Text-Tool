/**
 * Enhanced caching service with LRU eviction
 */
const config = require('../config');
const logger = require('../utils/logger');
const CacheItem = require('../models/CacheItem.js');

class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = config.cache.ttl;
    this.maxSize = config.cache.maxSize;
    
    // Start cleanup interval if enabled
    if (config.cache.enabled) {
      this.startCleanupInterval();
    }
    
    logger.info(`Cache initialized with TTL: ${this.ttl}ms, Max Size: ${this.maxSize} items`);
  }
  
  /**
   * Start interval to clean expired items
   */
  startCleanupInterval() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, config.cache.checkPeriod);
    
    // Cleanup on process exit
    process.on('SIGINT', () => {
      clearInterval(this.cleanupInterval);
      logger.info('Cache cleanup interval cleared');
    });
  }
  
  /**
   * Remove expired items from cache
   */
  cleanup() {
    const now = Date.now();
    let count = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.isExpired()) {
        this.cache.delete(key);
        count++;
      }
    }
    
    if (count > 0) {
      logger.debug(`Cache cleanup: removed ${count} expired items, ${this.cache.size} items remaining`);
    }
  }
  
  /**
   * Get item from cache
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null if not found
   */
  get(key) {
    if (!config.cache.enabled) return null;
    
    if (!this.cache.has(key)) {
      return null;
    }
    
    const item = this.cache.get(key);
    
    if (item.isExpired()) {
      this.cache.delete(key);
      return null;
    }
    
    // Update access time for LRU
    item.updateAccessTime();
    return item.value;
  }
  
  /**
   * Set item in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} [ttl] - Optional custom TTL
   */
  set(key, value, ttl = this.ttl) {
    if (!config.cache.enabled) return;
    
    // Enforce max size with LRU eviction
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    
    this.cache.set(key, new CacheItem(value, ttl));
  }
  
  /**
   * Remove least recently used item
   */
  evictLRU() {
    let oldestKey = null;
    let oldestAccess = Infinity;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestAccess) {
        oldestAccess = item.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      logger.debug(`Cache eviction: removed LRU item with key: ${oldestKey}`);
    }
  }
  
  /**
   * Clear entire cache
   */
  clear() {
    this.cache.clear();
    logger.info('Cache cleared');
  }
  
  /**
   * Get cache statistics
   * @returns {Object} - Cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl,
      enabled: config.cache.enabled
    };
  }
}

module.exports = new CacheService();
