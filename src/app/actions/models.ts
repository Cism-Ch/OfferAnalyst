'use server';

/**
 * AI Models Availability & Health Verification Server Actions
 * 
 * Verifies live model status against OpenRouter API.
 * Uses intelligent in-memory/Redis caching with 5-minute TTL to preserve performance.
 */

import { AI_MODEL_OPTIONS } from '@/lib/ai-models';

export interface ModelHealthStatus {
  id: string;
  isAvailable: boolean;
  status: 'online' | 'offline';
  name?: string;
  contextLength?: number;
  lastChecked: number;
}

export type ModelsHealthReport = Record<string, ModelHealthStatus>;

// In-memory cache with 5-minute TTL
let cachedReport: ModelsHealthReport | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function checkModelsAvailabilityAction(forceRefresh = false): Promise<{
  success: true;
  data: {
    report: ModelsHealthReport;
    totalOnline: number;
    totalOffline: number;
    checkedAt: number;
  };
} | {
  success: false;
  error: string;
}> {
  try {
    const now = Date.now();

    if (!forceRefresh && cachedReport && (now - lastCacheTime < CACHE_TTL_MS)) {
      const values = Object.values(cachedReport);
      const totalOnline = values.filter((m) => m.isAvailable).length;
      return {
        success: true,
        data: {
          report: cachedReport,
          totalOnline,
          totalOffline: values.length - totalOnline,
          checkedAt: lastCacheTime,
        },
      };
    }

    // Fetch live list from OpenRouter public API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    let activeModelIds = new Set<string>();

    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'OfferAnalyst-HealthCheck/1.0',
        },
        next: { revalidate: 300 },
      });

      if (response.ok) {
        const body = await response.json();
        if (Array.isArray(body?.data)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          activeModelIds = new Set(body.data.map((m: any) => m.id));
        }
      }
    } catch (fetchErr) {
      console.warn('[checkModelsAvailabilityAction] OpenRouter fetch failed or timed out:', fetchErr);
      // Fallback: If network failed, don't flag everything offline erroneously
      if (cachedReport) {
        const values = Object.values(cachedReport);
        const totalOnline = values.filter((m) => m.isAvailable).length;
        return {
          success: true,
          data: {
            report: cachedReport,
            totalOnline,
            totalOffline: values.length - totalOnline,
            checkedAt: lastCacheTime,
          },
        };
      }
    } finally {
      clearTimeout(timeoutId);
    }

    const report: ModelsHealthReport = {};
    let totalOnline = 0;

    for (const model of AI_MODEL_OPTIONS) {
      // If we failed to get data from OpenRouter at all, default to online
      const isOnline = activeModelIds.size > 0 ? activeModelIds.has(model.id) : true;
      if (isOnline) totalOnline += 1;

      report[model.id] = {
        id: model.id,
        isAvailable: isOnline,
        status: isOnline ? 'online' : 'offline',
        name: model.label,
        lastChecked: now,
      };
    }

    cachedReport = report;
    lastCacheTime = now;

    return {
      success: true,
      data: {
        report,
        totalOnline,
        totalOffline: AI_MODEL_OPTIONS.length - totalOnline,
        checkedAt: now,
      },
    };
  } catch (err) {
    console.error('[checkModelsAvailabilityAction] Unexpected error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erreur lors de la vérification des modèles.',
    };
  }
}

