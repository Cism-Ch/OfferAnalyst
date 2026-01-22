/**
 * Privacy-first analytics service
 * Tracks events server-side without external SaaS dependencies
 * Compliant with GDPR and privacy regulations
 */

import { prisma } from './prisma';

export type AnalyticsEventType =
  | 'page_view'
  | 'search_started'
  | 'search_completed'
  | 'analysis_started'
  | 'analysis_completed'
  | 'offer_saved'
  | 'offer_unsaved'
  | 'project_created'
  | 'project_updated'
  | 'theme_changed'
  | 'model_changed'
  | 'export_data';

export interface AnalyticsEventData {
  type: AnalyticsEventType;
  userId?: string;
  metadata?: Record<string, unknown>;
  userAgent?: string;
  path?: string;
}

export interface WebVitalsMetric {
  name: 'FCP' | 'LCP' | 'CLS' | 'TTFB' | 'FID' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  path?: string;
  userId?: string;
}

/**
 * Track an analytics event
 * Events are stored in MongoDB for privacy-first analytics
 */
export async function trackEvent(event: AnalyticsEventData): Promise<void> {
  try {
    // Development: Log events to console for debugging
    // Production: Will store to database once AnalyticsEvent schema is added to Prisma
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics Event]', {
        type: event.type,
        userId: event.userId ? `user_${event.userId.substring(0, 8)}...` : 'anonymous',
        path: event.path,
        timestamp: new Date().toISOString(),
      });
    }

    // TODO: Implement database storage when AnalyticsEvent model is added to schema.prisma
    // Example implementation (commented out until schema is ready):
    // await prisma.analyticsEvent.create({
    //   data: {
    //     type: event.type,
    //     userId: event.userId,
    //     metadata: event.metadata ? JSON.stringify(event.metadata) : null,
    //     userAgent: event.userAgent,
    //     path: event.path,
    //   }
    // });
  } catch (error) {
    // Silent fail - analytics should never break the app
    console.error('[Analytics] Failed to track event:', error);
  }
}

/**
 * Track Web Vitals metrics
 */
export async function trackWebVitals(metric: WebVitalsMetric): Promise<void> {
  try {
    // Development: Log metrics to console for debugging
    // Production: Will store to database once PerformanceMetric schema is added to Prisma
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals]', {
        name: metric.name,
        value: Math.round(metric.value),
        rating: metric.rating,
        path: metric.path,
      });
    }

    // TODO: Implement database storage when PerformanceMetric model is added to schema.prisma
    // Example implementation (commented out until schema is ready):
    // await prisma.performanceMetric.create({
    //   data: {
    //     name: metric.name,
    //     value: metric.value,
    //     rating: metric.rating,
    //     path: metric.path,
    //     userId: metric.userId,
    //   }
    // });
  } catch (error) {
    console.error('[Analytics] Failed to track web vitals:', error);
  }
}

/**
 * Get analytics summary for a user
 */
export async function getUserAnalytics(userId: string, days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get user's search count
    const searchCount = await prisma.searchHistory.count({
      where: {
        userId,
        timestamp: { gte: startDate },
      },
    });

    // Get saved offers count
    const savedOffersCount = await prisma.savedOffer.count({
      where: {
        userId,
        savedAt: { gte: startDate },
      },
    });

    // Get projects count
    const projectsCount = await prisma.project.count({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
    });

    // Get API usage
    const creditsUsed = await prisma.credit.aggregate({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      _sum: {
        amount: true,
      },
    });

    return {
      period: `${days} days`,
      searches: searchCount,
      savedOffers: savedOffersCount,
      projects: projectsCount,
      apiCallsUsed: creditsUsed._sum.amount || 0,
    };
  } catch (error) {
    console.error('[Analytics] Failed to get user analytics:', error);
    return null;
  }
}

/**
 * Get platform-wide analytics summary
 * Only accessible by admin users
 */
export async function getPlatformAnalytics(days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total users
    const totalUsers = await prisma.user.count();

    // Active users (users with searches in period)
    const activeUsers = await prisma.searchHistory.groupBy({
      by: ['userId'],
      where: {
        timestamp: { gte: startDate },
      },
    });

    // Total searches
    const totalSearches = await prisma.searchHistory.count({
      where: {
        timestamp: { gte: startDate },
      },
    });

    // Total saved offers
    const totalSavedOffers = await prisma.savedOffer.count({
      where: {
        savedAt: { gte: startDate },
      },
    });

    // Total projects
    const totalProjects = await prisma.project.count({
      where: {
        createdAt: { gte: startDate },
      },
    });

    // Total API usage
    const totalCredits = await prisma.credit.aggregate({
      where: {
        createdAt: { gte: startDate },
      },
      _sum: {
        amount: true,
      },
    });

    return {
      period: `${days} days`,
      users: {
        total: totalUsers,
        active: activeUsers.length,
        activationRate: totalUsers > 0 ? (activeUsers.length / totalUsers) * 100 : 0,
      },
      engagement: {
        searches: totalSearches,
        savedOffers: totalSavedOffers,
        projects: totalProjects,
      },
      apiUsage: {
        totalCalls: totalCredits._sum.amount || 0,
      },
    };
  } catch (error) {
    console.error('[Analytics] Failed to get platform analytics:', error);
    return null;
  }
}

/**
 * Track credit usage for API calls
 */
export async function trackCreditUsage(
  userId: string,
  action: 'FETCH' | 'ANALYZE' | 'ORGANIZE',
  model?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.credit.create({
      data: {
        userId,
        action,
        model: model || null,
        amount: 1,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    console.error('[Analytics] Failed to track credit usage:', error);
  }
}
