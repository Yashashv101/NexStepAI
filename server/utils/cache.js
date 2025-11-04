/**
 * Simple in-memory cache with TTL (Time To Live) support
 * Used for caching frequently accessed analytics data
 */

class Cache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Set a value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
   */
  set(key, value, ttl = 5 * 60 * 1000) {
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set the value
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);

    this.timers.set(key, timer);
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if not found/expired
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }
    return item.value;
  }

  /**
   * Check if a key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Delete a key from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    // Clear timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    
    // Remove from cache
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    
    this.timers.clear();
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: process.memoryUsage()
    };
  }

  /**
   * Get or set pattern - if key exists, return it, otherwise compute and cache
   * @param {string} key - Cache key
   * @param {function} computeFn - Function to compute value if not cached
   * @param {number} ttl - Time to live in milliseconds
   * @returns {Promise<any>} Cached or computed value
   */
  async getOrSet(key, computeFn, ttl = 5 * 60 * 1000) {
    if (this.has(key)) {
      return this.get(key);
    }

    const value = await computeFn();
    this.set(key, value, ttl);
    return value;
  }
}

// Create singleton instance
const cache = new Cache();

// Cache key generators
const generateCacheKey = {
  analyticsDashboard: (timeRange) => `analytics:dashboard:${timeRange}`,
  adminStats: () => 'admin:stats',
  userGrowth: (timeRange) => `analytics:user-growth:${timeRange}`,
  goalCompletion: (timeRange) => `analytics:goal-completion:${timeRange}`,
  recentActivities: () => 'analytics:recent-activities'
};

module.exports = {
  cache,
  generateCacheKey
};