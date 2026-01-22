'use server';

/**
 * Analytics Database Actions
 * 
 * Server actions for retrieving analytics data from MongoDB.
 * Provides insights into user activity and system usage.
 */

import { prisma } from '@/lib/prisma';

export interface AnalyticsData {
    totalSearches: number;
    resultsFound: number;
    avgScore: number;
    savedOffers: number;
}

export interface SearchTimelineData {
    date: string;
    searches: number;
}

export interface CategoryData {
    name: string;
    value: number;
}

/**
 * Get KPI data for a user
 */
export async function getUserAnalytics(userId: string): Promise<AnalyticsData> {
    try {
        const [searchCount, savedCount, savedOffers] = await Promise.all([
            prisma.searchHistory.count({
                where: { userId }
            }),
            prisma.savedOffer.count({
                where: { userId }
            }),
            prisma.savedOffer.findMany({
                where: { userId },
                select: { score: true }
            })
        ]);

        const avgScore = savedOffers.length > 0
            ? savedOffers.reduce((sum, offer) => sum + offer.score, 0) / savedOffers.length
            : 0;

        return {
            totalSearches: searchCount,
            resultsFound: savedOffers.length * 10, // Rough estimate
            avgScore: Math.round(avgScore * 10) / 10,
            savedOffers: savedCount
        };
    } catch (error) {
        console.error('Error fetching user analytics:', error);
        return {
            totalSearches: 0,
            resultsFound: 0,
            avgScore: 0,
            savedOffers: 0
        };
    }
}

/**
 * Get search timeline data for charts
 */
export async function getSearchTimeline(
    userId: string,
    days: number = 7
): Promise<SearchTimelineData[]> {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const searches = await prisma.searchHistory.findMany({
            where: {
                userId,
                timestamp: {
                    gte: startDate
                }
            },
            orderBy: {
                timestamp: 'asc'
            }
        });

        // Group by date
        const grouped = searches.reduce((acc: Record<string, number>, search) => {
            const date = search.timestamp.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(grouped).map(([date, count]) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            searches: count
        }));
    } catch (error) {
        console.error('Error fetching search timeline:', error);
        return [];
    }
}

/**
 * Get category distribution data
 */
export async function getCategoryDistribution(userId: string): Promise<CategoryData[]> {
    try {
        const savedOffers = await prisma.savedOffer.findMany({
            where: { userId },
            select: { category: true }
        });

        // Count by category
        const categoryCount = savedOffers.reduce((acc: Record<string, number>, offer) => {
            const category = offer.category || 'Other';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(categoryCount).map(([name, value]) => ({
            name,
            value
        }));
    } catch (error) {
        console.error('Error fetching category distribution:', error);
        return [];
    }
}

/**
 * Get score distribution data
 */
export async function getScoreDistribution(userId: string): Promise<{ score: string; count: number }[]> {
    try {
        const savedOffers = await prisma.savedOffer.findMany({
            where: { userId },
            select: { score: true }
        });

        // Group into score ranges
        const ranges = [
            { label: '0-2', min: 0, max: 2, count: 0 },
            { label: '2-4', min: 2, max: 4, count: 0 },
            { label: '4-6', min: 4, max: 6, count: 0 },
            { label: '6-8', min: 6, max: 8, count: 0 },
            { label: '8-10', min: 8, max: 10, count: 0 }
        ];

        savedOffers.forEach(offer => {
            const range = ranges.find(r => offer.score >= r.min && offer.score < r.max);
            if (range) range.count++;
        });

        return ranges.map(r => ({ score: r.label, count: r.count }));
    } catch (error) {
        console.error('Error fetching score distribution:', error);
        return [];
    }
}

/**
 * Get model usage statistics
 */
export async function getModelUsage(userId: string): Promise<{ model: string; requests: number }[]> {
    try {
        const searches = await prisma.searchHistory.findMany({
            where: { userId },
            select: { model: true }
        });

        // Count by model
        const modelCount = searches.reduce((acc: Record<string, number>, search) => {
            acc[search.model] = (acc[search.model] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(modelCount)
            .map(([model, requests]) => ({ model, requests }))
            .sort((a, b) => b.requests - a.requests);
    } catch (error) {
        console.error('Error fetching model usage:', error);
        return [];
    }
}
