'use server';

/**
 * API Key Analytics Actions
 * 
 * Server actions for tracking and retrieving API key usage analytics.
 * Provides insights into BYOK usage patterns, costs, and performance.
 */

import { prisma } from '@/lib/prisma';

export interface APIKeyAnalytics {
    totalRequests: number;
    successRate: number;
    avgResponseTime: number;
    totalTokens: number;
    requestsByProvider: { provider: string; count: number }[];
    requestsByAction: { action: string; count: number }[];
    recentActivity: {
        timestamp: string;
        action: string;
        provider: string;
        success: boolean;
        responseTime: number | null;
    }[];
}

export interface UsageTimelineData {
    date: string;
    requests: number;
    successfulRequests: number;
    failedRequests: number;
}

/**
 * Log API key usage
 */
export async function logAPIKeyUsage(
    userId: string,
    apiKeyId: string,
    provider: string,
    action: string,
    data: {
        model?: string;
        tokensUsed?: number;
        success?: boolean;
        errorMessage?: string;
        responseTime?: number;
        ipAddress?: string;
        userAgent?: string;
    }
): Promise<void> {
    try {
        await prisma.aPIKeyUsageLog.create({
            data: {
                userId,
                apiKeyId,
                provider,
                action,
                model: data.model,
                tokensUsed: data.tokensUsed,
                success: data.success ?? true,
                errorMessage: data.errorMessage,
                responseTime: data.responseTime,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent
            }
        });
    } catch (error) {
        console.error('Error logging API key usage:', error);
        // Don't throw - logging failures shouldn't break main operations
    }
}

/**
 * Get comprehensive API key analytics for a user
 */
export async function getAPIKeyAnalytics(
    userId: string,
    apiKeyId?: string,
    days: number = 30
): Promise<APIKeyAnalytics> {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const whereClause: {
            userId: string;
            apiKeyId?: string;
            timestamp?: { gte: Date };
        } = {
            userId,
            timestamp: { gte: startDate }
        };

        if (apiKeyId) {
            whereClause.apiKeyId = apiKeyId;
        }

        const [logs, byProvider, byAction] = await Promise.all([
            prisma.aPIKeyUsageLog.findMany({
                where: whereClause,
                orderBy: { timestamp: 'desc' },
                take: 50,
                select: {
                    timestamp: true,
                    action: true,
                    provider: true,
                    success: true,
                    responseTime: true
                }
            }),
            prisma.aPIKeyUsageLog.groupBy({
                by: ['provider'],
                where: whereClause,
                _count: { provider: true }
            }),
            prisma.aPIKeyUsageLog.groupBy({
                by: ['action'],
                where: whereClause,
                _count: { action: true }
            })
        ]);

        const allLogs = await prisma.aPIKeyUsageLog.findMany({
            where: whereClause,
            select: {
                success: true,
                responseTime: true,
                tokensUsed: true
            }
        });

        const totalRequests = allLogs.length;
        const successfulRequests = allLogs.filter(log => log.success).length;
        const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;

        const responseTimes = allLogs.filter(log => log.responseTime != null).map(log => log.responseTime!);
        const avgResponseTime = responseTimes.length > 0
            ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
            : 0;

        const totalTokens = allLogs.reduce((sum, log) => sum + (log.tokensUsed || 0), 0);

        return {
            totalRequests,
            successRate: Math.round(successRate * 10) / 10,
            avgResponseTime: Math.round(avgResponseTime),
            totalTokens,
            requestsByProvider: byProvider.map(item => ({
                provider: item.provider,
                count: item._count.provider
            })),
            requestsByAction: byAction.map(item => ({
                action: item.action,
                count: item._count.action
            })),
            recentActivity: logs.map(log => ({
                timestamp: log.timestamp.toISOString(),
                action: log.action,
                provider: log.provider,
                success: log.success,
                responseTime: log.responseTime
            }))
        };
    } catch (error) {
        console.error('Error fetching API key analytics:', error);
        return {
            totalRequests: 0,
            successRate: 0,
            avgResponseTime: 0,
            totalTokens: 0,
            requestsByProvider: [],
            requestsByAction: [],
            recentActivity: []
        };
    }
}

/**
 * Get usage timeline for charts
 */
