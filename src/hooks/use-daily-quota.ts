'use client';

/**
 * Deduplicated Daily Quota Hook
 * 
 * Provides centralized access to the user's daily search quota.
 * Automatically deduplicates parallel in-flight server action calls (e.g. Header + Sidebar + Page mount)
 * and synchronizes across all mounted components via a shared in-memory pub-sub store and 
 * the window 'offeranalyst:quota_updated' custom event.
 */

import { useState, useEffect, useCallback, useTransition } from 'react';
import { getDailyQuotaAction, type DailyQuotaResult } from '@/app/actions/shared/quota-limiter';

// Shared singleton store state across all hook instances
let cachedQuota: DailyQuotaResult | null = null;
let inFlightPromise: Promise<DailyQuotaResult | null> | null = null;
const subscribers = new Set<(q: DailyQuotaResult | null) => void>();
let isGlobalListenerAttached = false;
let lastKnownByok = false;

/**
 * Executes a deduplicated fetch of the daily quota.
 * Multiple simultaneous calls share the exact same in-flight Promise.
 */
async function fetchSharedQuota(hasLocalByok: boolean, force = false): Promise<DailyQuotaResult | null> {
    lastKnownByok = hasLocalByok;

    // Return in-flight promise if one is already running and force is not explicitly requested
    if (inFlightPromise && !force) {
        return inFlightPromise;
    }

    inFlightPromise = (async () => {
        try {
            const res = await getDailyQuotaAction(hasLocalByok);
            if (res.success && res.data) {
                cachedQuota = res.data;
                // Notify all subscribed components
                subscribers.forEach((callback) => {
                    try {
                        callback(cachedQuota);
                    } catch {
                        // Ignore subscriber errors
                    }
                });
                return cachedQuota;
            }
            return cachedQuota;
        } catch {
            return cachedQuota;
        } finally {
            inFlightPromise = null;
        }
    })();

    return inFlightPromise;
}

/**
 * Attaches the window event listener once at the module level
 */
function ensureGlobalListener() {
    if (typeof window === 'undefined' || isGlobalListenerAttached) return;

    window.addEventListener('offeranalyst:quota_updated', () => {
        // Trigger a forced deduplicated refresh for all listeners
        fetchSharedQuota(lastKnownByok, true);
    });

    isGlobalListenerAttached = true;
}

export function useDailyQuota(hasLocalByok = false) {
    const [quota, setQuota] = useState<DailyQuotaResult | null>(cachedQuota);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        ensureGlobalListener();

        const handleUpdate = (newQuota: DailyQuotaResult | null) => {
            startTransition(() => {
                setQuota(newQuota);
            });
        };

        subscribers.add(handleUpdate);

        // Fetch once on mount or reuse cached value
        fetchSharedQuota(hasLocalByok);

        return () => {
            subscribers.delete(handleUpdate);
        };
    }, [hasLocalByok]);

    const refreshQuota = useCallback(() => {
        return fetchSharedQuota(hasLocalByok, true);
    }, [hasLocalByok]);

    return {
        quota,
        isPending,
        refreshQuota,
        isQuotaExhausted: Boolean(quota && !quota.isByok && quota.remaining <= 0),
    };
}
