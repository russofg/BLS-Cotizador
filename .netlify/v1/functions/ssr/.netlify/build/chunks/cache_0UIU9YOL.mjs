class SimpleCache {
  cache = /* @__PURE__ */ new Map();
  DEFAULT_TTL = 5 * 60 * 1e3;
  // 5 minutes
  MAX_SIZE = 500;
  // Maximum number of items in cache
  /**
   * Get data from cache
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.data;
  }
  /**
   * Set data in cache with LRU eviction
   */
  set(key, data, ttl = this.DEFAULT_TTL) {
    if (!this.cache.has(key) && this.cache.size >= this.MAX_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.delete(key);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  /**
   * Delete specific key from cache
   */
  delete(key) {
    this.cache.delete(key);
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
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
  /**
   * Generate cache key for common patterns
   */
  static generateKey(prefix, ...params) {
    return `${prefix}:${params.join(":")}`;
  }
}
const cache = new SimpleCache();
const CacheKeys = {
  // Client cache keys
  clients: (filters) => CacheKeys.generateKey("clients", JSON.stringify(filters || {})),
  clientById: (id) => CacheKeys.generateKey("client", id),
  clientStats: () => CacheKeys.generateKey("client-stats"),
  // Item cache keys
  items: (filters) => CacheKeys.generateKey("items", JSON.stringify(filters || {})),
  itemById: (id) => CacheKeys.generateKey("item", id),
  itemStats: () => CacheKeys.generateKey("item-stats"),
  // Analytics cache keys
  analytics: (type) => CacheKeys.generateKey("analytics", type),
  // Category cache keys
  categories: (filters) => CacheKeys.generateKey("categories", JSON.stringify(filters || {})),
  categoryById: (id) => CacheKeys.generateKey("category", id),
  categoryStats: () => CacheKeys.generateKey("category-stats"),
  // Quote cache keys
  quotes: (filters) => CacheKeys.generateKey("quotes", JSON.stringify(filters || {})),
  quoteById: (id) => CacheKeys.generateKey("quote", id),
  quoteStats: () => CacheKeys.generateKey("quote-stats"),
  // Configuration cache keys
  config: (key) => CacheKeys.generateKey("config", key),
  configAll: () => CacheKeys.generateKey("config-all"),
  // Dashboard cache keys
  dashboardStats: () => CacheKeys.generateKey("dashboard-stats"),
  // Client quote counts (for performance optimization)
  clientQuoteCounts: () => CacheKeys.generateKey("client-quote-counts"),
  generateKey: SimpleCache.generateKey
};
const CacheTTL = {
  SHORT: 1 * 60 * 1e3,
  // 1 minute
  MEDIUM: 5 * 60 * 1e3,
  // 5 minutes
  LONG: 15 * 60 * 1e3,
  // 15 minutes
  VERY_LONG: 60 * 60 * 1e3
  // 1 hour
};
function invalidateRelatedCache(type) {
  const keys = Array.from(cache.getStats().keys);
  keys.forEach((key) => {
    if (key.startsWith(`${type}`) || key.includes(`${type}-`)) {
      cache.delete(key);
    }
  });
}
setInterval(() => {
  cache.clearExpired();
}, 10 * 60 * 1e3);

export { CacheTTL as C, CacheKeys as a, cache as c, invalidateRelatedCache as i };
