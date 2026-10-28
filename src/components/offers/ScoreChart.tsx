'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ScoredOffer } from '@/types';

/**
 * ScoreChart Component Props
 */
interface ScoreChartProps {
    /** Array of scored offers to display in the chart */
    offers: ScoredOffer[];
}

/**
 * ScoreChart Component
 * 
 * Visualizes the score distribution of analyzed offers using a bar chart.
 * Each bar represents an offer with its final AI-generated score.
 * 
 * This component uses Recharts library for data visualization and provides
 * an interactive tooltip on hover.
 * 
 * Features:
 * - Responsive chart that adapts to container size
 * - Custom styling matching the application theme
 * - Interactive tooltips
 * - Accessible axis labels
 * 
 * @param {ScoreChartProps} props - Component props
 * @returns {JSX.Element|null} The score distribution chart, or null if no offers
 */
export function ScoreChart({ offers }: ScoreChartProps) {
    // Don't render if no offers
    if (!offers || offers.length === 0) {
        return null;
    }

    return (
        <Card className="border-none shadow-sm">
            <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[220px] p-2 sm:p-6">
                <ResponsiveContainer width="100%" height={180}>
                    <BarChart 
                        data={offers} 
                        margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                    >
                        <XAxis 
                            dataKey="title" 
                            fontSize={11} 
                            tickLine={false} 
                            axisLine={false} 
                            tickFormatter={(val: string) => (typeof val === 'string' && val.length > 10 ? `${val.slice(0, 8)}…` : val)}
                        />
                        <YAxis 
                            fontSize={11} 
                            tickLine={false} 
                            axisLine={false} 
                        />
                        <Tooltip
                            contentStyle={{ 
                                backgroundColor: 'var(--card)',
                                color: 'var(--card-foreground)',
                                borderRadius: '8px', 
                                border: '1px solid var(--border)', 
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                            }}
                            cursor={{ fill: 'transparent' }}
                        />
                        <Bar 
                            dataKey="finalScore" 
                            fill="var(--color-primary)" 
                            radius={[4, 4, 0, 0]} 
                            barSize={40} 
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