export async function getUsageTimeline(
    userId: string,
    apiKeyId?: string,
    days: number = 30
): Promise<UsageTimelineData[]> {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const whereClause: {
            userId: string;
            apiKeyId?: string;
            timestamp?: { gte: Date };
        } = {
            userId,
            timestamp: { gte: startDate }
        };

        if (apiKeyId) {
            whereClause.apiKeyId = apiKeyId;
        }

        const logs = await prisma.aPIKeyUsageLog.findMany({
            where: whereClause,
            select: {
                timestamp: true,
                success: true
            }
        });

        // Group by date
        const grouped = logs.reduce((acc: { [key: string]: { total: number; successful: number; failed: number } }, log) => {
            const date = log.timestamp.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { total: 0, successful: 0, failed: 0 };
            }
            acc[date].total++;
            if (log.success) {
                acc[date].successful++;
            } else {
                acc[date].failed++;
            }
            return acc;
        }, {});

        return Object.entries(grouped).map(([date, data]) => ({
            date,
            requests: data.total,
            successfulRequests: data.successful,
            failedRequests: data.failed
        })).sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
        console.error('Error fetching usage timeline:', error);
        return [];
    }
}

/**
 * Check for suspicious activity and create alerts
 */
export async function checkForSuspiciousActivity(
    userId: string,
    apiKeyId: string
): Promise<void> {
    try {
        const last24Hours = new Date();
        last24Hours.setHours(last24Hours.getHours() - 24);

        // Get recent usage
        const recentUsage = await prisma.aPIKeyUsageLog.count({
            where: {
                userId,
                apiKeyId,
                timestamp: { gte: last24Hours }
            }
        });

        // Get the rate limit for this key
        const apiKey = await prisma.aPIKey.findUnique({
            where: { id: apiKeyId },
            select: { rateLimit: true, name: true }
        });

        // Check if rate limit is exceeded
        if (apiKey?.rateLimit && recentUsage > apiKey.rateLimit * 24) {
            await createSecurityAlert(
                userId,
                apiKeyId,
                'rate_limit_exceeded',
                'high',
                `Rate limit exceeded for key "${apiKey.name}". ${recentUsage} requests in last 24 hours (limit: ${apiKey.rateLimit * 24}).`
            );
        }

        // Check for unusual activity patterns
        const failedRequests = await prisma.aPIKeyUsageLog.count({
            where: {
                userId,
                apiKeyId,
                timestamp: { gte: last24Hours },
                success: false
            }
        });

        if (failedRequests > 10 && failedRequests / recentUsage > 0.5) {
            await createSecurityAlert(
                userId,
                apiKeyId,
                'high_failure_rate',
                'medium',
                `High failure rate detected for key "${apiKey?.name}". ${failedRequests} failed requests out of ${recentUsage} total.`
            );
        }
    } catch (error) {
        console.error('Error checking for suspicious activity:', error);
    }
}

/**
 * Create a security alert
 */
async function createSecurityAlert(
    userId: string,
    apiKeyId: string | null,
    alertType: string,
    severity: string,
    message: string,
    metadata?: object
): Promise<void> {
    try {
        // Check if similar alert already exists and is unresolved
        const existingAlert = await prisma.securityAlert.findFirst({
            where: {
                userId,
                apiKeyId,
                alertType,
                isResolved: false,
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
            }
        });

        if (!existingAlert) {
            await prisma.securityAlert.create({
                data: {
                    userId,
                    apiKeyId,
                    alertType,
                    severity,
                    message,
                    metadata: metadata ? JSON.stringify(metadata) : null
                }
            });

            // Send email notification for high and critical severity alerts
            if (severity === 'high' || severity === 'critical') {
                try {
                    const user = await prisma.user.findUnique({
                        where: { id: userId },
                        select: { email: true }
                    });

                    const apiKey = apiKeyId ? await prisma.aPIKey.findUnique({
                        where: { id: apiKeyId },
                        select: { name: true }
                    }) : null;

                    if (user?.email) {
                        const { sendSecurityAlertEmail } = await import('@/lib/email-notifications');
                        await sendSecurityAlertEmail(
                            user.email,
                            alertType,
                            severity,
                            message,
                            apiKey?.name
                        );
                    }
                } catch (emailError) {
                    console.error('Error sending email notification:', emailError);
                    // Don't fail alert creation if email fails
                }
            }
        }
    } catch (error) {
        console.error('Error creating security alert:', error);
    }
}
