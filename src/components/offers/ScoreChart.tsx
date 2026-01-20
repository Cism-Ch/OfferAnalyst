"use client";

import React from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { ScoredOffer } from "@/types";

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
import { WidgetCard } from "@/components/premium/WidgetCard";

export function ScoreChart({ offers }: ScoreChartProps) {
  // Don't render if no offers
  if (!offers || offers.length === 0) {
    return null;
  }

  return (
    <WidgetCard className="border-none shadow-xl" neonHover delay={0.3}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <div className="h-6 w-1 rounded-full bg-neon" />
          Relative Intelligence Score
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={offers}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--neon)" stopOpacity={1} />
                <stop offset="100%" stopColor="var(--neon)" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="title"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#888", fontWeight: 600 }}
              interval={0}
              height={60}
              tickFormatter={(value) =>
                value.length > 15 ? `${value.substring(0, 15)}...` : value
              }
            />
            <YAxis
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#888", fontWeight: 600 }}
              domain={[0, 100]}
            />
            <Tooltip
              cursor={{ fill: "rgba(212, 255, 0, 0.1)" }}
              contentStyle={{
                backgroundColor: "rgba(9, 9, 11, 0.9)",
                borderRadius: "12px",
                border: "1px solid rgba(212, 255, 0, 0.2)",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                backdropFilter: "blur(8px)",
                color: "#fff",
              }}
              itemStyle={{ color: "var(--neon)", fontWeight: "bold" }}
            />
            <Bar
              dataKey="finalScore"
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]}
              barSize={50}
              className="drop-shadow-[0_0_8px_rgba(212,255,0,0.4)]"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </WidgetCard>
  );
}
