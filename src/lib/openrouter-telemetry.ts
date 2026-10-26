/**
 * OpenRouter Telemetry Service
 *
 * Provides real-time health verification and usage telemetry directly
 * from OpenRouter's official endpoints (https://openrouter.ai/api/v1/auth/key).
 * Avoids reinventing the wheel by leveraging native OpenRouter billing & key APIs.
 */

export type KeyHealthStatus = 'OPERATIONAL' | 'DEGRADED' | 'QUOTA_EXCEEDED' | 'RATE_LIMITED' | 'INVALID' | 'UNCHECKED';

export interface OpenRouterKeyDetails {
    label: string | null;
    usageUsd: number;
    limitUsd: number | null;
    isFreeTier: boolean;
    rateLimit?: {
        requests: number;
        interval: string;
    };
}

export interface KeyCheckResult {
    isValid: boolean;
    status: KeyHealthStatus;
    latencyMs: number;
    usageUsd?: number;
    limitUsd?: number | null;
    creditsRemaining?: number | null;
    label?: string | null;
    rateLimit?: {
        requests: number;
        interval: string;
    };
    error?: string;
    checkedAt: string;
}

/**
 * Check real-time validity and credit limits for an OpenRouter API key.
 * Uses native GET https://openrouter.ai/api/v1/auth/key.
 *
 * @param apiKey Raw unencrypted OpenRouter API key (sk-or-v1-...)
 * @returns Real-time health, quota, and latency telemetry
 */
export async function checkOpenRouterKey(apiKey: string): Promise<KeyCheckResult> {
    const startTime = Date.now();
    const checkedAt = new Date().toISOString();

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
        return {
            isValid: false,
            status: 'INVALID',
            latencyMs: 0,
            error: 'Clé API vide ou format non valide.',
            checkedAt
        };
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

        const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey.trim()}`,
                'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://offeranalyst.com',
                'X-Title': 'OfferAnalyst FinOps Engine'
            },
            signal: controller.signal,
            cache: 'no-store'
        });

        clearTimeout(timeoutId);
        const latencyMs = Date.now() - startTime;

        if (response.status === 200) {
            const json = await response.json();
            const data: OpenRouterKeyDetails = json?.data || {};

            const usageUsd = typeof data.usageUsd === 'number' ? data.usageUsd : (Number(json?.data?.usage) || 0);
            const limitUsd = json?.data?.limit !== undefined && json?.data?.limit !== null ? Number(json?.data?.limit) : null;
            const creditsRemaining = limitUsd !== null ? Math.max(0, limitUsd - usageUsd) : null;

            // Determine precise status based on OpenRouter response
            let status: KeyHealthStatus = 'OPERATIONAL';
            if (limitUsd !== null && usageUsd >= limitUsd) {
                status = 'QUOTA_EXCEEDED';
            }

            return {
                isValid: true,
                status,
                latencyMs,
                usageUsd,
                limitUsd,
                creditsRemaining,
                label: data.label || null,
                rateLimit: data.rateLimit,
                checkedAt
            };
        }

        if (response.status === 401) {
            return {
                isValid: false,
                status: 'INVALID',
                latencyMs,
                error: 'Clé API invalide ou révoquée par OpenRouter (HTTP 401).',
                checkedAt
            };
        }

        if (response.status === 429) {
            return {
                isValid: true,
                status: 'RATE_LIMITED',
                latencyMs,
                error: 'Limite de requêtes atteinte sur ce compte (HTTP 429).',
                checkedAt
            };
        }

        if (response.status === 402) {
            return {
                isValid: false,
                status: 'QUOTA_EXCEEDED',
                latencyMs,
                error: 'Crédits insuffisants sur ce compte OpenRouter (HTTP 402).',
                checkedAt
            };
        }

        // Other non-200 responses
        return {
            isValid: false,
            status: 'DEGRADED',
            latencyMs,
            error: `Réponse OpenRouter inattendue : HTTP ${response.status}`,
            checkedAt
        };

    } catch (err: unknown) {
        const latencyMs = Date.now() - startTime;
        const isAbort = (err as { name?: string })?.name === 'AbortError';

        return {
            isValid: false,
            status: 'DEGRADED',
            latencyMs,
            error: isAbort ? 'Délai d’attente dépassé (timeout 8s).' : 'Erreur de connexion réseau vers OpenRouter.',
            checkedAt
        };
    }
}
