/**
 * Cache item model
 */
class CacheItem {
    constructor(value, ttl) {
      this.value = value;
      this.expiry = Date.now() + ttl;
      this.lastAccessed = Date.now();
    }
    
    isExpired() {
      return Date.now() > this.expiry;
    }
    
    updateAccessTime() {
      this.lastAccessed = Date.now();
      return this;
    }
  }
  
  module.exports = CacheItem;