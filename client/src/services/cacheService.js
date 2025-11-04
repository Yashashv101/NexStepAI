/**
 * Client-side caching service for optimized data fetching
 * Provides in-memory caching with TTL (Time To Live) support
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
  }

  /**
   * Generate cache key from function name and parameters
   */
  generateKey(functionName, params = {}) {
    const paramString = JSON.stringify(params);
    return `${functionName}_${paramString}`;
  }

  /**
   * Set cache entry with TTL
   */
  set(key, data, ttl = this.defaultTTL) {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, {
      data,
      expiresAt,
      createdAt: Date.now()
    });
  }

  /**
   * Get cache entry if not expired
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Check if cache entry exists and is valid
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Clear specific cache entry
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries
    };
  }

  /**
   * Cached API call wrapper
   */
  async cachedCall(apiFunction, params = {}, options = {}) {
    const { ttl = this.defaultTTL, forceRefresh = false } = options;
    const key = this.generateKey(apiFunction.name, params);

    // Return cached data if available and not forcing refresh
    if (!forceRefresh && this.has(key)) {
      return this.get(key);
    }

    try {
      // Make API call
      const data = await apiFunction(params);
      
      // Cache the result
      this.set(key, data, ttl);
      
      return data;
    } catch (error) {
      // If we have stale data and the API call fails, return stale data
      const staleData = this.cache.get(key);
      if (staleData) {
        console.warn('API call failed, returning stale data:', error);
        return staleData.data;
      }
      
      throw error;
    }
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Preload data into cache
   */
  async preload(apiFunction, params = {}, ttl = this.defaultTTL) {
    const key = this.generateKey(apiFunction.name, params);
    
    try {
      const data = await apiFunction(params);
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      console.error('Failed to preload cache:', error);
      throw error;
    }
  }
}

// Create singleton instance
const cacheService = new CacheService();

// Auto-cleanup expired entries every 10 minutes
setInterval(() => {
  cacheService.clearExpired();
}, 10 * 60 * 1000);

export default cacheService;

// Cache TTL constants for different data types
export const CACHE_TTL = {
  USER_PROFILE: 10 * 60 * 1000,      // 10 minutes
  DASHBOARD_STATS: 2 * 60 * 1000,    // 2 minutes
  NOTIFICATIONS: 1 * 60 * 1000,      // 1 minute
  ACTIVITIES: 5 * 60 * 1000,         // 5 minutes
  ROADMAPS: 15 * 60 * 1000,          // 15 minutes
  PROGRESS: 30 * 1000,               // 30 seconds
  GOALS: 30 * 60 * 1000,             // 30 minutes
  RESOURCES: 60 * 60 * 1000          // 1 hour
};