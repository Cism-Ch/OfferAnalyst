'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { BarChart3 } from "lucide-react";
import { ScoredOffer } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

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
 * Visualizes the score distribution of analyzed offers using a responsive bar chart.
 */
export function ScoreChart({ offers }: ScoreChartProps) {
    const { language } = useLanguage();

    // Don't render if no offers
    if (!offers || offers.length === 0) {
        return null;
    }

    const chartTitle = language === 'fr' ? 'Distribution des Scores' : 'Score Distribution';

    return (
        <Card className="border border-border/80 bg-card shadow-xs rounded-xl overflow-hidden">
            <CardHeader className="p-4 sm:p-5 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    {chartTitle}
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[220px] p-2 sm:p-5 pt-0">
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
