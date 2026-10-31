'use client';

/**
 * Search Context Page
 * 
 * Dedicated page for defining search parameters and context
 */

import React from 'react';
import { SimpleLayout } from '@/components/layout/SimpleLayout';
import { useDashboardState } from '@/hooks/use-dashboard-state';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientOnlySelect } from '@/components/ClientOnlySelect';
import { Sparkles, ArrowRight, Info } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function SearchContextPage() {
    const dashboardState = useDashboardState();
    const { t } = useLanguage();
    const sc = t.searchContextPage;

    const applyPreset = (preset: { label: string; icon: string; domain: string; criteria: string; context: string }) => {
        dashboardState.setDomain(preset.domain);
        dashboardState.setExplicitCriteria(preset.criteria);
        dashboardState.setImplicitContext(preset.context);
    };

    return (
        <SimpleLayout
            title={sc.formTitle}
            description={sc.formDesc}
            maxWidth="5xl"
        >
            <div className="space-y-6">
                {/* Info Banner */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                        <div className="flex gap-3">
                            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium">{sc.bannerTitle}</p>
                                <p className="text-xs text-muted-foreground">
                                    {sc.bannerDesc}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Search Context Form */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="text-primary" size={20} />
                            {sc.formTitle}
                        </CardTitle>
                        <CardDescription>
                            {sc.formDesc}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* 1-Click Quick Presets */}
                        <div className="p-3.5 rounded-lg border bg-muted/30 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {sc.presetsTitle}
                                </span>
                                <span className="text-xs text-muted-foreground">{sc.presetsClick}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {sc.presets.map((p) => (
                                    <button
                                        key={p.label}
                                        type="button"
                                        onClick={() => applyPreset(p)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-background hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all cursor-pointer"
                                    >
                                        <span>{p.icon}</span>
                                        <span>{p.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Domain and Limit Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>{sc.domainLabel}</Label>
                                <Input 
                                    value={dashboardState.domain} 
                                    onChange={(e) => dashboardState.setDomain(e.target.value)} 
                                    placeholder={sc.domainPlaceholder} 
                                />
                                <p className="text-xs text-muted-foreground">
                                    {sc.domainHint}
                                </p>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>{sc.limitLabel}</Label>
                                <ClientOnlySelect>
                                    <Select value={dashboardState.limit} onValueChange={dashboardState.setLimit}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={sc.selectLimit} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="3">{sc.top3}</SelectItem>
                                            <SelectItem value="5">{sc.top5}</SelectItem>
                                            <SelectItem value="10">{sc.top10}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </ClientOnlySelect>
                                <p className="text-xs text-muted-foreground">
                                    {sc.limitHint}
                                </p>
                            </div>
                        </div>

                        {/* Explicit Criteria */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Label>{sc.explicitLabel}</Label>
                                <Badge variant="secondary" className="text-xs">{sc.badgeRequired}</Badge>
                            </div>
                            <Input 
                                value={dashboardState.explicitCriteria} 
                                onChange={(e) => dashboardState.setExplicitCriteria(e.target.value)} 
                                placeholder={sc.explicitPlaceholder} 
                            />
                            <p className="text-xs text-muted-foreground">
                                {sc.explicitHint}
                            </p>
                        </div>

                        {/* Implicit Context */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Label>{sc.implicitLabel}</Label>
                                <Badge variant="outline" className="text-xs">{sc.badgePreferences}</Badge>
                            </div>
                            <Textarea
                                value={dashboardState.implicitContext}
                                onChange={(e) => dashboardState.setImplicitContext(e.target.value)}
                                placeholder={sc.implicitPlaceholder}
                                className="resize-none h-32"
                            />
                            <p className="text-xs text-muted-foreground">
                                {sc.implicitHint}
                            </p>
                        </div>

                        {/* Action Buttons - Responsive Mobile-First */}
                        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t">
                            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                                {sc.readyNext}
                            </p>
                            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                                <Button variant="outline" className="w-full sm:w-auto min-h-[44px] sm:min-h-0 touch-manipulation" asChild>
                                    <Link href="/">{sc.btnCancel}</Link>
                                </Button>
                                <Button className="w-full sm:w-auto min-h-[44px] sm:min-h-0 touch-manipulation" asChild>
                                    <Link href="/data-source" className="gap-2">
                                        {sc.btnNext}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tips Card */}
                <Card className="border-none shadow-sm bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-base">{sc.tipsTitle}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex gap-2">
                            <span className="text-primary">•</span>
                            <p>{sc.tip1}</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-primary">•</span>
                            <p>{sc.tip2}</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-primary">•</span>
                            <p>{sc.tip3}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </SimpleLayout>
    );
}
