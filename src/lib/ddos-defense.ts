/**
 * DDoS Defense & Adaptive Rate Limiting Engine
 * 
 * Protects OfferAnalyst infrastructure against DDoS attacks, automated scraping,
 * and token resource exhaustion:
 * - Calibrated threshold: 5 requests/minute for AI searches/analyses
 * - Automatic IP Jail isolation (15-minute cooldown) for repeat offenders
 * - Dual backend: Upstash Redis with in-memory fallback
 * - Real-time telemetry for the Admin Security Center
 */

import { redis } from '@/lib/redis';

// Thresholds calibrated to user workflow:
// Filling forms and analyzing takes at least 15-20s, so max 5 searches/min per IP.
export const RATE_LIMIT_SEARCH_PER_MIN = 5;
export const BURST_TOLERANCE = 8;
export const JAIL_DURATION_SECONDS = 15 * 60; // 15 minutes
const WINDOW_SECONDS = 60;

export interface ThreatRecord {
  ip: string;
  violationsCount: number;
  reason: string;
  jailedAt: number;
  expiresAt: number;
}

export interface DdosEvaluationResult {
  allowed: boolean;
  isJailed: boolean;
  currentCount: number;
  limit: number;
  remaining: number;
  retryAfterSeconds?: number;
  reason?: string;
}

// In-memory fallback stores
const memoryCounters = new Map<string, { count: number; expiresAt: number }>();
const memoryJail = new Map<string, ThreatRecord>();

// Periodic cleanup for memory stores
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of memoryCounters.entries()) {
      if (val.expiresAt <= now) memoryCounters.delete(key);
    }
    for (const [ip, record] of memoryJail.entries()) {
      if (record.expiresAt <= now) memoryJail.delete(ip);
    }
  }, 60 * 1000).unref?.();
}

/**
 * Check and record a request from an IP for search/analysis routes
 */
export async function evaluateDdosProtection(
  clientIp: string,
  action: string = 'search_analysis'
): Promise<DdosEvaluationResult> {
  const ip = clientIp || '127.0.0.1';
  const now = Date.now();

  // 1. Check if IP is currently in Jail
  const jailed = await isIpJailed(ip);
  if (jailed) {
    const remainingSeconds = Math.max(1, Math.ceil((jailed.expiresAt - now) / 1000));
    return {
      allowed: false,
      isJailed: true,
      currentCount: RATE_LIMIT_SEARCH_PER_MIN + 1,
      limit: RATE_LIMIT_SEARCH_PER_MIN,
      remaining: 0,
      retryAfterSeconds: remainingSeconds,
      reason: `IP isolée temporairement par le bouclier anti-DDoS (${jailed.reason}). Réessayez dans ${remainingSeconds}s.`,
    };
  }

  // 2. Count requests in 60s sliding window
  let currentCount = 1;
  const countKey = `ddos:count:${ip}:${action}`;

  if (redis) {
    try {
      currentCount = await redis.incr(countKey);
      if (currentCount === 1) {
        await redis.expire(countKey, WINDOW_SECONDS);
      }
    } catch (err) {
      console.warn('[DDoS Defense] Redis incr failed, fallback to memory:', err);
      currentCount = incrementMemoryCounter(countKey, WINDOW_SECONDS);
    }
  } else {
    currentCount = incrementMemoryCounter(countKey, WINDOW_SECONDS);
  }

  // 3. Exceeded normal search threshold (5 req/min)
  if (currentCount > RATE_LIMIT_SEARCH_PER_MIN) {
    // If bursting beyond tolerance (e.g. 8+ req/min), put in Jail automatically
    if (currentCount >= BURST_TOLERANCE) {
      await jailIp(ip, `Attaque / Rafale anormale détectée (${currentCount} req/min)`);
      return {
        allowed: false,
        isJailed: true,
        currentCount,
        limit: RATE_LIMIT_SEARCH_PER_MIN,
        remaining: 0,
        retryAfterSeconds: JAIL_DURATION_SECONDS,
        reason: `Dépassement critique du seuil d'analyse (${currentCount} req/min). IP isolée pendant 15 min.`,
      };
    }

    return {
      allowed: false,
      isJailed: false,
      currentCount,
      limit: RATE_LIMIT_SEARCH_PER_MIN,
      remaining: 0,
      retryAfterSeconds: 60,
      reason: `Seuil maximal de ${RATE_LIMIT_SEARCH_PER_MIN} analyses/minute atteint pour cette IP. Veuillez patienter 1 minute.`,
    };
  }

  return {
    allowed: true,
    isJailed: false,
    currentCount,
    limit: RATE_LIMIT_SEARCH_PER_MIN,
    remaining: Math.max(0, RATE_LIMIT_SEARCH_PER_MIN - currentCount),
  };
}

