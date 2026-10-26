'use server';

/**
 * API Keys Database Actions
 * 
 * Server actions for managing user API keys in MongoDB.
 * Handles CRUD operations for BYOK (Bring Your Own Key) functionality.
 * Keys are encrypted at rest using AES-256-GCM.
 */

import { prisma } from '@/lib/prisma';
import { encryptAPIKey, decryptAPIKey } from '@/lib/api-key-encryption';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { checkOpenRouterKey, type KeyCheckResult } from '@/lib/openrouter-telemetry';

export interface APIKeyData {
    id: string;
    name: string;
    provider: string;
    keyPreview: string;
    createdAt: string;
    lastUsed: string | null;
    usageCount: number;
    rateLimit: number | null;
    priority: number;
    isPrimary: boolean;
    expiresAt: string | null;
    isActive: boolean;
    isExpired?: boolean;
    healthStatus: string;
    lastChecked: string | null;
    lastPingLatency: number | null;
    lastError: string | null;
    creditsRemaining: number | null;
    creditsLimit: number | null;
    totalTokensUsed: number;
    totalCostUsd: number;
}

/**
 * Get all API keys for the current authenticated user
 */
export async function getUserAPIKeys(_providedUserId?: string): Promise<APIKeyData[]> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) {
            return [];
        }

        // Strictly enforce authenticated user ID to prevent IDOR
        const userId = session.user.id;

        const keys = await prisma.aPIKey.findMany({
            where: {
                userId,
                isActive: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                name: true,
                provider: true,
                keyPreview: true,
                createdAt: true,
                lastUsed: true,
                usageCount: true,
                rateLimit: true,
                priority: true,
                isPrimary: true,
                expiresAt: true,
                isActive: true,
                healthStatus: true,
                lastChecked: true,
                lastPingLatency: true,
                lastError: true,
                creditsRemaining: true,
                creditsLimit: true,
                totalTokensUsed: true,
                totalCostUsd: true
            }
        });

        const now = new Date();
        return keys.map((key: {
            id: string;
            name: string;
            provider: string;
            keyPreview: string;
            createdAt: Date;
            lastUsed: Date | null;
            usageCount: number;
            rateLimit: number | null;
            priority: number;
            isPrimary: boolean;
            expiresAt: Date | null;
            isActive: boolean;
            healthStatus?: string | null;
            lastChecked?: Date | null;
            lastPingLatency?: number | null;
            lastError?: string | null;
            creditsRemaining?: number | null;
            creditsLimit?: number | null;
            totalTokensUsed?: number | null;
            totalCostUsd?: number | null;
        }) => ({
            id: key.id,
            name: key.name,
            provider: key.provider,
            keyPreview: key.keyPreview,
            createdAt: key.createdAt.toISOString(),
            lastUsed: key.lastUsed?.toISOString() || null,
            usageCount: key.usageCount,
            rateLimit: key.rateLimit,
            priority: key.priority,
            isPrimary: key.isPrimary,
            expiresAt: key.expiresAt?.toISOString() || null,
            isActive: key.isActive,
            isExpired: key.expiresAt ? key.expiresAt < now : false,
            healthStatus: key.healthStatus || 'UNCHECKED',
            lastChecked: key.lastChecked?.toISOString() || null,
            lastPingLatency: key.lastPingLatency,
            lastError: key.lastError,
            creditsRemaining: key.creditsRemaining,
            creditsLimit: key.creditsLimit,
            totalTokensUsed: key.totalTokensUsed || 0,
            totalCostUsd: key.totalCostUsd || 0
        }));
    } catch (error) {
        console.error('Error fetching API keys:', error);
        return [];
    }
}

/**
 * Add a new API key for the current authenticated user.
 * Automatically performs an initial health check if provider is OpenRouter.
 */
export async function addAPIKey(
    providedUserId: string,
    name: string,
    provider: string,
    apiKey: string,
    expiresAt?: Date | null,
    rateLimit?: number | null,
    priority?: number,
    isPrimary?: boolean
): Promise<{ success: boolean; message: string; keyId?: string; checkResult?: KeyCheckResult }> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) {
            return {
                success: false,
                message: 'Unauthorized: Authentication required'
            };
        }

        // Strictly enforce authenticated user ID to prevent IDOR
        const userId = session.user.id;
        // Encrypt the key for security
        const keyEncrypted = encryptAPIKey(apiKey);
        
        // Extract last 4 characters for preview
        const keyPreview = apiKey.slice(-4);

        // If setting as primary, unset other primary keys for this provider
        if (isPrimary) {
            await prisma.aPIKey.updateMany({
                where: {
                    userId,
                    provider,
                    isPrimary: true
                },
                data: {
                    isPrimary: false
                }
            });
        }

        // Perform immediate health telemetry check via OpenRouter API
        let checkResult: KeyCheckResult | undefined;
        let initialHealthStatus = 'UNCHECKED';
        let initialLatency: number | null = null;
        let initialCreditsRemaining: number | null = null;
        let initialCreditsLimit: number | null = null;
        let initialError: string | null = null;

        if (provider.toLowerCase().includes('openrouter')) {
            try {
                checkResult = await checkOpenRouterKey(apiKey);
                initialHealthStatus = checkResult.status;
                initialLatency = checkResult.latencyMs;
                initialCreditsRemaining = checkResult.creditsRemaining ?? null;
                initialCreditsLimit = checkResult.limitUsd ?? null;
                initialError = checkResult.error ?? null;
            } catch (checkErr) {
                console.warn('Initial key check skipped or failed:', checkErr);
            }
        }

        const newKey = await prisma.aPIKey.create({
            data: {
                userId,
                name,
                provider,
                keyEncrypted,
                keyPreview,
                permissions: ['READ', 'WRITE'],
                priority: priority ?? 0,
                isPrimary: isPrimary ?? false,
                expiresAt,
                rateLimit,
                healthStatus: initialHealthStatus,
                lastChecked: checkResult ? new Date() : null,
                lastPingLatency: initialLatency,
                creditsRemaining: initialCreditsRemaining,
                creditsLimit: initialCreditsLimit,
                lastError: initialError
            }
        });

        revalidatePath('/dashboard/api-keys');

        return {
            success: true,
            message: 'API key added successfully',
            keyId: newKey.id,
            checkResult
        };
    } catch (error) {
        console.error('Error adding API key:', error);
        return {
            success: false,
            message: 'Failed to add API key'
        };
    }
}

