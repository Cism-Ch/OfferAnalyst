/**
 * Tavily Web Search & Extraction Client (Multi-Key Admin Failover + BYOK)
 *
 * - Prioritizes user's BYOK 'tavily' key (DB or temporary guest key)
 * - Falls back to Admin Pool (TAVILY_API_KEY + TAVILY_API_KEY_SECONDARY) with
 *   automatic failover on saturation (1,000 free credits) or HTTP 429/432 errors
 * - Validates extracted URLs with Anti-SSRF guard before calling tavily.extract()
 * - Tracks credit consumption & FinOps telemetry
 */

import { tavily } from '@tavily/core';
import { getAPIKey, trackBYOKUsage } from '@/app/actions/shared/api-key-provider';
import { logAPIKeyUsage } from '@/app/actions/db/api-key-analytics';
import {
  getPlatformConfig,
  recordAdminTavilyCreditUsage,
  savePlatformConfig,
  type TavilyAdminSlot,
} from '@/lib/platform-config';
import { getCountryOption } from '@/lib/geo';
import { isValidWebhookUrl } from '@/lib/webhooks';
import { getCache, setCache, generateCacheKey } from '@/lib/cache';

const SOCIAL_NOISE_DOMAINS = [
  'pinterest.com',
  'pinterest.fr',
  'tiktok.com',
  'instagram.com',
];

export const TAVILY_FREE_CREDITS_LIMIT = 1000;
const TAVILY_SATURATION_THRESHOLD = 980;
const TAVILY_CREDIT_USD_ESTIMATE = 0.008;

export interface TavilyWebResult {
  title: string;
  url: string;
  content: string;
  score: number;
  publishedDate?: string;
}

export interface TavilySearchOutput {
  results: TavilyWebResult[];
  creditsUsed: number;
  keySource: 'byok' | 'temp' | 'admin_primary' | 'admin_secondary';
  responseTimeMs: number;
}

export interface TavilyExtractItem {
  url: string;
  rawContent: string;
  title?: string | null;
}

export interface TavilyAdminPoolStatus {
  primaryConfigured: boolean;
  secondaryConfigured: boolean;
  activeSlot: TavilyAdminSlot;
  effectiveSlot: 'primary' | 'secondary' | 'none';
  primaryCreditsUsed: number;
  secondaryCreditsUsed: number;
  limitPerKey: number;
}

interface ResolvedTavilyCredential {
  apiKey: string;
  source: 'byok' | 'temp' | 'admin_primary' | 'admin_secondary';
  adminSlot?: 'primary' | 'secondary';
  fallbackKey?: string;
  fallbackSlot?: 'primary' | 'secondary';
  keyId?: string;
  userId?: string;
}

async function resolveTavilyCredential(
  clientTavilyKey?: string,
  userIdHint?: string
): Promise<ResolvedTavilyCredential | null> {
  // 1. Check user's BYOK key (DB or client-provided temp key)
  const userKey = await getAPIKey('tavily', clientTavilyKey);
  if (userKey && (userKey.source === 'byok' || userKey.source === 'temp' || userKey.source === 'guest_cookie')) {
    return {
      apiKey: userKey.key,
      source: userKey.source === 'byok' ? 'byok' : 'temp',
      keyId: userKey.keyId,
      userId: userKey.userId ?? userIdHint,
    };
  }

  // 2. Admin Pool (Primary + Secondary)
  const primary = process.env.TAVILY_API_KEY?.trim() || '';
  const secondary = process.env.TAVILY_API_KEY_SECONDARY?.trim() || '';

  if (!primary && !secondary) {
    return null;
  }

  const config = await getPlatformConfig();
  const primarySaturated = config.tavilyPrimaryCreditsUsed >= TAVILY_SATURATION_THRESHOLD;

  if (config.tavilyActiveAdminSlot === 'secondary' && secondary) {
    return {
      apiKey: secondary,
      source: 'admin_secondary',
      adminSlot: 'secondary',
      fallbackKey: primary || undefined,
      fallbackSlot: primary ? 'primary' : undefined,
      userId: userIdHint,
    };
  }

  if (config.tavilyActiveAdminSlot === 'auto' && primarySaturated && secondary) {
    return {
      apiKey: secondary,
      source: 'admin_secondary',
      adminSlot: 'secondary',
      fallbackKey: primary || undefined,
      fallbackSlot: primary ? 'primary' : undefined,
      userId: userIdHint,
    };
  }

  if (primary) {
    return {
      apiKey: primary,
      source: 'admin_primary',
      adminSlot: 'primary',
      fallbackKey: secondary || undefined,
      fallbackSlot: secondary ? 'secondary' : undefined,
      userId: userIdHint,
    };
  }

  return {
    apiKey: secondary,
    source: 'admin_secondary',
    adminSlot: 'secondary',
    userId: userIdHint,
  };
}

function isQuotaOrRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
  return (
    msg.includes('429') ||
    msg.includes('432') ||
    msg.includes('limit') ||
    msg.includes('quota') ||
    msg.includes('credit') ||
    msg.includes('exceeded')
  );
}

