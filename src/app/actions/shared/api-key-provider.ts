/**
 * API Key Provider Utility (Server-only module - NOT a Server Action)
 * 
 * Provides API keys internally for server operations with BYOK support.
 * Must NOT be exposed as a public Server Action endpoint.
 * Priority:
 * 1. User's BYOK key from database (authenticated users)
 * 2. Client-provided temporary key (unauthenticated users)
 * 3. Environment variable (fallback)
 */

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { updateAPIKeyUsage } from '@/app/actions/db/api-keys';
import { prisma } from '@/lib/prisma';
import { decryptAPIKey } from '@/lib/api-key-encryption';

export interface APIKeyResult {
    key: string;
    source: 'byok' | 'temp' | 'env';
    provider: string;
    keyId?: string;
    userId?: string;
}

/**
 * Get API key for a specific provider
 * Checks user's BYOK keys first, then client-provided temp keys, then environment variables
 * 
 * @param provider - AI provider name
 * @param clientApiKey - Optional temporary key from unauthenticated users (from localStorage)
 */
export async function getAPIKey(
    provider: 'openrouter' | 'openai' | 'anthropic' | 'google' | 'mistral',
    clientApiKey?: string
): Promise<APIKeyResult | null> {
    // Try to get authenticated user's BYOK key first
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (session?.user?.id) {
            // User is authenticated, check for BYOK keys
            // Get all active, non-expired keys for this provider, ordered by priority
            const keyRecords = await prisma.aPIKey.findMany({
                where: {
                    userId: session.user.id,
                    provider: provider,
                    isActive: true,
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } }
                    ]
                },
                orderBy: [
                    { priority: 'desc' }, // Higher priority first
                    { isPrimary: 'desc' }, // Primary keys first
                    { createdAt: 'desc' } // Newest first if same priority
                ],
                select: { 
                    id: true,
                    keyEncrypted: true,
                    priority: true,
                    isPrimary: true,
                    rateLimit: true,
                    name: true
                }
            });
            
            // Try each key in priority order
            for (const keyRecord of keyRecords) {
                // Check if key has reached rate limit
                if (keyRecord.rateLimit) {
                    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
                    const recentUsage = await prisma.aPIKeyUsageLog.count({
                        where: {
                            apiKeyId: keyRecord.id,
                            timestamp: { gte: oneHourAgo }
                        }
                    });

                    if (recentUsage >= keyRecord.rateLimit) {
                        // Skip this key, try next one
                        if (process.env.NODE_ENV === 'development') {
                            console.log(`[getAPIKey] Skipping key "${keyRecord.name}" - rate limit reached`);
                        }
                        continue;
                    }
                }

                // Use this key
                if (process.env.NODE_ENV === 'development') {
                    console.log(`[getAPIKey] Using BYOK key "${keyRecord.name}" (priority: ${keyRecord.priority}) for ${provider}`);
                }
                
                // Decrypt the key
                const decryptedKey = decryptAPIKey(keyRecord.keyEncrypted);
                
                return {
                    key: decryptedKey,
                    source: 'byok',
                    provider,
                    keyId: keyRecord.id,
                    userId: session.user.id
                };
            }

            // All keys exhausted or rate limited
            if (keyRecords.length > 0 && process.env.NODE_ENV === 'development') {
                console.log(`[getAPIKey] All BYOK keys for ${provider} are rate limited or unavailable`);
            }
        }
    } catch (error) {
        console.error('[getAPIKey] Error checking for user BYOK keys:', error);
        // Fall through to next options
    }

    // If client provided a temporary key, use it
    if (clientApiKey) {
        // Only log in development mode
        if (process.env.NODE_ENV === 'development') {
            console.log(`[getAPIKey] Using client-provided temporary key for ${provider}`);
        }
        return {
            key: clientApiKey,
            source: 'temp',
            provider
        };
    }

    // Fallback to environment variable
    const envKey = getEnvAPIKey(provider);
    if (envKey) {
        // Only log in development mode
        if (process.env.NODE_ENV === 'development') {
            console.log(`[getAPIKey] Using environment variable for ${provider}`);
        }
        return {
            key: envKey,
            source: 'env',
            provider
        };
    }

    // Only warn in development mode
    if (process.env.NODE_ENV === 'development') {
        console.warn(`[getAPIKey] No API key found for ${provider}`);
    }
    return null;
}