/**
 * Delete an API key for the current authenticated user
 */
export async function deleteAPIKey(
    providedUserId: string,
    keyId: string
): Promise<{ success: boolean; message: string }> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) {
            return {
                success: false,
                message: 'Unauthorized: Authentication required'
            };
        }

        const userId = session.user.id;

        await prisma.aPIKey.deleteMany({
            where: {
                id: keyId,
                userId // Ensure user owns the key
            }
        });

        revalidatePath('/dashboard/api-keys');

        return {
            success: true,
            message: 'API key deleted successfully'
        };
    } catch (error) {
        console.error('Error deleting API key:', error);
        return {
            success: false,
            message: 'Failed to delete API key'
        };
    }
}

/**
 * Perform a live health and quota diagnostic check on a specific API key.
 * Decrypts key strictly server-side and calls real-time OpenRouter telemetry API.
 */
export async function testAPIKeyHealth(apiKeyId: string): Promise<{
    success: boolean;
    data?: KeyCheckResult;
    error?: string;
}> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) {
            return {
                success: false,
                error: 'Non autorisé : session utilisateur requise.'
            };
        }

        const userId = session.user.id;

        // Fetch encrypted key securely (must belong to this user)
        const keyRecord = await prisma.aPIKey.findFirst({
            where: {
                id: apiKeyId,
                userId
            }
        });

        if (!keyRecord) {
            return {
                success: false,
                error: 'Clé API introuvable ou accès non autorisé.'
            };
        }

        // Decrypt key strictly on server
        let rawKey: string;
        try {
            rawKey = decryptAPIKey(keyRecord.keyEncrypted);
        } catch {
            await prisma.aPIKey.update({
                where: { id: apiKeyId },
                data: {
                    healthStatus: 'INVALID',
                    lastChecked: new Date(),
                    lastError: 'Échec de déchiffrement interne.'
                }
            });
            revalidatePath('/dashboard/api-keys');
            return {
                success: false,
                error: 'Impossible de déchiffrer la clé enregistrée.'
            };
        }

        // Execute real-time OpenRouter telemetry check
        const result = await checkOpenRouterKey(rawKey);

        // Update database with latest telemetry
        await prisma.aPIKey.update({
            where: { id: apiKeyId },
            data: {
                healthStatus: result.status,
                lastChecked: new Date(),
                lastPingLatency: result.latencyMs,
                creditsRemaining: result.creditsRemaining ?? null,
                creditsLimit: result.limitUsd ?? null,
                lastError: result.error ?? null
            }
        });

        revalidatePath('/dashboard/api-keys');

        return {
            success: true,
            data: result
        };
    } catch (error) {
        console.error('Error running API key diagnostic:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue lors du diagnostic.'
        };
    }
}

/**
 * Update API key usage stats (internal usage)
 */
export async function updateAPIKeyUsage(keyId: string): Promise<void> {
    try {
        await prisma.aPIKey.update({
            where: { id: keyId },
            data: {
                lastUsed: new Date(),
                usageCount: {
                    increment: 1
                }
            }
        });
    } catch (error) {
        console.error('Error updating API key usage:', error);
    }
}

/**
 * Get API key statistics for the current authenticated user
 */
export async function getAPIKeyStats(_providedUserId?: string): Promise<{
    totalKeys: number;
    totalRequests: number;
    byokActive: boolean;
}> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) {
            return {
                totalKeys: 0,
                totalRequests: 0,
                byokActive: false
            };
        }

        const userId = session.user.id;

        const keys = await prisma.aPIKey.findMany({
            where: {
                userId,
                isActive: true
            },
            select: {
                usageCount: true
            }
        });

        const totalRequests = keys.reduce((sum: number, key: { usageCount: number }) => sum + key.usageCount, 0);

        return {
            totalKeys: keys.length,
            totalRequests,
            byokActive: keys.length > 0
        };
    } catch (error) {
        console.error('Error fetching API key stats:', error);
        return {
            totalKeys: 0,
            totalRequests: 0,
            byokActive: false
        };
    }
}