/**
 * Inspect Admin Tavily key pool health & estimated credits (without exposing keys).
 */
export async function getTavilyAdminPoolStatus(): Promise<TavilyAdminPoolStatus> {
  const primaryConfigured = Boolean(process.env.TAVILY_API_KEY?.trim());
  const secondaryConfigured = Boolean(process.env.TAVILY_API_KEY_SECONDARY?.trim());
  const config = await getPlatformConfig();

  let effectiveSlot: 'primary' | 'secondary' | 'none' = 'none';
  if (config.tavilyActiveAdminSlot === 'secondary' && secondaryConfigured) {
    effectiveSlot = 'secondary';
  } else if (
    config.tavilyActiveAdminSlot === 'auto' &&
    config.tavilyPrimaryCreditsUsed >= TAVILY_SATURATION_THRESHOLD &&
    secondaryConfigured
  ) {
    effectiveSlot = 'secondary';
  } else if (primaryConfigured) {
    effectiveSlot = 'primary';
  } else if (secondaryConfigured) {
    effectiveSlot = 'secondary';
  }

  return {
    primaryConfigured,
    secondaryConfigured,
    activeSlot: config.tavilyActiveAdminSlot,
    effectiveSlot,
    primaryCreditsUsed: config.tavilyPrimaryCreditsUsed,
    secondaryCreditsUsed: config.tavilySecondaryCreditsUsed,
    limitPerKey: TAVILY_FREE_CREDITS_LIMIT,
  };
}

/**
 * Check if any Tavily key (BYOK or Admin) is available for the current request.
 */
export async function hasTavilyAvailability(clientTavilyKey?: string): Promise<boolean> {
  const cred = await resolveTavilyCredential(clientTavilyKey);
  return Boolean(cred?.apiKey);
}

/**
 * Search real-time web offers & market context using Tavily.
 */
