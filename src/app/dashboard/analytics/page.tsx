'use client';

/**
 * Analytics Dashboard Page
 * 
 * Advanced data visualization for user activity and analysis statistics.
 * Features:
 * - KPI cards (searches, results, avg score, saved offers)
 * - Line chart for searches over time
 * - Pie chart for top categories
 * - Histogram for score distribution
 * - Bar chart for model usage
 * - Date range filter
 * - Export capabilities (future)
 */

import React, { useState } from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    BarChart3, 
    TrendingUp, 
    Target, 
    Save,
    Download,
    Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUpProps, staggerContainerProps, staggerItemProps } from '@/lib/motion';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
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

export default function AnalyticsPage() {
    const [dateRange, setDateRange] = useState('30'); // 7, 30, 90 days

    // Mock data - will be replaced with actual analytics
    const kpiData = {
        totalSearches: 342,
        resultsFound: 4128,
        avgScore: 7.8,
        savedOffers: 89
    };

    const searchesOverTime = [
        { date: 'Jan 15', searches: 12 },
        { date: 'Jan 16', searches: 18 },
        { date: 'Jan 17', searches: 15 },
        { date: 'Jan 18', searches: 22 },
        { date: 'Jan 19', searches: 28 },
        { date: 'Jan 20', searches: 25 },
        { date: 'Jan 21', searches: 31 }
    ];

    const categoriesData = [
        { name: 'Real Estate', value: 45 },
        { name: 'Jobs', value: 30 },
        { name: 'E-commerce', value: 15 },
        { name: 'Services', value: 10 }
    ];

    const scoreDistribution = [
        { score: '0-2', count: 5 },
        { score: '2-4', count: 12 },
        { score: '4-6', count: 28 },
        { score: '6-8', count: 45 },
        { score: '8-10', count: 32 }
    ];

    const modelUsage = [
        { model: 'GPT-4o Mini', requests: 156 },
        { model: 'Gemini Flash', requests: 98 },
        { model: 'DeepSeek R1', requests: 67 },
        { model: 'Claude Sonnet', requests: 21 }
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    return (
        <ModernLayout>
            <div className="container mx-auto py-8 px-4 max-w-7xl">
                {/* Header */}
                <motion.div {...fadeInUpProps} className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
                            <p className="text-muted-foreground">
                                Insights into your analysis activity and performance
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                                <Calendar className="w-4 h-4 mr-2" />
                                Last {dateRange} days
                            </Button>
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* KPI Cards */}
                <motion.div {...fadeInUpProps} className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4" />
                                    Total Searches
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{kpiData.totalSearches}</div>
                                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    +12% from last period
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    Results Found
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{kpiData.resultsFound.toLocaleString()}</div>
                                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    +8% from last period
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Avg Score
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{kpiData.avgScore}/10</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    High quality matches
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    Saved Offers
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{kpiData.savedOffers}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Across all searches
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                {/* Charts */}
                <motion.div {...staggerContainerProps} className="space-y-6">
                    {/* Searches Over Time */}
                    <motion.div {...staggerItemProps}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Searches Over Time</CardTitle>
                                <CardDescription>
                                    Daily search activity for the last {dateRange} days
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={searchesOverTime}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                                        <YAxis stroke="hsl(var(--muted-foreground))" />
                                        <Tooltip 
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--card))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey="searches" 
                                            stroke="hsl(var(--primary))" 
                                            strokeWidth={2}
                                            dot={{ fill: 'hsl(var(--primary))' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Categories */}
                        <motion.div {...staggerItemProps}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Top Categories</CardTitle>
                                    <CardDescription>
                                        Distribution by search category
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={categoriesData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={(entry) => entry.name}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {categoriesData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Score Distribution */}
                        <motion.div {...staggerItemProps}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Score Distribution</CardTitle>
                                    <CardDescription>
                                        Quality of analyzed offers
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={scoreDistribution}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                            <XAxis dataKey="score" stroke="hsl(var(--muted-foreground))" />
                                            <YAxis stroke="hsl(var(--muted-foreground))" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'hsl(var(--card))',
                                                    border: '1px solid hsl(var(--border))',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <Bar dataKey="count" fill="hsl(var(--primary))" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Model Usage */}
                    <motion.div {...staggerItemProps}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Model Usage</CardTitle>
                                <CardDescription>
                                    AI models used in your analyses
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={modelUsage} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                                        <YAxis dataKey="model" type="category" stroke="hsl(var(--muted-foreground))" width={120} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--card))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Bar dataKey="requests" fill="hsl(var(--primary))" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>
        </ModernLayout>
    );
}
