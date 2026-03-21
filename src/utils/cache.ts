/**
 * Simple caching utility using localStorage with TTL (Time To Live)
 */

interface CacheItem<T> {
  data: T;
  expiry: number;
}

export const cache = {
  /**
   * Set data in cache
   * @param key Cache key
   * @param data Data to store
   * @param ttl Time to live in milliseconds (default 5 minutes)
   */
  set: <T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void => {
    const item: CacheItem<T> = {
      data,
      expiry: Date.now() + ttl,
    };
    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
      console.warn('Cache set failed (likely quota exceeded):', e);
    }
  },

  /**
   * Get data from cache
   * @param key Cache key
   * @returns Data if found and not expired, otherwise null
   */
  get: <T>(key: string): T | null => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
      const item: CacheItem<T> = JSON.parse(itemStr);
      if (Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return item.data;
    } catch (e) {
      localStorage.removeItem(key);
      return null;
    }
  },

  /**
   * Remove item from cache
   * @param key Cache key
   */
  remove: (key: string): void => {
    localStorage.removeItem(key);
  },

  /**
   * Clear all cache items
   */
  clear: (): void => {
    localStorage.clear();
  }
};
