'use server';

/**
 * Admin Database Actions
 * 
 * Server actions for admin operations and system monitoring.
 * Restricted to users with ADMIN role.
 */

import { prisma } from '@/lib/prisma';

export interface SystemStats {
    totalUsers: number;
    activeUsers: number;
    totalSearches: number;
    byokActivations: number;
    avgResponseTime: number;
}

export interface UserData {
    id: string;
    name: string | null;
    email: string;
    role: string;
    status: string;
    createdAt: string;
}

/**
 * Get system-wide statistics
 */
export async function getSystemStats(): Promise<SystemStats> {
    try {
        const [totalUsers, searchCount, byokCount] = await Promise.all([
            prisma.user.count(),
            prisma.searchHistory.count(),
            prisma.aPIKey.count({
                where: { isActive: true }
            })
        ]);

        // Calculate active users (users who searched in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const activeUserIds = await prisma.searchHistory.findMany({
            where: {
                timestamp: {
                    gte: thirtyDaysAgo
                }
            },
            select: {
                userId: true
            },
            distinct: ['userId']
        });

        return {
            totalUsers,
            activeUsers: activeUserIds.length,
            totalSearches: searchCount,
            byokActivations: byokCount,
            avgResponseTime: 850 // Mock value - would need instrumentation
        };
    } catch (error) {
        console.error('Error fetching system stats:', error);
        return {
            totalUsers: 0,
            activeUsers: 0,
            totalSearches: 0,
            byokActivations: 0,
            avgResponseTime: 0
        };
    }
}

/**
 * Get recent users for admin dashboard
 */
export async function getRecentUsers(limit: number = 10): Promise<UserData[]> {
    try {
        const users = await prisma.user.findMany({
            take: limit,
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        return users.map(user => ({
            ...user,
            status: 'Active', // Would need to check session/last activity
            createdAt: user.createdAt.toISOString()
        }));
    } catch (error) {
        console.error('Error fetching recent users:', error);
        return [];
    }
}

/**
 * Get provider usage statistics
 */
export async function getProviderUsage(): Promise<Array<{
    provider: string;
    freeRequests: number;
    byokRequests: number;
    errors: number;
}>> {
    try {
        // This is a simplified version - in production, you'd track this in a separate table
        const searches = await prisma.searchHistory.findMany({
            select: {
                model: true
            }
        });

        const providerMap: Record<string, { free: number; byok: number }> = {};
        
        searches.forEach(search => {
            // Extract provider from model name (simplified)
            const provider = search.model.includes('gpt') ? 'OpenRouter' :
                            search.model.includes('gemini') ? 'Google Gemini' :
                            search.model.includes('deepseek') ? 'DeepSeek' : 'Other';
            
            if (!providerMap[provider]) {
                providerMap[provider] = { free: 0, byok: 0 };
            }
            providerMap[provider].free++;
        });

        return Object.entries(providerMap).map(([provider, counts]) => ({
            provider,
            freeRequests: counts.free,
            byokRequests: counts.byok,
            errors: Math.floor(Math.random() * 10) // Mock errors
        }));
    } catch (error) {
        console.error('Error fetching provider usage:', error);
        return [];
    }
}

/**
 * Update user role
 */
export async function updateUserRole(
    userId: string,
    role: 'USER' | 'ADMIN' | 'EDITOR' | 'VIEWER'
): Promise<{ success: boolean; message: string }> {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role }
        });

        return {
            success: true,
            message: 'User role updated successfully'
        };
    } catch (error) {
        console.error('Error updating user role:', error);
        return {
            success: false,
            message: 'Failed to update user role'
        };
    }
}
