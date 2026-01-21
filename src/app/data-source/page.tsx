'use client';

/**
 * Data Source Page
 * 
 * Dedicated page for configuring data input (AI fetch or manual JSON)
 */

import React from 'react';
import { SimpleLayout } from '@/components/layout/SimpleLayout';
import { useDashboardState } from '@/hooks/use-dashboard-state';
import { useOfferAnalysis } from '@/hooks/use-offer-analysis';
import { useSavedOffers } from '@/hooks/use-saved-offers';
import { useSearchHistory } from '@/hooks/use-search-history';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ClientOnlySwitch } from '@/components/ClientOnlySwitch';
import { Database, Bot, Loader2, ArrowRight, Info, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export default function DataSourcePage() {
    const dashboardState = useDashboardState();
    const { addToHistory } = useSearchHistory();
    const router = useRouter();

    const { handleAnalyze } = useOfferAnalysis({
        setLoading: dashboardState.setLoading,
        setFetching: dashboardState.setFetching,
        setResults: dashboardState.setResults,
        setOffersInput: dashboardState.setOffersInput,
        addToHistory,
        selectedModel: dashboardState.model,
        setProviderError: dashboardState.setProviderError
    });

    const onAnalyze = () => {
        handleAnalyze({
            autoFetch: dashboardState.autoFetch,
            offersInput: dashboardState.offersInput,
            domain: dashboardState.domain,
            explicitCriteria: dashboardState.explicitCriteria,
            implicitContext: dashboardState.implicitContext,
            limit: dashboardState.limit
        });
        // Navigate to analysis page after starting
        router.push('/analysis');
    };

    return (
        <SimpleLayout
            title="Data Source"
            description="Choose your data input method"
            maxWidth="5xl"
        >
            <div className="space-y-6">
                {/* Info Banner */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                        <div className="flex gap-3">
                            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Configure your data source</p>
                                <p className="text-xs text-muted-foreground">
                                    Choose between AI-powered web scraping or manual JSON input for your offer data.
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
                                    Data Input Method
                                </CardTitle>
                                <CardDescription>
                                    Select how you want to provide offer data
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
                                <Label className="text-base font-semibold">Auto-Fetch Offers</Label>
                                <p className="text-sm text-muted-foreground">
                                    AI will automatically search the web for relevant offers based on your context
                                </p>
                                <div className="flex gap-2 mt-2">
                                    <Badge variant="secondary" className="text-xs">Recommended</Badge>
                                    <Badge variant="outline" className="text-xs">Real-time data</Badge>
                                </div>
                            </div>
                            <ClientOnlySwitch>
                                <Switch
                                    checked={dashboardState.autoFetch}
                                    onCheckedChange={dashboardState.setAutoFetch}
                                    className="data-[state=checked]:bg-primary"
                                />
                            </ClientOnlySwitch>
                        </div>

                        {/* JSON Input */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-base">
                                    Manual JSON Input
                                </Label>
                                {dashboardState.autoFetch && (
                                    <Badge variant="secondary" className="text-xs">
                                        Disabled (Auto-fetch enabled)
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
                                    ? 'Disable auto-fetch to manually input offer data in JSON format'
                                    : 'Paste your offer data as a JSON array. Each offer should have: id, title, description'}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t">
                            <Button variant="outline" asChild>
                                <Link href="/search-context" className="gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Context
                                </Link>
                            </Button>
                            <div className="flex gap-3">
                                <Button variant="outline" asChild>
                                    <Link href="/">Cancel</Link>
                                </Button>
                                <Button 
                                    onClick={onAnalyze} 
                                    disabled={dashboardState.loading || (!dashboardState.autoFetch && !dashboardState.offersInput)}
                                    className="gap-2"
                                >
                                    {dashboardState.loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            {dashboardState.fetching ? "Fetching..." : "Analyzing..."}
                                        </>
                                    ) : (
                                        <>
                                            Start Analysis
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
                                Auto-Fetch (Recommended)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p className="text-muted-foreground">Perfect for:</p>
                            <div className="space-y-1">
                                <div className="flex gap-2">
                                    <span className="text-blue-500">✓</span>
                                    <p>Real-time market data</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-blue-500">✓</span>
                                    <p>Discovering new offers</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-blue-500">✓</span>
                                    <p>Automated data collection</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-gradient-to-br from-purple-500/5 to-background">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Database className="h-4 w-4 text-purple-500" />
                                Manual JSON Input
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p className="text-muted-foreground">Perfect for:</p>
                            <div className="space-y-1">
                                <div className="flex gap-2">
                                    <span className="text-purple-500">✓</span>
                                    <p>Pre-collected data</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-purple-500">✓</span>
                                    <p>Specific offer comparison</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-purple-500">✓</span>
                                    <p>Custom data sources</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </SimpleLayout>
    );
}