/**
 * Check if IP is currently jailed
 */
export async function isIpJailed(ip: string): Promise<ThreatRecord | null> {
  const now = Date.now();

  if (redis) {
    try {
      const record = await redis.get<ThreatRecord>(`ddos:jail:${ip}`);
      if (record && record.expiresAt > now) {
        return record;
      }
      return null;
    } catch {
      // Fallback to memory
    }
  }

  const memoryRecord = memoryJail.get(ip);
  if (memoryRecord && memoryRecord.expiresAt > now) {
    return memoryRecord;
  }

  return null;
}

/**
 * Place an IP in the 15-minute temporary Jail
 */
export async function jailIp(ip: string, reason: string): Promise<ThreatRecord> {
  const now = Date.now();
  const record: ThreatRecord = {
    ip,
    violationsCount: 1,
    reason,
    jailedAt: now,
    expiresAt: now + JAIL_DURATION_SECONDS * 1000,
  };

  memoryJail.set(ip, record);

  if (redis) {
    try {
      await redis.set(`ddos:jail:${ip}`, record, { ex: JAIL_DURATION_SECONDS });
      await redis.sadd('ddos:jailed_ips_list', ip);
    } catch (err) {
      console.warn('[DDoS Defense] Failed to store jail in Redis:', err);
    }
  }

  return record;
}

/**
 * Forgive / Unblock an IP (Admin action)
 */
export async function unblockIp(ip: string): Promise<boolean> {
  memoryJail.delete(ip);
  memoryCounters.delete(`ddos:count:${ip}:search_analysis`);

  if (redis) {
    try {
      await redis.del(`ddos:jail:${ip}`);
      await redis.del(`ddos:count:${ip}:search_analysis`);
      await redis.srem('ddos:jailed_ips_list', ip);
      return true;
    } catch (err) {
      console.error('[DDoS Defense] Failed to unblock IP in Redis:', err);
      return false;
    }
  }

  return true;
}

/**
 * Get all active threat stats and list of jailed IPs for Admin Dashboard
 */
export async function getDdosThreatStats(): Promise<{
  activeJailedCount: number;
  jailedList: ThreatRecord[];
  defenseMode: 'auto';
  thresholdPerMin: number;
}> {
  const now = Date.now();
  const activeJailed: ThreatRecord[] = [];

  if (redis) {
    try {
      const ips = await redis.smembers('ddos:jailed_ips_list');
      if (Array.isArray(ips)) {
        for (const ip of ips) {
          const rec = await redis.get<ThreatRecord>(`ddos:jail:${ip}`);
          if (rec && rec.expiresAt > now) {
            activeJailed.push(rec);
          } else {
            // Expired, clean set member
            await redis.srem('ddos:jailed_ips_list', ip);
          }
        }
      }
    } catch (err) {
      console.warn('[DDoS Defense] Failed to read jailed list from Redis:', err);
    }
  }

  // Merge with memory jail if not already present
  for (const [ip, rec] of memoryJail.entries()) {
    if (rec.expiresAt > now && !activeJailed.some(j => j.ip === ip)) {
      activeJailed.push(rec);
    }
  }

  return {
    activeJailedCount: activeJailed.length,
    jailedList: activeJailed.sort((a, b) => b.jailedAt - a.jailedAt),
    defenseMode: 'auto',
    thresholdPerMin: RATE_LIMIT_SEARCH_PER_MIN,
  };
}

function incrementMemoryCounter(key: string, ttlSeconds: number): number {
  const now = Date.now();
  const existing = memoryCounters.get(key);

  if (!existing || existing.expiresAt <= now) {
    memoryCounters.set(key, { count: 1, expiresAt: now + ttlSeconds * 1000 });
    return 1;
  }

  existing.count += 1;
  return existing.count;
}

