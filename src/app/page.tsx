'use client';

/**
 * Home Page - Welcome Dashboard with Instructions
 * 
 * Main welcome interface for the OfferAnalyst application.
 * Provides instructions and visual examples of the analysis workflow.
 */

import React from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { useDashboardState } from '@/hooks/use-dashboard-state';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Sparkles, 
    Search, 
    Database, 
    LineChart, 
    TrendingUp, 
    Target,
    Zap,
    ArrowRight,
    CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { staggerContainerProps, staggerItemProps } from '@/lib/motion';

/**
 * Main Home Page Component
 */
export default function Home() {
    const dashboardState = useDashboardState();

    const steps = [
        {
            number: '1',
            title: 'Define Search Context',
            description: 'Set your domain, criteria, and preferences to guide the AI analysis',
            icon: Search,
            href: '/search-context',
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10'
        },
        {
            number: '2',
            title: 'Configure Data Source',
            description: 'Choose between AI web scraping or manual JSON input',
            icon: Database,
            href: '/data-source',
            color: 'text-green-500',
            bgColor: 'bg-green-500/10'
        },
        {
            number: '3',
            title: 'View Analysis Results',
            description: 'Get AI-powered recommendations with detailed scoring',
            icon: LineChart,
            href: '/analysis',
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10'
        }
    ];

    const features = [
        { icon: Sparkles, text: 'AI-Powered Analysis' },
        { icon: Target, text: 'Contextual Ranking' },
        { icon: TrendingUp, text: 'Score Visualization' },
        { icon: Zap, text: 'Real-time Processing' }
    ];

    return (
        <ModernLayout
            selectedModel={dashboardState.model}
            onModelChange={(modelId) => dashboardState.setModel(modelId)}
            title="Welcome to OfferAnalyst"
            description="AI-powered contextual offer analysis and recommendations"
        >
            <motion.div 
                className="space-y-8"
                {...staggerContainerProps}
            >
                {/* Hero Section */}
                <motion.div {...staggerItemProps}>
                    <Card className="border-none shadow-lg bg-gradient-to-br from-primary/5 via-background to-background">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 rounded-xl bg-primary/10">
                                    <Sparkles className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Get Started with AI Analysis</CardTitle>
                                    <CardDescription className="text-base mt-1">
                                        Follow these steps to analyze and rank offers based on your context
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-3">
                                {features.map((feature, idx) => (
                                    <Badge key={idx} variant="secondary" className="px-3 py-1.5 gap-2">
                                        <feature.icon className="h-3.5 w-3.5" />
                                        {feature.text}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Workflow Steps */}
                <motion.div {...staggerItemProps}>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        Analysis Workflow
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {steps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 + 0.2 }}
                            >
                                <Link href={step.href}>
                                    <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg cursor-pointer h-full">
                                        <CardHeader>
                                            <div className="flex items-start justify-between mb-3">
                                                <div className={cn('p-3 rounded-xl', step.bgColor)}>
                                                    <step.icon className={cn('h-6 w-6', step.color)} />
                                                </div>
                                                <Badge variant="outline" className="text-lg font-bold">
                                                    {step.number}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-lg">{step.title}</CardTitle>
                                            <CardDescription className="text-sm">
                                                {step.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Button variant="ghost" className="w-full justify-between group">
                                                Get Started
                                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Example Visualization Skeleton */}
                <motion.div {...staggerItemProps}>
                    <h2 className="text-lg font-semibold mb-4">Analysis Preview</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Score Chart Skeleton */}
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                    Score Distribution
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Visual representation of offer scores
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[85, 72, 68].map((score, idx) => (
                                        <div key={idx} className="space-y-1.5">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Offer {idx + 1}</span>
                                                <Badge variant="outline">{score}%</Badge>
                                            </div>
                                            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${score}%` }}
                                                    transition={{ delay: idx * 0.2 + 0.5, duration: 0.8, ease: 'easeOut' }}
                                                    className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Offers Skeleton */}
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Target className="h-4 w-4 text-primary" />
                                    Top Recommendations
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    AI-ranked offers based on your context
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[1, 2, 3].map((num) => (
                                        <div key={num} className="p-3 border rounded-lg space-y-2 hover:bg-accent/50 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1 flex-1">
                                                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                                                    <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
                                                </div>
                                                <Badge variant="secondary" className="ml-2">#{num}</Badge>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="h-5 bg-muted rounded-full w-16 animate-pulse"></div>
                                                <div className="h-5 bg-muted rounded-full w-20 animate-pulse"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                {/* Quick Start CTA */}
                <motion.div {...staggerItemProps}>
                    <Card className="border-2 border-primary/20 bg-primary/5">
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="text-center md:text-left">
                                    <h3 className="text-lg font-semibold mb-1">Ready to analyze offers?</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Start by defining your search context and let AI do the work
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Link href="/search-context">
                                        <Button size="lg" className="gap-2">
                                            <Search className="h-4 w-4" />
                                            Start Analysis
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </ModernLayout>
    );
}

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}
