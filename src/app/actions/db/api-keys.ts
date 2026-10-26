'use server';

/**
 * API Keys Database Actions
 * 
 * Server actions for managing user API keys in MongoDB.
 * Handles CRUD operations for BYOK (Bring Your Own Key) functionality.
 * Keys are encrypted at rest using AES-256-GCM.
 */

import { prisma } from '@/lib/prisma';
import { encryptAPIKey } from '@/lib/api-key-encryption';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

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
}

/**
 * Get all API keys for the current authenticated user
 */
export async function getUserAPIKeys(providedUserId?: string): Promise<APIKeyData[]> {
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
                isActive: true
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
            isActive: boolean 
        }): APIKeyData => ({
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
            isExpired: key.expiresAt ? key.expiresAt < now : false
        }));
    } catch (error) {
        console.error('Error fetching API keys:', error);
        return [];
    }
}

/**
 * Add a new API key for the current authenticated user
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
): Promise<{ success: boolean; message: string; keyId?: string }> {
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
                rateLimit
            }
        });

        return {
            success: true,
            message: 'API key added successfully',
            keyId: newKey.id
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
export async function getAPIKeyStats(providedUserId?: string): Promise<{
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
