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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        <ModernLayout maxWidth="7xl">
            {/* Header */}
                <motion.div {...fadeInUpProps} className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Analytics Dashboard</h1>
                            <p className="text-sm sm:text-base text-muted-foreground">
                                Insights into your analysis activity and performance
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Button variant="outline" size="sm" className="h-9 min-h-[36px] sm:min-h-0">
                                <Calendar className="w-4 h-4 mr-2" />
                                Last {dateRange} days
                            </Button>
                            <Button variant="outline" size="sm" className="h-9 min-h-[36px] sm:min-h-0">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* KPI Cards: Responsive 2 cols on mobile, 4 on desktop */}
                <motion.div {...fadeInUpProps} className="mb-6 sm:mb-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <Card>
                            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                                    <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                                    Total Searches
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                                <div className="text-xl sm:text-3xl font-bold">{kpiData.totalSearches}</div>
                                <p className="text-[11px] sm:text-xs text-green-500 mt-1 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    +12% from last period
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                                    <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                                    Results Found
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                                <div className="text-xl sm:text-3xl font-bold">{kpiData.resultsFound.toLocaleString()}</div>
                                <p className="text-[11px] sm:text-xs text-green-500 mt-1 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    +8% from last period
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                                    Avg Score
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                                <div className="text-xl sm:text-3xl font-bold">{kpiData.avgScore}/10</div>
                                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                                    High quality matches
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                                    <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                                    Saved Offers
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                                <div className="text-xl sm:text-3xl font-bold">{kpiData.savedOffers}</div>
                                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
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
                                <CardTitle className="text-base sm:text-lg">Searches Over Time</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Daily search activity for the last {dateRange} days
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[240px] sm:h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={searchesOverTime} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                                            <XAxis 
                                                dataKey="date" 
                                                stroke="var(--muted-foreground)" 
                                                minTickGap={20} 
                                                interval="preserveStartEnd" 
                                                fontSize={11} 
                                            />
                                            <YAxis 
                                                stroke="var(--muted-foreground)" 
                                                fontSize={11} 
                                                width={35} 
                                            />
                                            <Tooltip 
                                                contentStyle={{
                                                    backgroundColor: 'var(--card)',
                                                    color: 'var(--card-foreground)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '8px',
                                                    fontSize: '12px'
                                                }}
                                            />
                                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                                            <Line 
                                                type="monotone" 
                                                dataKey="searches" 
                                                stroke="var(--primary)" 
                                                strokeWidth={2}
                                                dot={{ fill: 'var(--primary)' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Categories */}
                        <motion.div {...staggerItemProps}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base sm:text-lg">Top Categories</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">
                                        Distribution by search category
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[240px] sm:h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={categoriesData}
                                                    cx="50%"
                                                    cy="45%"
                                                    innerRadius={45}
                                                    outerRadius={70}
                                                    paddingAngle={2}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {categoriesData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{
                                                        backgroundColor: 'var(--card)',
                                                        color: 'var(--card-foreground)',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: '8px',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Score Distribution */}
                        <motion.div {...staggerItemProps}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base sm:text-lg">Score Distribution</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">
                                        Quality of analyzed offers
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[240px] sm:h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={scoreDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                                                <XAxis 
                                                    dataKey="score" 
                                                    stroke="var(--muted-foreground)" 
                                                    minTickGap={20} 
                                                    interval="preserveStartEnd" 
                                                    fontSize={11} 
                                                />
                                                <YAxis 
                                                    stroke="var(--muted-foreground)" 
                                                    fontSize={11} 
                                                    width={35} 
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'var(--card)',
                                                        color: 'var(--card-foreground)',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: '8px',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Model Usage */}
                    <motion.div {...staggerItemProps}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base sm:text-lg">Model Usage</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    AI models used in your analyses
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[240px] sm:h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={modelUsage} layout="vertical" margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                                            <XAxis 
                                                type="number" 
                                                stroke="var(--muted-foreground)" 
                                                minTickGap={20} 
                                                fontSize={11} 
                                            />
                                            <YAxis 
                                                dataKey="model" 
                                                type="category" 
                                                stroke="var(--muted-foreground)" 
                                                width={90} 
                                                fontSize={11} 
                                                tickFormatter={(val: string) => val.length > 12 ? `${val.slice(0, 10)}…` : val} 
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'var(--card)',
                                                    color: 'var(--card-foreground)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '8px',
                                                    fontSize: '12px'
                                                }}
                                            />
                                            <Bar dataKey="requests" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
        </ModernLayout>
    );
}
