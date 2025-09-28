/**
 * Simple in-memory cache utility for optimizing database queries
 * Maintains compatibility while improving performance
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Delete specific key from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
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
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Generate cache key for common patterns
   */
  static generateKey(prefix: string, ...params: (string | number | boolean)[]): string {
    return `${prefix}:${params.join(':')}`;
  }
}

// Export singleton instance
export const cache = new SimpleCache();

// Cache key generators for common use cases
export const CacheKeys = {
  // Client cache keys
  clients: (filters?: any) => CacheKeys.generateKey('clients', JSON.stringify(filters || {})),
  clientById: (id: string) => CacheKeys.generateKey('client', id),
  clientStats: () => CacheKeys.generateKey('client-stats'),
  
  // Item cache keys
  items: (filters?: any) => CacheKeys.generateKey('items', JSON.stringify(filters || {})),
  itemById: (id: string) => CacheKeys.generateKey('item', id),
  itemStats: () => CacheKeys.generateKey('item-stats'),
  
  // Category cache keys
  categories: (filters?: any) => CacheKeys.generateKey('categories', JSON.stringify(filters || {})),
  categoryById: (id: string) => CacheKeys.generateKey('category', id),
  categoryStats: () => CacheKeys.generateKey('category-stats'),
  
  // Quote cache keys
  quotes: (filters?: any) => CacheKeys.generateKey('quotes', JSON.stringify(filters || {})),
  quoteById: (id: string) => CacheKeys.generateKey('quote', id),
  quoteStats: () => CacheKeys.generateKey('quote-stats'),
  
  // Configuration cache keys
  config: (key: string) => CacheKeys.generateKey('config', key),
  configAll: () => CacheKeys.generateKey('config-all'),
  
  // Dashboard cache keys
  dashboardStats: () => CacheKeys.generateKey('dashboard-stats'),
  
  // Client quote counts (for performance optimization)
  clientQuoteCounts: () => CacheKeys.generateKey('client-quote-counts'),
  
  generateKey: SimpleCache.generateKey
};

// Cache TTL constants
export const CacheTTL = {
  SHORT: 1 * 60 * 1000,    // 1 minute
  MEDIUM: 5 * 60 * 1000,   // 5 minutes
  LONG: 15 * 60 * 1000,    // 15 minutes
  VERY_LONG: 60 * 60 * 1000 // 1 hour
};

// Helper function to invalidate related cache entries
export function invalidateRelatedCache(type: 'client' | 'item' | 'category' | 'quote' | 'config'): void {
  const keys = Array.from(cache.getStats().keys);
  
  keys.forEach(key => {
    if (key.startsWith(`${type}`) || key.includes(`${type}-`)) {
      cache.delete(key);
    }
  });
}

// Helper function to invalidate all cache
export function invalidateAllCache(): void {
  cache.clear();
}

// Auto-cleanup expired entries every 10 minutes
setInterval(() => {
  cache.clearExpired();
}, 10 * 60 * 1000);
