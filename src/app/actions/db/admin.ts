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
import {
    getPlatformConfig,
    savePlatformConfig,
    type PlatformQuotaConfig,
} from '@/lib/platform-config';
import { getTavilyAdminPoolStatus, type TavilyAdminPoolStatus } from '@/lib/tavily';
import { getCountryOption, normalizeCountryCode } from '@/lib/geo';

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
    useCase: string | null;
}

export interface UseCaseStat {
    useCase: string;
    label: string;
    count: number;
    percentage: number;
}

export interface UserGeoStat {
    countryCode: string;
    labelFr: string;
    labelEn: string;
    flag: string;
    lat: number;
    lng: number;
    userCount: number;
    searchCount: number;
    percentage: number;
}

const UpdatePlatformGovernanceSchema = z.object({
    freeTierDailyQuota: z.number().int().min(1).max(1000).optional(),
    quotaBannerEnabled: z.boolean().optional(),
    quotaBannerMessageFr: z.string().trim().min(5).max(500).optional(),
    quotaBannerMessageEn: z.string().trim().min(5).max(500).optional(),
    tavilyActiveAdminSlot: z.enum(['auto', 'primary', 'secondary']).optional(),
    tavilyPrimaryCreditsUsed: z.number().int().min(0).max(100000).optional(),
    tavilySecondaryCreditsUsed: z.number().int().min(0).max(100000).optional(),
});

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
                createdAt: true,
                profile: {
                    select: {
                        useCase: true
                    }
                }
            }
        });

        return users.map((user): UserData => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: 'Active',
            createdAt: user.createdAt.toISOString(),
            useCase: user.profile?.useCase || null
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

/**
 * Get aggregated summary of onboarding use cases / signup reasons (Admin only)
 */
export async function getOnboardingUseCasesSummary(): Promise<UseCaseStat[]> {
    try {
        const isAdmin = await ensureAdminSession();
        if (!isAdmin) return [];

        const profiles = await prisma.profile.findMany({
            select: { useCase: true }
        });

        const total = profiles.length;
        if (total === 0) return [];

        const counts: Record<string, number> = {};
        profiles.forEach((p: { useCase: string | null }) => {
            const key = p.useCase || 'unspecified';
            counts[key] = (counts[key] || 0) + 1;
        });

        const labelMap: Record<string, string> = {
            'jobs': 'Emploi & Carrière',
            'real-estate': 'Immobilier & Logement',
            'startups': 'Startups & Investissements',
            'business': 'Services B2B & Sourcing',
            'e-commerce': 'E-commerce & Tech',
            'other': 'Autre Domaine',
            'unspecified': 'Non Spécifié'
        };

        return Object.entries(counts).map(([useCase, count]) => ({
            useCase,
            label: labelMap[useCase] || useCase,
            count,
            percentage: Math.round((count / total) * 100)
        })).sort((a, b) => b.count - a.count);
    } catch (error) {
        console.error('Error fetching use cases summary:', error);
        return [];
    }
}

/**
 * Get Admin Platform Governance (Quota Config + Tavily Admin Pool)
 */
export async function getAdminPlatformGovernanceAction(): Promise<{
    success: true;
    data: {
        config: PlatformQuotaConfig;
        tavilyPool: TavilyAdminPoolStatus;
    };
} | {
    success: false;
    error: string;
}> {
    if (!(await ensureAdminSession())) {
        return { success: false, error: 'Unauthorized: Admin access required' };
    }

    try {
        const [config, tavilyPool] = await Promise.all([
            getPlatformConfig(),
            getTavilyAdminPoolStatus(),
        ]);
        return { success: true, data: { config, tavilyPool } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to load governance config',
        };
    }
}

/**
 * Update Free Tier daily quota, UI warning banner, or Tavily Admin slot (Admin only)
 */
export async function updateAdminPlatformGovernanceAction(
    input: z.infer<typeof UpdatePlatformGovernanceSchema>
): Promise<{
    success: boolean;
    data?: { config: PlatformQuotaConfig; tavilyPool: TavilyAdminPoolStatus };
    error?: string;
}> {
    if (!(await ensureAdminSession())) {
        return { success: false, error: 'Unauthorized: Admin access required' };
    }

    const parsed = UpdatePlatformGovernanceSchema.safeParse(input);
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0]?.message || 'Paramètres invalides' };
    }

    try {
        const config = await savePlatformConfig(parsed.data);
        const tavilyPool = await getTavilyAdminPoolStatus();
        revalidatePath('/admin');
        revalidatePath('/');
        return { success: true, data: { config, tavilyPool } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Échec de mise à jour de la gouvernance',
        };
    }
}

/**
 * Aggregate GDPR-compliant country-level stats across registered profiles and search history (Admin only)
 */
export async function getUserGeographyStats(): Promise<UserGeoStat[]> {
    try {
        if (!(await ensureAdminSession())) {
            return [];
        }

        const [profiles, searches] = await Promise.all([
            prisma.profile.findMany({ select: { country: true } }),
            prisma.searchHistory.findMany({ select: { country: true } }),
        ]);

        const map = new Map<string, { userCount: number; searchCount: number }>();

        profiles.forEach((p: { country: string | null }) => {
            const code = normalizeCountryCode(p.country);
            const curr = map.get(code) || { userCount: 0, searchCount: 0 };
            curr.userCount += 1;
            map.set(code, curr);
        });

        searches.forEach((s: { country: string | null }) => {
            const code = normalizeCountryCode(s.country);
            const curr = map.get(code) || { userCount: 0, searchCount: 0 };
            curr.searchCount += 1;
            map.set(code, curr);
        });

        const totalWeight = Array.from(map.values()).reduce(
            (acc, item) => acc + item.userCount + item.searchCount,
            0
        );

        return Array.from(map.entries())
            .map(([countryCode, counts]) => {
                const meta = getCountryOption(countryCode);
                const weight = counts.userCount + counts.searchCount;
                return {
                    countryCode,
                    labelFr: meta.labelFr,
                    labelEn: meta.labelEn,
                    flag: meta.flag,
                    lat: meta.lat,
                    lng: meta.lng,
                    userCount: counts.userCount,
                    searchCount: counts.searchCount,
                    percentage: totalWeight > 0 ? Math.round((weight / totalWeight) * 100) : 0,
                };
            })
            .sort((a, b) => (b.userCount + b.searchCount) - (a.userCount + a.searchCount));
    } catch (error) {
        console.error('Error aggregating user geography stats:', error);
        return [];
    }
}
