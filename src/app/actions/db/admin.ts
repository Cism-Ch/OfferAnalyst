'use server';

/**
 * Admin Database Actions
 * 
 * Server actions for admin operations and system monitoring.
 * Restricted to users with ADMIN role.
 */

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const UpdateUserRoleSchema = z.object({
    userId: z.string().min(1),
    role: z.enum(['USER', 'ADMIN', 'EDITOR', 'VIEWER']),
});

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
 * Validates that current session belongs to a user with ADMIN role
 */
async function ensureAdminSession(): Promise<boolean> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        return !!(session?.user && (session.user as { role?: string }).role === 'ADMIN');
    } catch {
        return false;
    }
}

/**
 * Get system-wide statistics (Admin only)
 */
export async function getSystemStats(): Promise<SystemStats> {
    try {
        const isAdmin = await ensureAdminSession();
        if (!isAdmin) {
            console.warn('[Admin] Unauthorized access attempt to getSystemStats');
            return {
                totalUsers: 0,
                activeUsers: 0,
                totalSearches: 0,
                byokActivations: 0,
                avgResponseTime: 0
            };
        }

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
            avgResponseTime: 850
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
 * Get recent users for admin dashboard (Admin only)
 */
export async function getRecentUsers(limit: number = 10): Promise<UserData[]> {
    try {
        const isAdmin = await ensureAdminSession();
        if (!isAdmin) {
            console.warn('[Admin] Unauthorized access attempt to getRecentUsers');
            return [];
        }

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

        return users.map((user: { id: string; name: string | null; email: string; role: string; createdAt: Date }): UserData => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: 'Active',
            createdAt: user.createdAt.toISOString()
        }));
    } catch (error) {
        console.error('Error fetching recent users:', error);
        return [];
    }
}

/**
 * Get provider usage statistics (Admin only)
 */
export async function getProviderUsage(): Promise<Array<{
    provider: string;
    freeRequests: number;
    byokRequests: number;
    errors: number;
}>> {
    try {
        const isAdmin = await ensureAdminSession();
        if (!isAdmin) {
            console.warn('[Admin] Unauthorized access attempt to getProviderUsage');
            return [];
        }
        const searches = await prisma.searchHistory.findMany({
            select: {
                model: true
            }
        });

        const providerMap: Record<string, { free: number; byok: number }> = {};
        
        searches.forEach((search: { model: string }) => {
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
            errors: 0
        }));
    } catch (error) {
        console.error('Error fetching provider usage:', error);
        return [];
    }
}

/**
 * Update user role (Admin only)
 */
export async function updateUserRole(
    userId: string,
    role: 'USER' | 'ADMIN' | 'EDITOR' | 'VIEWER'
): Promise<{ success: boolean; message: string; error?: string }> {
    try {
        const isAdmin = await ensureAdminSession();
        if (!isAdmin) {
            console.warn('[Admin] Unauthorized access attempt to updateUserRole');
            return {
                success: false,
                message: 'Unauthorized: Admin access required',
                error: 'Unauthorized: Admin access required'
            };
        }

        const parsed = UpdateUserRoleSchema.safeParse({ userId, role });
        if (!parsed.success) {
            return {
                success: false,
                message: 'Invalid parameters',
                error: 'Invalid parameters'
            };
        }

        await prisma.user.update({
            where: { id: parsed.data.userId },
            data: { role: parsed.data.role }
        });

        revalidatePath('/admin');

        return {
            success: true,
            message: 'User role updated successfully'
        };
    } catch (error) {
        console.error('Error updating user role:', error);
        return {
            success: false,
            message: 'Failed to update user role',
            error: 'Failed to update user role'
        };
    }
}
