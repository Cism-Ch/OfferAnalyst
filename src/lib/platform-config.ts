/**
 * Dynamic Platform Configuration (PostgreSQL SystemConfig + Upstash Redis Cache)
 *
 * Centralizes hot-reconfigurable settings controlled from the Admin Dashboard:
 * - Free Tier daily quota limit (default: 5 searches/day)
 * - Quota warning banner visibility & bilingual messages
 * - Tavily Admin key rotation slot ('auto' | 'primary' | 'secondary') & credit counters
 */

import { prisma } from '@/lib/prisma';
import { getCache, setCache, deleteCache } from '@/lib/cache';
import {
  DEFAULT_PLATFORM_CONFIG,
  type PlatformQuotaConfig,
  type TavilyAdminSlot,
} from '@/lib/platform-config-shared';

export {
  DEFAULT_PLATFORM_CONFIG,
  type PlatformQuotaConfig,
  type TavilyAdminSlot,
};

const CACHE_KEY = 'platform:config:v1';

const CONFIG_KEYS = {
  freeTierDailyQuota: 'free_tier_daily_quota',
  quotaBannerEnabled: 'quota_banner_enabled',
  quotaBannerMessageFr: 'quota_banner_message_fr',
  quotaBannerMessageEn: 'quota_banner_message_en',
  tavilyActiveAdminSlot: 'tavily_active_admin_slot',
  tavilyPrimaryCreditsUsed: 'tavily_primary_credits_used',
  tavilySecondaryCreditsUsed: 'tavily_secondary_credits_used',
} as const;

/**
 * Load platform configuration from Redis cache or PostgreSQL SystemConfig.
 */
export async function getPlatformConfig(): Promise<PlatformQuotaConfig> {
  const cached = await getCache<PlatformQuotaConfig>(CACHE_KEY);
  if (cached) {
    return cached;
  }

  const config: PlatformQuotaConfig = { ...DEFAULT_PLATFORM_CONFIG };

  try {
    const rows = await prisma.systemConfig.findMany({
      where: {
        key: { in: Object.values(CONFIG_KEYS) },
      },
    });

    const map = new Map<string, string>(rows.map((r) => [r.key, r.value]));

    const rawQuota = map.get(CONFIG_KEYS.freeTierDailyQuota);
    if (rawQuota) {
      const parsed = parseInt(rawQuota, 10);
      if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 1000) {
        config.freeTierDailyQuota = parsed;
      }
    }

    const rawEnabled = map.get(CONFIG_KEYS.quotaBannerEnabled);
    if (rawEnabled !== undefined) {
      config.quotaBannerEnabled = rawEnabled === 'true';
    }

    const msgFr = map.get(CONFIG_KEYS.quotaBannerMessageFr);
    if (msgFr && msgFr.trim().length > 0) config.quotaBannerMessageFr = msgFr;

    const msgEn = map.get(CONFIG_KEYS.quotaBannerMessageEn);
    if (msgEn && msgEn.trim().length > 0) config.quotaBannerMessageEn = msgEn;

    const slot = map.get(CONFIG_KEYS.tavilyActiveAdminSlot);
    if (slot === 'auto' || slot === 'primary' || slot === 'secondary') {
      config.tavilyActiveAdminSlot = slot;
    }

    const c1 = map.get(CONFIG_KEYS.tavilyPrimaryCreditsUsed);
    if (c1) {
      const n = parseInt(c1, 10);
      if (!Number.isNaN(n) && n >= 0) config.tavilyPrimaryCreditsUsed = n;
    }

    const c2 = map.get(CONFIG_KEYS.tavilySecondaryCreditsUsed);
    if (c2) {
      const n = parseInt(c2, 10);
      if (!Number.isNaN(n) && n >= 0) config.tavilySecondaryCreditsUsed = n;
    }
  } catch {
    // Graceful fallback to defaults if DB temporarily unreachable
  }

  await setCache(CACHE_KEY, config, 60).catch(() => {});
  return config;
}

/**
 * Persist partial platform config updates to PostgreSQL SystemConfig and refresh cache.
 */
export async function savePlatformConfig(
  updates: Partial<PlatformQuotaConfig>
): Promise<PlatformQuotaConfig> {
  const upserts: Array<{ key: string; value: string }> = [];

  if (updates.freeTierDailyQuota !== undefined) {
    upserts.push({
      key: CONFIG_KEYS.freeTierDailyQuota,
      value: String(Math.max(1, Math.min(1000, Math.round(updates.freeTierDailyQuota)))),
    });
  }
  if (updates.quotaBannerEnabled !== undefined) {
    upserts.push({
      key: CONFIG_KEYS.quotaBannerEnabled,
      value: String(Boolean(updates.quotaBannerEnabled)),
    });
  }
  if (updates.quotaBannerMessageFr !== undefined) {
    upserts.push({
      key: CONFIG_KEYS.quotaBannerMessageFr,
      value: updates.quotaBannerMessageFr.trim(),
    });
  }
  if (updates.quotaBannerMessageEn !== undefined) {
    upserts.push({
      key: CONFIG_KEYS.quotaBannerMessageEn,
      value: updates.quotaBannerMessageEn.trim(),
    });
  }
  if (updates.tavilyActiveAdminSlot !== undefined) {
    upserts.push({
      key: CONFIG_KEYS.tavilyActiveAdminSlot,
      value: updates.tavilyActiveAdminSlot,
    });
  }
  if (updates.tavilyPrimaryCreditsUsed !== undefined) {
    upserts.push({
      key: CONFIG_KEYS.tavilyPrimaryCreditsUsed,
      value: String(Math.max(0, Math.round(updates.tavilyPrimaryCreditsUsed))),
    });
  }
  if (updates.tavilySecondaryCreditsUsed !== undefined) {
    upserts.push({
      key: CONFIG_KEYS.tavilySecondaryCreditsUsed,
      value: String(Math.max(0, Math.round(updates.tavilySecondaryCreditsUsed))),
    });
  }

  await Promise.all(
    upserts.map((entry) =>
      prisma.systemConfig.upsert({
        where: { key: entry.key },
        update: { value: entry.value },
        create: { key: entry.key, value: entry.value },
      })
    )
  );

  await deleteCache(CACHE_KEY);
  return getPlatformConfig();
}

/**
 * Increment consumed credit counter for an Admin Tavily key slot.
 */
export async function recordAdminTavilyCreditUsage(
  slot: 'primary' | 'secondary',
  credits: number
): Promise<void> {
  if (credits <= 0) return;
  try {
    const current = await getPlatformConfig();
    if (slot === 'primary') {
      await savePlatformConfig({
        tavilyPrimaryCreditsUsed: current.tavilyPrimaryCreditsUsed + credits,
      });
    } else {
      await savePlatformConfig({
        tavilySecondaryCreditsUsed: current.tavilySecondaryCreditsUsed + credits,
      });
    }
  } catch {
    // Telemetry should never break execution
  }
}
