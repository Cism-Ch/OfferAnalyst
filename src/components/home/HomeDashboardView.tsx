'use client';

/**
 * Home Dashboard View (Active Application Shell)
 * 
 * Main workflow interface for OfferAnalyst:
 * - 3-step structured pipeline (Context -> Data Source -> Analysis)
 * - Model selector with default NVIDIA Nemotron 3.5 Lightning
 * - Quick jump to SaaS presentation showcase (/landing)
 * - Automatically ensures 'offeranalyst_app_mode=app' cookie is active
 */

import React, { useEffect } from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { useDashboardState } from '@/hooks/use-dashboard-state';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
    Sparkles, 
    Search, 
    Database, 
    LineChart, 
    TrendingUp, 
    Target,
    Zap,
    ArrowRight,
    CheckCircle2,
    Presentation
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { staggerContainerProps, staggerItemProps } from '@/lib/motion';
import { setAppModeCookie } from '@/lib/cookie-nav';

export function HomeDashboardView() {
    const dashboardState = useDashboardState();
    const { t, language } = useLanguage();
    const isFr = language === 'fr';

    // Ensure app mode cookie is set so future refreshes stay on the app
    useEffect(() => {
        setAppModeCookie('app');
    }, []);

    const steps = [
        {
            number: '1',
            title: t.home.step1Title,
            description: t.home.step1Desc,
            icon: Search,
            href: '/search-context',
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10'
        },
        {
            number: '2',
            title: t.home.step2Title,
            description: t.home.step2Desc,
            icon: Database,
            href: '/data-source',
            color: 'text-green-500',
            bgColor: 'bg-green-500/10'
        },
        {
            number: '3',
            title: t.home.step3Title,
            description: t.home.step3Desc,
            icon: LineChart,
            href: '/analysis',
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10'
        }
    ];

    const features = [
        { icon: Sparkles, text: t.home.badgeAI },
        { icon: Target, text: t.home.badgeRanking },
        { icon: TrendingUp, text: t.home.badgeVisualization },
        { icon: Zap, text: t.home.badgeRealtime }
    ];

    return (
        <ModernLayout
            selectedModel={dashboardState.model}
            onModelChange={(modelId) => dashboardState.setModel(modelId)}
            title={t.home.heroTitle}
            description={t.home.heroSubtitle}
        >
            <motion.div 
                className="space-y-6 sm:space-y-8"
                {...staggerContainerProps}
            >
                {/* SaaS Showcase Quick Banner */}
                <motion.div {...staggerItemProps}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs sm:text-sm">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                                <Presentation className="h-4 w-4" />
                            </div>
                            <div>
                                <span className="font-semibold text-foreground">
                                    {isFr ? "Nouveau visiteur ou besoin d'une présentation ?" : "New visitor or looking for our SaaS overview?"}
                                </span>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {isFr
                                        ? "Consultez la vitrine produit avec la démo interactive en 1 clic et les citations web."
                                        : "Explore our product showcase with the 1-click live demo and verified web citations."}
                                </p>
                            </div>
                        </div>

                        <Link href="/landing" className="shrink-0 self-end sm:self-center">
                            <Button
                                variant="outline"
                                size="sm"
                                className="min-h-[38px] text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/10 touch-manipulation"
                            >
                                <span>{isFr ? "Voir la Vitrine SaaS" : "View SaaS Showcase"}</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* Hero Section */}
                <motion.div {...staggerItemProps}>
                    <Card className="border-none shadow-lg bg-gradient-to-br from-primary/5 via-background to-background">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 rounded-xl bg-primary/10">
                                    <Sparkles className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl sm:text-2xl">{t.home.cardTitle}</CardTitle>
                                    <CardDescription className="text-sm sm:text-base mt-1">
                                        {t.home.cardDescription}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
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
                        {t.home.workflowTitle}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {steps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 + 0.2 }}
                            >
                                <Link href={step.href}>
                                    <Card className="border-2 hover:border-primary/50 transition-[border-color,box-shadow,transform] duration-200 hover:shadow-lg cursor-pointer h-full">
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
                                            <div className="w-full flex items-center justify-between text-sm font-medium px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors group">
                                                <span>{t.home.btnGetStarted}</span>
                                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Example Visualization Skeleton */}
                <motion.div {...staggerItemProps}>
                    <h2 className="text-lg font-semibold mb-4">{t.home.previewTitle}</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Score Chart Skeleton */}
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                    {t.home.scoreDistTitle}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    {t.home.scoreDistDesc}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[85, 72, 68].map((score, idx) => (
                                        <div key={idx} className="space-y-1.5">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">{t.home.offerLabel} {idx + 1}</span>
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
                                    {t.home.topRecTitle}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    {t.home.topRecDesc}
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
                                    <h3 className="text-lg font-semibold mb-1">{t.home.ctaTitle}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {t.home.ctaDesc}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button asChild size="lg" className="gap-2 touch-manipulation min-h-[44px]">
                                        <Link href="/search-context">
                                            <Search className="h-4 w-4" />
                                            {t.home.ctaBtn}
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </ModernLayout>
    );
}

