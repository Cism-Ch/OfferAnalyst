/**
 * Cache Management Utility
 * 
 * Provides an in-memory caching layer with TTL (Time-To-Live) support
 * to optimize expensive AI searches, minimize latency and reduce token costs.
 */

import crypto from 'crypto';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

// Global cache store preserved across hot reloads in development
const globalForCache = globalThis as unknown as {
  offerAnalystCache?: Map<string, CacheEntry<unknown>>;
};

const memoryCache = globalForCache.offerAnalystCache ?? new Map<string, CacheEntry<unknown>>();

if (process.env.NODE_ENV !== 'production') {
  globalForCache.offerAnalystCache = memoryCache;
}

// Clean up expired items periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryCache.entries()) {
      if (entry.expiresAt <= now) {
        memoryCache.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * Generate a deterministic hash key for cached queries
 */
export function generateCacheKey(prefix: string, ...parts: unknown[]): string {
  const serialized = parts
    .map(p => (typeof p === 'object' && p !== null ? JSON.stringify(p) : String(p)))
    .join('::');

  const hash = crypto.createHash('sha256').update(serialized).digest('hex').slice(0, 16);
  return `${prefix}:${hash}`;
}

/**
 * Retrieve an item from the cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const entry = memoryCache.get(key) as CacheEntry<T> | undefined;

  if (!entry) {
    return null;
  }

  // Check TTL expiration
  if (Date.now() >= entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }

  return entry.value;
}

/**
 * Store an item in the cache with a specified TTL
 * @param key Cache key
 * @param value Data to cache
 * @param ttlSeconds Lifetime in seconds (default: 3600 = 1 hour)
 */
export async function setCache<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
  const now = Date.now();
  memoryCache.set(key, {
    value,
    createdAt: now,
    expiresAt: now + ttlSeconds * 1000,
  });
}

/**
 * Remove an item from the cache
 */
export async function deleteCache(key: string): Promise<boolean> {
  return memoryCache.delete(key);
}

/**
 * Clear all cache entries
 */
export async function clearCache(): Promise<void> {
  memoryCache.clear();
}
