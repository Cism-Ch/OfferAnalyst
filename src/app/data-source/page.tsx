'use client';

/**
 * Data Source Page
 * 
 * Dedicated page for configuring data input (AI fetch or manual JSON)
 */

import React from 'react';
import { SimpleLayout } from '@/components/layout/SimpleLayout';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ClientOnlySwitch } from '@/components/ClientOnlySwitch';
import { Database, Bot, Loader2, ArrowRight, Info, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { LiveAIStatusIndicator } from '@/components/offers/LiveAIStatusIndicator';
import { ProviderErrorPanel } from '@/components/offers/ProviderErrorPanel';

export default function DataSourcePage() {
    const dashboardState = useAnalysis();
    const router = useRouter();
    const { t } = useLanguage();
    const ds = t.dataSourcePage;

    const onAnalyze = () => {
        dashboardState.startAnalysis();
        router.push('/analysis');
    };

    return (
        <SimpleLayout
            title={ds.methodTitle}
            description={ds.methodDesc}
            maxWidth="5xl"
        >
            <div className="space-y-6">
                {/* Live AI Status or Provider Error */}
                <LiveAIStatusIndicator />
                <ProviderErrorPanel />
                {/* Info Banner */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                        <div className="flex gap-3">
                            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium">{ds.bannerTitle}</p>
                                <p className="text-xs text-muted-foreground">
                                    {ds.bannerDesc}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Source Configuration */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Database className="text-primary" size={20} />
                                    {ds.methodTitle}
                                </CardTitle>
                                <CardDescription>
                                    {ds.methodDesc}
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="gap-2">
                                <Bot size={12} />
                                AI Powered
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Auto-Fetch Toggle */}
                        <div className="flex items-center justify-between rounded-lg border-2 p-4 bg-muted/50">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold">{ds.autoFetchTitle}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {ds.autoFetchDesc}
                                </p>
                                <div className="flex gap-2 mt-2">
                                    <Badge variant="secondary" className="text-xs">{ds.badgeRecommended}</Badge>
                                    <Badge variant="outline" className="text-xs">{ds.badgeRealtime}</Badge>
                                </div>
                            </div>
                            <ClientOnlySwitch>
                                <Switch
                                    checked={dashboardState.autoFetch}
                                    onCheckedChange={dashboardState.setAutoFetch}
                                    className="data-[state=checked]:bg-primary"
                                    aria-label={ds.autoFetchTitle}
                                />
                            </ClientOnlySwitch>
                        </div>

                        {/* JSON Input */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-base">
                                    {ds.jsonTitle}
                                </Label>
                                {dashboardState.autoFetch && (
                                    <Badge variant="secondary" className="text-xs">
                                        {ds.jsonDisabled}
                                    </Badge>
                                )}
                            </div>
                            <Textarea
                                value={dashboardState.offersInput}
                                onChange={(e) => dashboardState.setOffersInput(e.target.value)}
                                className="font-mono text-xs h-64 resize-none"
                                placeholder={`[\n  {\n    "id": "1",\n    "title": "Senior Frontend Developer",\n    "description": "React, Next.js, $120k, Remote",\n    "price": 120000,\n    "location": "Remote",\n    "category": "Job"\n  }\n]`}
                                disabled={dashboardState.autoFetch}
                            />
                            <p className="text-xs text-muted-foreground">
                                {dashboardState.autoFetch 
                                    ? ds.jsonHintDisabled
                                    : ds.jsonHintEnabled}
                            </p>
                        </div>

                        {/* Action Buttons - Responsive Mobile-First */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t">
                            <Button variant="outline" className="w-full sm:w-auto min-h-[44px]" asChild>
                                <Link href="/search-context" className="gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    {ds.btnBack}
                                </Link>
                            </Button>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <Button variant="outline" className="w-full sm:w-auto min-h-[44px]" asChild>
                                    <Link href="/">{ds.btnCancel}</Link>
                                </Button>
                                <Button 
                                    onClick={onAnalyze} 
                                    disabled={dashboardState.loading || (!dashboardState.autoFetch && !dashboardState.offersInput)}
                                    className="gap-2 w-full sm:w-auto min-h-[44px]"
                                >
                                    {dashboardState.loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            {dashboardState.fetching ? ds.btnFetching : ds.btnAnalyzing}
                                        </>
                                    ) : (
                                        <>
                                            {ds.btnAnalyze}
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Help Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-none shadow-sm bg-gradient-to-br from-blue-500/5 to-background">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Bot className="h-4 w-4 text-blue-500" />
                                {ds.helpAutoTitle}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p className="text-muted-foreground">{ds.helpAutoDesc}</p>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-blue-500 shrink-0" />
                                    <p>{ds.helpAutoPoint1}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-blue-500 shrink-0" />
                                    <p>{ds.helpAutoPoint2}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-blue-500 shrink-0" />
                                    <p>{ds.helpAutoPoint3}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-gradient-to-br from-purple-500/5 to-background">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Database className="h-4 w-4 text-purple-500" />
                                {ds.helpJsonTitle}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p className="text-muted-foreground">{ds.helpJsonDesc}</p>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-purple-500 shrink-0" />
                                    <p>{ds.helpJsonPoint1}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-purple-500 shrink-0" />
                                    <p>{ds.helpJsonPoint2}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-purple-500 shrink-0" />
                                    <p>{ds.helpJsonPoint3}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </SimpleLayout>
    );
}
