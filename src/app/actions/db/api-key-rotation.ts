'use server';

/**
 * API Key Rotation Actions
 * 
 * Server actions for managing API key rotation and versioning.
 */

import { prisma } from '@/lib/prisma';
import { encryptAPIKey } from '@/lib/api-key-encryption';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function getAuthenticatedUserId(): Promise<string | null> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        return session?.user?.id || null;
    } catch {
        return null;
    }
}

export interface KeyRotationResult {
    success: boolean;
    message: string;
    newKeyId?: string;
    oldKeyId?: string;
    error?: string;
}

/**
 * Rotate an API key (create new, mark old as deprecated)
 */
export async function rotateAPIKey(
    providedUserId: string,
    oldKeyId: string,
    newApiKey: string,
    autoDeleteOld: boolean = false
): Promise<KeyRotationResult> {
    try {
        const userId = await getAuthenticatedUserId();

        if (!userId) {
            return {
                success: false,
                message: 'Unauthorized: Authentication required',
                error: 'Unauthorized: Authentication required'
            };
        }

        // Get the old key details
        const oldKey = await prisma.aPIKey.findFirst({
            where: {
                id: oldKeyId,
                userId // Ensure user owns the key
            }
        });

        if (!oldKey) {
            return {
                success: false,
                message: 'Old API key not found',
                error: 'Old API key not found'
            };
        }

        // Create new key with same settings
        const keyEncrypted = encryptAPIKey(newApiKey);
        const keyPreview = newApiKey.slice(-4);

        const newKey = await prisma.aPIKey.create({
            data: {
                userId,
                name: `${oldKey.name} (Rotated)`,
                provider: oldKey.provider,
                keyEncrypted,
                keyPreview,
                permissions: oldKey.permissions,
                priority: oldKey.priority,
                isPrimary: oldKey.isPrimary,
                rateLimit: oldKey.rateLimit,
                expiresAt: oldKey.expiresAt
            }
        });

        // Handle old key
        if (autoDeleteOld) {
            await prisma.aPIKey.delete({
                where: { id: oldKeyId }
            });
        } else {
            // Mark as inactive and deprioritize
            await prisma.aPIKey.update({
                where: { id: oldKeyId },
                data: {
                    isActive: false,
                    isPrimary: false,
                    priority: 0,
                    name: `${oldKey.name} (Deprecated)`
                }
            });
        }

        revalidatePath('/dashboard/api-keys');

        return {
            success: true,
            message: `API key rotated successfully. ${autoDeleteOld ? 'Old key deleted.' : 'Old key marked as deprecated.'}`,
            newKeyId: newKey.id,
            oldKeyId: oldKeyId
        };
    } catch (error) {
        console.error('Error rotating API key:', error);
        return {
            success: false,
            message: 'Failed to rotate API key',
            error: 'Failed to rotate API key'
        };
    }
}

/**
 * Set a key as primary for its provider
 */
export async function setPrimaryKey(
    providedUserId: string,
    keyId: string
): Promise<{ success: boolean; message: string; error?: string }> {
    try {
        const userId = await getAuthenticatedUserId();
        if (!userId) {
            return {
                success: false,
                message: 'Unauthorized: Authentication required',
                error: 'Unauthorized: Authentication required'
            };
        }

        // Get the key to set as primary
        const key = await prisma.aPIKey.findFirst({
            where: {
                id: keyId,
                userId
            },
            select: { provider: true }
        });

        if (!key) {
            return {
                success: false,
                message: 'API key not found',
                error: 'API key not found'
            };
        }

        // Remove primary flag from all other keys for this provider
        await prisma.aPIKey.updateMany({
            where: {
                userId,
                provider: key.provider,
                isPrimary: true
            },
            data: {
                isPrimary: false
            }
        });

        // Set this key as primary
        await prisma.aPIKey.update({
            where: { id: keyId },
            data: {
                isPrimary: true
            }
        });

        revalidatePath('/dashboard/api-keys');

        return {
            success: true,
            message: 'Primary key updated successfully'
        };
    } catch (error) {
        console.error('Error setting primary key:', error);
        return {
            success: false,
            message: 'Failed to set primary key',
            error: 'Failed to set primary key'
        };
    }
}

/**
 * Update key priority
 */
export async function updateKeyPriority(
    providedUserId: string,
    keyId: string,
    priority: number
): Promise<{ success: boolean; message: string; error?: string }> {
    try {
        const userId = await getAuthenticatedUserId();
        if (!userId) {
            return {
                success: false,
                message: 'Unauthorized: Authentication required',
                error: 'Unauthorized: Authentication required'
            };
        }

        await prisma.aPIKey.updateMany({
            where: {
                id: keyId,
                userId
            },
            data: {
                priority
            }
        });

        revalidatePath('/dashboard/api-keys');

        return {
            success: true,
            message: 'Key priority updated successfully'
        };
    } catch (error) {
        console.error('Error updating key priority:', error);
        return {
            success: false,
            message: 'Failed to update key priority',
            error: 'Failed to update key priority'
        };
    }
}

/**
 * Check for keys that need rotation (older than 90 days)
 */
export async function getKeysNeedingRotation(providedUserId: string): Promise<{
    id: string;
    name: string;
    provider: string;
    daysSinceCreation: number;
}[]> {
    void providedUserId;
    try {
        const userId = await getAuthenticatedUserId();
        if (!userId) {
            return [];
        }

        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const keys = await prisma.aPIKey.findMany({
            where: {
                userId,
                isActive: true,
                createdAt: { lte: ninetyDaysAgo }
            },
            select: {
                id: true,
                name: true,
                provider: true,
                createdAt: true
            }
        });

        const now = new Date();
        return keys.map((key: { id: string; name: string; provider: string; createdAt: Date }) => ({
            id: key.id,
            name: key.name,
            provider: key.provider,
            daysSinceCreation: Math.floor((now.getTime() - key.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        }));
    } catch (error) {
        console.error('Error checking keys needing rotation:', error);
        return [];
    }
}

/**
 * Get key rotation history
 */
export async function getKeyRotationHistory(
    providedUserId: string,
    provider?: string
): Promise<{
    id: string;
    name: string;
    provider: string;
    createdAt: string;
    isActive: boolean;
    isPrimary: boolean;
}[]> {
    try {
        const userId = await getAuthenticatedUserId();
        if (!userId) {
            return [];
        }

        const whereClause: {
            userId: string;
            provider?: string;
            name?: { contains: string };
        } = {
            userId
        };

        if (provider) {
            whereClause.provider = provider;
        }

        const keys = await prisma.aPIKey.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                name: true,
                provider: true,
                createdAt: true,
                isActive: true,
                isPrimary: true
            }
        });

        return keys.map((key: { id: string; name: string; provider: string; createdAt: Date; isActive: boolean; isPrimary: boolean }) => ({
            id: key.id,
            name: key.name,
            provider: key.provider,
            createdAt: key.createdAt.toISOString(),
            isActive: key.isActive,
            isPrimary: key.isPrimary
        }));
    } catch (error) {
        console.error('Error getting rotation history:', error);
        return [];
    }
}
