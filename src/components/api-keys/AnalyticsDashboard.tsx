'use client';

/**
 * API Key Analytics Dashboard
 * 
 * Comprehensive dashboard displaying API key usage analytics with charts and metrics.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Activity, 
    TrendingUp, 
    Clock, 
    Zap,
    BarChart3,
    PieChart as PieChartIcon,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    LineChart, 
    Line, 
    PieChart, 
    Pie, 
    Cell,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';
import { 
    getAPIKeyAnalytics, 
    getUsageTimeline,
    type APIKeyAnalytics 
} from '@/app/actions/db/api-key-analytics';

interface AnalyticsDashboardProps {
    userId: string;
    apiKeyId?: string;
    days?: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function AnalyticsDashboard({ userId, apiKeyId, days = 30 }: AnalyticsDashboardProps) {
    const [analytics, setAnalytics] = useState<APIKeyAnalytics | null>(null);
    const [timeline, setTimeline] = useState<Array<{ date: string; requests: number }>>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadAnalytics = useCallback(async () => {
        setIsLoading(true);
        try {
            const [analyticsData, timelineData] = await Promise.all([
                getAPIKeyAnalytics(userId, apiKeyId, days),
                getUsageTimeline(userId, apiKeyId, days)
            ]);
            setAnalytics(analyticsData);
            setTimeline(timelineData);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setIsLoading(false);
        }
    }, [userId, apiKeyId, days]);

    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <Card key={i}>
                        <CardContent className="h-48 flex items-center justify-center">
                            <div className="animate-pulse text-muted-foreground">Loading analytics...</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!analytics) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    No analytics data available
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalRequests}</div>
                        <p className="text-xs text-muted-foreground">Last {days} days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.successRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            {Math.round((analytics.successRate / 100) * analytics.totalRequests)} successful
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.avgResponseTime}ms</div>
                        <p className="text-xs text-muted-foreground">Average latency</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalTokens.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total consumption</p>
                    </CardContent>
                </Card>
            </div>

            {/* Usage Timeline Chart */}
            {timeline.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Usage Over Time
                        </CardTitle>
                        <CardDescription>Daily request volume and success rate</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={timeline}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="requests" 
                                    stroke="#3b82f6" 
                                    name="Total Requests"
                                    strokeWidth={2}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="successfulRequests" 
                                    stroke="#10b981" 
                                    name="Successful"
                                    strokeWidth={2}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="failedRequests" 
                                    stroke="#ef4444" 
                                    name="Failed"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Provider and Action Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Requests by Provider */}
                {analytics.requestsByProvider.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PieChartIcon className="w-5 h-5" />
                                Requests by Provider
                            </CardTitle>
                            <CardDescription>Distribution across AI providers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={analytics.requestsByProvider}
                                        dataKey="count"
                                        nameKey="provider"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label={(props: unknown) => {
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            const entry = (props as any).payload || props;
                                            return `${entry.provider}: ${entry.count}`;
                                        }}
                                    >
                                        {analytics.requestsByProvider.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Requests by Action */}
                {analytics.requestsByAction.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5" />
                                Requests by Action
                            </CardTitle>
                            <CardDescription>Usage breakdown by operation type</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={analytics.requestsByAction}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="action" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Recent Activity */}
            {analytics.recentActivity.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Last 50 API requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {analytics.recentActivity.slice(0, 10).map((activity, index) => (
                                <div 
                                    key={index} 
                                    className="flex items-center justify-between p-3 rounded-lg border bg-background"
                                >
                                    <div className="flex items-center gap-3">
                                        {activity.success ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-500" />
                                        )}
                                        <div>
                                            <p className="text-sm font-medium">
                                                {activity.action} - {activity.provider}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(activity.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    {activity.responseTime && (
                                        <Badge variant="outline">
                                            {activity.responseTime}ms
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
