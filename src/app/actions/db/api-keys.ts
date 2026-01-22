'use server';

/**
 * API Keys Database Actions
 * 
 * Server actions for managing user API keys in MongoDB.
 * Handles CRUD operations for BYOK (Bring Your Own Key) functionality.
 */

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export interface APIKeyData {
    id: string;
    name: string;
    provider: string;
    keyPreview: string;
    createdAt: string;
    lastUsed: string | null;
    usageCount: number;
    isActive: boolean;
}

/**
 * Get all API keys for a user
 */
export async function getUserAPIKeys(userId: string): Promise<APIKeyData[]> {
    try {
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
                isActive: true
            }
        });

        return keys.map(key => ({
            ...key,
            createdAt: key.createdAt.toISOString(),
            lastUsed: key.lastUsed?.toISOString() || null
        }));
    } catch (error) {
        console.error('Error fetching API keys:', error);
        return [];
    }
}

/**
 * Add a new API key for a user
 */
export async function addAPIKey(
    userId: string,
    name: string,
    provider: string,
    apiKey: string
): Promise<{ success: boolean; message: string; keyId?: string }> {
    try {
        // Hash the key for security
        const keyHash = await bcrypt.hash(apiKey, 10);
        
        // Extract last 4 characters for preview
        const keyPreview = apiKey.slice(-4);

        const newKey = await prisma.aPIKey.create({
            data: {
                userId,
                name,
                provider,
                keyHash,
                keyPreview,
                permissions: ['READ', 'WRITE']
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
 * Delete an API key
 */
export async function deleteAPIKey(
    userId: string,
    keyId: string
): Promise<{ success: boolean; message: string }> {
    try {
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
 * Update API key usage stats
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
 * Get API key statistics for a user
 */
export async function getAPIKeyStats(userId: string): Promise<{
    totalKeys: number;
    totalRequests: number;
    byokActive: boolean;
}> {
    try {
        const keys = await prisma.aPIKey.findMany({
            where: {
                userId,
                isActive: true
            },
            select: {
                usageCount: true
            }
        });

        const totalRequests = keys.reduce((sum, key) => sum + key.usageCount, 0);

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