export async function searchWebOffers(
  query: string,
  options: {
    country?: string;
    language?: 'fr' | 'en' | 'auto';
    searchDepth?: 'basic' | 'advanced';
    maxResults?: number;
    excludeSocialNoise?: boolean;
    bypassCache?: boolean;
    clientTavilyKey?: string;
    userId?: string;
    actionName?: string;
  } = {}
): Promise<TavilySearchOutput> {
  const startedAt = Date.now();
  const cred = await resolveTavilyCredential(options.clientTavilyKey, options.userId);
  if (!cred) {
    throw new Error('TAVILY_API_KEY_MISSING');
  }

  const depth = options.searchDepth ?? 'advanced';
  const maxResults = Math.min(15, Math.max(3, options.maxResults ?? 8));
  const countryOpt = getCountryOption(options.country);
  const excludeSocialNoise = Boolean(options.excludeSocialNoise);
  const effectiveLanguage =
    options.language === 'fr' || options.language === 'en'
      ? options.language
      : options.language === 'auto' || countryOpt.code === 'INTL'
        ? undefined
        : countryOpt.tavilyLanguage;

  const cacheKey = generateCacheKey(
    'tavily_search_v2',
    depth,
    countryOpt.code,
    effectiveLanguage || 'auto',
    excludeSocialNoise ? 'no_social' : 'all',
    query.trim()
  );

  if (!options.bypassCache) {
    const cachedResults = await getCache<TavilyWebResult[]>(cacheKey).catch(() => null);
    if (cachedResults && Array.isArray(cachedResults) && cachedResults.length > 0) {
      return {
        results: cachedResults,
        creditsUsed: 0,
        keySource: cred.source,
        responseTimeMs: Date.now() - startedAt,
      };
    }
  }

  const buildLocalizedQuery = (forceAppendCountry: boolean): string => {
    if (countryOpt.code === 'INTL') return query;
    const needsHint = forceAppendCountry || !countryOpt.tavilyCountry;
    if (!needsHint) return query;
    const lower = query.toLowerCase();
    if (
      lower.includes(countryOpt.labelFr.toLowerCase()) ||
      lower.includes(countryOpt.labelEn.toLowerCase())
    ) {
      return query;
    }
    const localizedCountry =
      effectiveLanguage === 'en' ? countryOpt.labelEn : countryOpt.labelFr;
    return `${query} ${localizedCountry}`;
  };

  const runSearch = async (apiKey: string, allowCountryParam = true) => {
    const client = tavily({ apiKey });
    const useCountryParam = allowCountryParam && Boolean(countryOpt.tavilyCountry);
    const effectiveQuery = buildLocalizedQuery(!useCountryParam);
    const baseParams = {
      searchDepth: depth,
      topic: 'general' as const,
      maxResults,
      includeAnswer: false as const,
      includeRawContent: false as const,
      includeUsage: true,
      timeout: 20,
      ...(depth === 'advanced' ? { chunksPerSource: 3 } : {}),
      ...(excludeSocialNoise ? { excludeDomains: SOCIAL_NOISE_DOMAINS } : {}),
      ...(effectiveLanguage ? { language: effectiveLanguage } : {}),
    };

    try {
      return await client.search(effectiveQuery, {
        ...baseParams,
        ...(useCountryParam && countryOpt.tavilyCountry
          ? { country: countryOpt.tavilyCountry }
          : {}),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
      // Defensive fallback if Tavily rejects an unsupported `country` enum value
      if (useCountryParam && msg.includes('country')) {
        return client.search(buildLocalizedQuery(true), baseParams);
      }
      throw err;
    }
  };

  let activeSource = cred.source;
  let activeSlot = cred.adminSlot;
  let response;

  try {
    response = await runSearch(cred.apiKey);
  } catch (primaryErr) {
    if (cred.fallbackKey && cred.fallbackSlot && isQuotaOrRateLimitError(primaryErr)) {
      // Automatic failover to secondary admin key when primary saturates
      if (cred.adminSlot === 'primary') {
        await savePlatformConfig({
          tavilyPrimaryCreditsUsed: TAVILY_FREE_CREDITS_LIMIT,
          tavilyActiveAdminSlot: 'secondary',
        }).catch(() => {});
      }
      response = await runSearch(cred.fallbackKey);
      activeSlot = cred.fallbackSlot;
      activeSource = cred.fallbackSlot === 'secondary' ? 'admin_secondary' : 'admin_primary';
    } else {
      await logAPIKeyUsage(cred.userId, cred.keyId, 'tavily', options.actionName || 'tavily_search', {
        model: `tavily:${depth}`,
        success: false,
        errorMessage: primaryErr instanceof Error ? primaryErr.message : String(primaryErr),
        responseTime: Date.now() - startedAt,
      }).catch(() => {});
      throw primaryErr;
    }
  }

  const creditsUsed = response.usage?.credits ?? (depth === 'advanced' ? 2 : 1);
  const latencyMs = Date.now() - startedAt;

  // Record FinOps telemetry & credit accounting
  if (activeSource === 'byok' && cred.keyId) {
    await trackBYOKUsage(cred.keyId).catch(() => {});
  } else if (activeSlot) {
    await recordAdminTavilyCreditUsage(activeSlot, creditsUsed);
  }

  await logAPIKeyUsage(cred.userId, cred.keyId, 'tavily', options.actionName || 'tavily_search', {
    model: `tavily:${depth}`,
    tokensUsed: creditsUsed,
    costUsd: Number((creditsUsed * TAVILY_CREDIT_USD_ESTIMATE).toFixed(5)),
    statusCode: 200,
    success: true,
    responseTime: latencyMs,
  }).catch(() => {});

  const results: TavilyWebResult[] = (response.results || []).map((r) => ({
    title: r.title || 'Offre web',
    url: r.url,
    content: r.content || '',
    score: typeof r.score === 'number' ? r.score : 0.5,
    publishedDate: r.publishedDate,
  }));

  if (results.length > 0 && !options.bypassCache) {
    await setCache(cacheKey, results, 1800).catch(() => {});
  }

  return {
    results,
    creditsUsed,
    keySource: activeSource,
    responseTimeMs: latencyMs,
  };
}

/**
 * Extract clean structured content from user-supplied URLs with Anti-SSRF validation.
 */
export async function extractUrlsContent(
  urls: string[],
  options: {
    clientTavilyKey?: string;
    userId?: string;
  } = {}
): Promise<{ items: TavilyExtractItem[]; creditsUsed: number }> {
  const startedAt = Date.now();
  const safeUrls = urls
    .map((u) => u.trim())
    .filter((u) => u.length > 0 && isValidWebhookUrl(u))
    .slice(0, 5);

  if (safeUrls.length === 0) {
    return { items: [], creditsUsed: 0 };
  }

  const cred = await resolveTavilyCredential(options.clientTavilyKey, options.userId);
  if (!cred) {
    throw new Error('TAVILY_API_KEY_MISSING');
  }

  const client = tavily({ apiKey: cred.apiKey });
  const response = await client.extract(safeUrls, {
    extractDepth: 'basic',
    format: 'markdown',
    includeUsage: true,
    timeout: 20,
  });

  const creditsUsed = response.usage?.credits ?? Math.max(1, Math.ceil(safeUrls.length / 5));

  if (cred.source === 'byok' && cred.keyId) {
    await trackBYOKUsage(cred.keyId).catch(() => {});
  } else if (cred.adminSlot) {
    await recordAdminTavilyCreditUsage(cred.adminSlot, creditsUsed);
  }

  await logAPIKeyUsage(cred.userId, cred.keyId, 'tavily', 'tavily_extract', {
    model: 'tavily:extract',
    tokensUsed: creditsUsed,
    costUsd: Number((creditsUsed * TAVILY_CREDIT_USD_ESTIMATE).toFixed(5)),
    statusCode: 200,
    success: true,
    responseTime: Date.now() - startedAt,
  }).catch(() => {});

  return {
    items: (response.results || []).map((item) => ({
      url: item.url,
      rawContent: item.rawContent || '',
      title: item.title,
    })),
    creditsUsed,
  };
}
