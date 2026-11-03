/**
 * Upstash Redis Client Singleton
 * 
 * Provides a resilient Redis client for rate limiting, DDoS protection,
 * and high-performance distributed caching.
 * Falls back safely to in-memory operations if Redis credentials are not configured.
 */

import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const isRedisConfigured = Boolean(url && token);

let redisInstance: Redis | null = null;

if (isRedisConfigured) {
  try {
    redisInstance = new Redis({
      url: url!,
      token: token!,
    });
  } catch (err) {
    console.warn('[Redis] Failed to initialize Upstash Redis client:', err);
    redisInstance = null;
  }
}

export const redis = redisInstance;

/**
 * Ping Redis and calculate latency
 */
export async function pingRedis(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  if (!redis) {
    return { ok: false, latencyMs: 0, error: 'Redis non configuré (UPSTASH_REDIS_REST_URL manquant)' };
  }

  const start = Date.now();
  try {
    await redis.ping();
    return { ok: true, latencyMs: Date.now() - start };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : 'Erreur de connexion Redis',
    };
  }
}