/**
 * Get API key from environment variables
 */
function getEnvAPIKey(provider: string): string | null {
    switch (provider.toLowerCase()) {
        case 'openrouter':
            return process.env.OPENROUTER_API_KEY || null;
        case 'openai':
            return process.env.OPENAI_API_KEY || null;
        case 'anthropic':
            return process.env.ANTHROPIC_API_KEY || null;
        case 'google':
        case 'gemini':
            return process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || null;
        case 'mistral':
            return process.env.MISTRAL_API_KEY || null;
        default:
            return null;
    }
}

/**
 * Track API key usage after a successful request
 * Call this after using a BYOK key
 */
export async function trackBYOKUsage(keyId: string): Promise<void> {
    try {
        await updateAPIKeyUsage(keyId);
    } catch (error) {
        console.error('[trackBYOKUsage] Error tracking usage:', error);
        // Don't throw - tracking failures shouldn't break the main operation
    }
}

/**
 * Unified FinOps telemetry and health tracking recorder for AI actions.
 * Logs tokens, latency, cost and updates live health status of the API key.
 */
export async function recordAITelemetry(params: {
    apiKeyResult?: APIKeyResult | null;
    model: string;
    action: string;
    promptTokens?: number;
    completionTokens?: number;
    tokensUsed?: number;
    responseTimeMs?: number;
    success?: boolean;
    errorMessage?: string;
    statusCode?: number;
}): Promise<void> {
    try {
        const { logAPIKeyUsage } = await import('@/app/actions/db/api-key-analytics');
        
        let userId = params.apiKeyResult?.userId;
        if (!userId) {
            try {
                const session = await auth.api.getSession({ headers: await headers() });
                userId = session?.user?.id || 'system';
            } catch {
                userId = 'system';
            }
        }

        const apiKeyId = params.apiKeyResult?.keyId || 'system';
        const provider = params.apiKeyResult?.provider || 'openrouter';

        await logAPIKeyUsage(userId, apiKeyId, provider, params.action, {
            model: params.model,
            promptTokens: params.promptTokens,
            completionTokens: params.completionTokens,
            tokensUsed: params.tokensUsed,
            responseTime: params.responseTimeMs,
            success: params.success ?? true,
            errorMessage: params.errorMessage,
            statusCode: params.statusCode
        });

        // If key is BYOK and had an error, update health state
        if (apiKeyId && apiKeyId.length === 24) {
            if (params.success === false) {
                const isQuota = params.statusCode === 402 || params.errorMessage?.toLowerCase().includes('quota');
                const isAuth = params.statusCode === 401 || params.errorMessage?.toLowerCase().includes('auth') || params.errorMessage?.toLowerCase().includes('invalid');
                const newStatus = isQuota ? 'QUOTA_EXCEEDED' : isAuth ? 'INVALID' : 'DEGRADED';

                await prisma.aPIKey.update({
                    where: { id: apiKeyId },
                    data: {
                        healthStatus: newStatus,
                        lastError: params.errorMessage?.slice(0, 200) || 'Erreur lors de l\'exécution IA',
                        lastChecked: new Date()
                    }
                }).catch(() => {});
            } else {
                // If it succeeded, mark operational
                await prisma.aPIKey.update({
                    where: { id: apiKeyId },
                    data: {
                        healthStatus: 'OPERATIONAL',
                        lastChecked: new Date(),
                        lastPingLatency: params.responseTimeMs ?? null,
                        lastError: null
                    }
                }).catch(() => {});
            }
        }
    } catch (telemetryErr) {
        console.error('[recordAITelemetry] Failed to record telemetry:', telemetryErr);
    }
}

