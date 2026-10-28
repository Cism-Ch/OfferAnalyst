'use server';

/**
 * Quota Limiter Utility & Server Actions
 * 
 * Enforces a strict 10 searches per day limit on free model usage.
 * - Identifier: guest cookie ('offeranalyst.guest_id') with IP fallback, or session user ID for authenticated users.
 * - Window: UTC calendar day (quota:daily:YYYY-MM-DD:identifier).
 * - Bypass: Users with an active BYOK key (in database or guest 24h encrypted cookie) bypass the 10-search limit.
 */

import { cookies, headers } from 'next/headers';

export const GUEST_ID_COOKIE_NAME = 'offeranalyst.guest_id';
export const DAILY_QUOTA_LIMIT = 10;

// Persistent in-memory quota store across Next.js HMR reloads
const globalQuota = globalThis as unknown as {
    __offeranalyst_daily_quota_store?: Map<string, number>;
};
const quotaStore = globalQuota.__offeranalyst_daily_quota_store ?? (globalQuota.__offeranalyst_daily_quota_store = new Map<string, number>());

export interface DailyQuotaResult {
    used: number;
    total: number;
    remaining: number;
    resetAt: string;
    isByok: boolean;
}

/**
 * Return current UTC date string (YYYY-MM-DD) and ISO timestamp for next midnight UTC.
 */
export function getUtcDayInfo(): { dateUtc: string; resetAt: string } {
    const now = new Date();
    const dateUtc = now.toISOString().split('T')[0];
    const tomorrowUtc = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
        0, 0, 0, 0
    ));
    return {
        dateUtc,
        resetAt: tomorrowUtc.toISOString()
    };
}

/**
 * Resolve client identifier:
 * 1) Authenticated user ID (user:<id>)
 * 2) Guest cookie (guest:<uuid>)
 * 3) IP fallback (guest:ip_<ip>)
 */
export async function resolveClientQuotaIdentifier(): Promise<{
    identifier: string;
    isGuest: boolean;
    userId?: string;
}> {
    // 1. Check authenticated session
    try {
        const { auth } = await import('@/lib/auth');
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (session?.user?.id) {
            return {
                identifier: `user:${session.user.id}`,
                isGuest: false,
                userId: session.user.id
            };
        }
    } catch {
        // Continue to guest resolution
    }

    // 2. Check or set persistent guest cookie
    let guestId: string | undefined;
    try {
        const cookieStore = await cookies();
        const existing = cookieStore.get(GUEST_ID_COOKIE_NAME);
        if (existing?.value) {
            guestId = existing.value;
        } else {
            guestId = crypto.randomUUID();
            cookieStore.set(GUEST_ID_COOKIE_NAME, guestId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 365 * 24 * 3600, // 1 year
                path: '/'
            });
        }
    } catch {
        // Header/cookie mutations might fail in some read-only phases
    }

    // 3. Fallback to IP address if cookie was inaccessible
    if (!guestId) {
        try {
            const headerStore = await headers();
            const forwarded = headerStore.get('x-forwarded-for');
            const realIp = headerStore.get('x-real-ip');
            const ip = forwarded ? forwarded.split(',')[0].trim() : (realIp || 'anonymous_guest');
            guestId = `ip_${ip}`;
        } catch {
            guestId = 'anonymous_guest';
        }
    }

    return {
        identifier: `guest:${guestId}`,
        isGuest: true
    };
}

/**
 * Check whether the active user or guest currently has a personal BYOK key available.
 */
export async function hasActiveByokKey(): Promise<boolean> {
    // 1. Check authenticated user's database BYOK keys
    try {
        const { auth } = await import('@/lib/auth');
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (session?.user?.id) {
            const { prisma } = await import('@/lib/prisma');
            const count = await prisma.aPIKey.count({
                where: {
                    userId: session.user.id,
                    isActive: true,
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } }
                    ]
                }
            });
            if (count > 0) return true;
        }
    } catch {
        // Continue to guest check
    }

    // 2. Check guest 24h encrypted cookie
    try {
        const { getGuestDecryptedApiKey } = await import('./guest-api-key');
        const guestKey = await getGuestDecryptedApiKey();
        if (guestKey && guestKey.apiKey) {
            return true;
        }
    } catch {
        // Fall through
    }

    return false;
}

/**
 * Server Action: Get the daily quota status for the current client.
 * Returns used, total (10), remaining, resetAt, and isByok flag.
 */
export async function getDailyQuotaAction(): Promise<{
    success: boolean;
    data: DailyQuotaResult;
    used: number;
    total: number;
    remaining: number;
    resetAt: string;
    isByok: boolean;
}> {
    const isByok = await hasActiveByokKey();
    const { identifier } = await resolveClientQuotaIdentifier();
    const { dateUtc, resetAt } = getUtcDayInfo();
    const key = `quota:daily:${dateUtc}:${identifier}`;
    const used = quotaStore.get(key) || 0;
    const total = DAILY_QUOTA_LIMIT;
    const remaining = isByok ? 999999 : Math.max(0, total - used);

    const payload: DailyQuotaResult = {
        used,
        total,
        remaining,
        resetAt,
        isByok
    };

    return {
        success: true,
        data: payload,
        ...payload
    };
}

/**
 * Server helper to check if a search is allowed under the daily quota.
 */
export async function checkDailyQuota(hasByokOverride?: boolean): Promise<{
    allowed: boolean;
    used: number;
    total: number;
    remaining: number;
    resetAt: string;
    isByok: boolean;
}> {
    const isByok = hasByokOverride !== undefined ? hasByokOverride : await hasActiveByokKey();
    const { identifier } = await resolveClientQuotaIdentifier();
    const { dateUtc, resetAt } = getUtcDayInfo();
    const key = `quota:daily:${dateUtc}:${identifier}`;
    const used = quotaStore.get(key) || 0;
    const total = DAILY_QUOTA_LIMIT;

    if (isByok) {
        return {
            allowed: true,
            used,
            total,
            remaining: Math.max(0, total - used),
            resetAt,
            isByok: true
        };
    }

    const remaining = Math.max(0, total - used);
    return {
        allowed: remaining > 0,
        used,
        total,
        remaining,
        resetAt,
        isByok: false
    };
}

/**
 * Server helper to increment the client's daily quota on a successful search.
 */
export async function incrementDailyQuota(hasByokOverride?: boolean): Promise<{
    used: number;
    remaining: number;
}> {
    const isByok = hasByokOverride !== undefined ? hasByokOverride : await hasActiveByokKey();
    const { identifier } = await resolveClientQuotaIdentifier();
    const { dateUtc } = getUtcDayInfo();
    const key = `quota:daily:${dateUtc}:${identifier}`;
    const current = quotaStore.get(key) || 0;
    const next = current + 1;
    quotaStore.set(key, next);

    return {
        used: next,
        remaining: isByok ? 999999 : Math.max(0, DAILY_QUOTA_LIMIT - next)
    };
}

/**
 * Testing utility: Reset quota for a specific identifier or clear all.
 */
export async function _resetQuotaForTest(keyPattern?: string): Promise<void> {
    if (keyPattern) {
        for (const k of quotaStore.keys()) {
            if (k.includes(keyPattern)) {
                quotaStore.delete(k);
            }
        }
    } else {
        quotaStore.clear();
    }
}
