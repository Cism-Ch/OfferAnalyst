'use server';

/**
 * Security Alert Actions
 * 
 * Server actions for managing security alerts.
 */

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export interface SecurityAlertData {
    id: string;
    alertType: string;
    severity: string;
    message: string;
    metadata: object | null;
    isRead: boolean;
    isResolved: boolean;
    resolvedAt: string | null;
    createdAt: string;
    apiKeyName?: string;
}

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

/**
 * Get security alerts for a user
 */
export async function getUserSecurityAlerts(
    providedUserId: string,
    options?: {
        unreadOnly?: boolean;
        unresolvedOnly?: boolean;
        limit?: number;
    }
): Promise<SecurityAlertData[]> {
    try {
        const sessionUserId = await getAuthenticatedUserId();
        if (!sessionUserId) {
            return [];
        }
        const userId = sessionUserId;

        const whereClause: {
            userId: string;
            isRead?: boolean;
            isResolved?: boolean;
        } = { userId };

        if (options?.unreadOnly) {
            whereClause.isRead = false;
        }

        if (options?.unresolvedOnly) {
            whereClause.isResolved = false;
        }

        const alerts = await prisma.securityAlert.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc'
            },
            take: options?.limit || 50,
            include: {
                // Get API key name if available
                user: {
                    select: {
                        apiKeys: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });

        interface AlertWithKeys {
            id: string;
            alertType: string;
            severity: string;
            message: string;
            metadata: string | null;
            isRead: boolean;
            isResolved: boolean;
            resolvedAt: Date | null;
            createdAt: Date;
            apiKeyId: string | null;
            user: {
                apiKeys: {
                    id: string;
                    name: string;
                }[];
            };
        }

        return (alerts as unknown as AlertWithKeys[]).map((alert: AlertWithKeys) => ({
            id: alert.id,
            alertType: alert.alertType,
            severity: alert.severity,
            message: alert.message,
            metadata: alert.metadata ? JSON.parse(alert.metadata) : null,
            isRead: alert.isRead,
            isResolved: alert.isResolved,
            resolvedAt: alert.resolvedAt?.toISOString() || null,
            createdAt: alert.createdAt.toISOString(),
            apiKeyName: alert.apiKeyId 
                ? alert.user.apiKeys.find((k: { id: string; name: string }) => k.id === alert.apiKeyId)?.name 
                : undefined
        }));
    } catch (error) {
        console.error('Error fetching security alerts:', error);
        return [];
    }
}

/**
 * Mark alert as read
 */
export async function markAlertAsRead(
    providedUserId: string,
    alertId: string
): Promise<{ success: boolean; message: string }> {
    try {
        const sessionUserId = await getAuthenticatedUserId();
        if (!sessionUserId) {
            return { success: false, message: 'Non authentifié' };
        }
        const userId = sessionUserId;

        await prisma.securityAlert.updateMany({
            where: {
                id: alertId,
                userId // Ensure user owns the alert
            },
            data: {
                isRead: true
            }
        });

        return {
            success: true,
            message: 'Alert marked as read'
        };
    } catch (error) {
        console.error('Error marking alert as read:', error);
        return {
            success: false,
            message: 'Failed to mark alert as read'
        };
    }
}

/**
 * Resolve alert
 */
export async function resolveAlert(
    providedUserId: string,
    alertId: string
): Promise<{ success: boolean; message: string }> {
    try {
        const sessionUserId = await getAuthenticatedUserId();
        if (!sessionUserId) {
            return { success: false, message: 'Non authentifié' };
        }
        const userId = sessionUserId;

        await prisma.securityAlert.updateMany({
            where: {
                id: alertId,
                userId // Ensure user owns the alert
            },
            data: {
                isResolved: true,
                resolvedAt: new Date(),
                isRead: true
            }
        });

        return {
            success: true,
            message: 'Alert resolved'
        };
    } catch (error) {
        console.error('Error resolving alert:', error);
        return {
            success: false,
            message: 'Failed to resolve alert'
        };
    }
}

/**
 * Get unread alert count
 */
export async function getUnreadAlertCount(providedUserId: string): Promise<number> {
    try {
        const sessionUserId = await getAuthenticatedUserId();
        if (!sessionUserId) {
            return 0;
        }
        const userId = sessionUserId;

        return await prisma.securityAlert.count({
            where: {
                userId,
                isRead: false
            }
        });
    } catch (error) {
        console.error('Error fetching unread alert count:', error);
        return 0;
    }
}

/**
 * Delete all resolved alerts
 */
export async function deleteResolvedAlerts(
    providedUserId: string
): Promise<{ success: boolean; message: string; count: number }> {
    try {
        const sessionUserId = await getAuthenticatedUserId();
        if (!sessionUserId) {
            return { success: false, message: 'Non authentifié', count: 0 };
        }
        const userId = sessionUserId;

        const result = await prisma.securityAlert.deleteMany({
            where: {
                userId,
                isResolved: true
            }
        });

        return {
            success: true,
            message: `Deleted ${result.count} resolved alerts`,
            count: result.count
        };
    } catch (error) {
        console.error('Error deleting resolved alerts:', error);
        return {
            success: false,
            message: 'Failed to delete resolved alerts',
            count: 0
        };
    }
}
