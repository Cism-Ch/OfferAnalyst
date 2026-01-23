'use server';

/**
 * API Key Rotation Actions
 * 
 * Server actions for managing API key rotation and versioning.
 */

import { prisma } from '@/lib/prisma';
import { encryptAPIKey } from '@/lib/api-key-encryption';

export interface KeyRotationResult {
    success: boolean;
    message: string;
    newKeyId?: string;
    oldKeyId?: string;
}

/**
 * Rotate an API key (create new, mark old as deprecated)
 */
export async function rotateAPIKey(
    userId: string,
    oldKeyId: string,
    newApiKey: string,
    autoDeleteOld: boolean = false
): Promise<KeyRotationResult> {
    try {
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
                message: 'Old API key not found'
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

        // Send notification
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { email: true }
            });

            if (user?.email) {
                // TODO: Send rotation confirmation email
                if (process.env.NODE_ENV === 'development') {
                    console.log(`📧 Key rotation notification would be sent to ${user.email}`);
                }
            }
        } catch (emailError) {
            console.error('Error sending rotation notification:', emailError);
        }

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
            message: 'Failed to rotate API key'
        };
    }
}

/**
 * Set a key as primary for its provider
 */
export async function setPrimaryKey(
    userId: string,
    keyId: string
): Promise<{ success: boolean; message: string }> {
    try {
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
                message: 'API key not found'
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

        return {
            success: true,
            message: 'Primary key updated successfully'
        };
    } catch (error) {
        console.error('Error setting primary key:', error);
        return {
            success: false,
            message: 'Failed to set primary key'
        };
    }
}

/**
 * Update key priority
 */
export async function updateKeyPriority(
    userId: string,
    keyId: string,
    priority: number
): Promise<{ success: boolean; message: string }> {
    try {
        await prisma.aPIKey.updateMany({
            where: {
                id: keyId,
                userId
            },
            data: {
                priority
            }
        });

        return {
            success: true,
            message: 'Key priority updated successfully'
        };
    } catch (error) {
        console.error('Error updating key priority:', error);
        return {
            success: false,
            message: 'Failed to update key priority'
        };
    }
}

/**
 * Check for keys that need rotation (older than 90 days)
 */
export async function getKeysNeedingRotation(userId: string): Promise<{
    id: string;
    name: string;
    provider: string;
    daysSinceCreation: number;
}[]> {
    try {
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
        return keys.map(key => ({
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
    userId: string,
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

        // Get all keys including rotated ones (containing "Rotated" or "Deprecated" in name)
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

        return keys.map(key => ({
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
