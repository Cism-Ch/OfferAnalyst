'use client';

/**
 * Analysis Page
 * 
 * Display analysis results with scores and recommendations
 */

import React from 'react';
import { SimpleLayout } from '@/components/layout/SimpleLayout';
import { useDashboardState } from '@/hooks/use-dashboard-state';
import { useSavedOffers } from '@/hooks/use-saved-offers';
import { ScoreChart } from '@/components/offers/ScoreChart';
import { ResultsSection } from '@/components/offers/ResultsSection';
import { ProviderErrorPanel } from '@/components/offers/ProviderErrorPanel';
import { LiveAIStatusIndicator } from '@/components/offers/LiveAIStatusIndicator';
import { Skeleton } from '@/components/ui/skeleton-premium';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AnalysisPage() {
    const dashboardState = useDashboardState();
    const { saveOffer, isSaved } = useSavedOffers();

    const hasResults = dashboardState.results?.topOffers && dashboardState.results.topOffers.length > 0;
    const isLoading = dashboardState.loading;

    return (
        <SimpleLayout
            title="Analysis Results"
            description="AI-powered recommendations and scores"
            maxWidth="7xl"
        >
            <div className="space-y-6">
                {/* Real-time Processing Indicator */}
                <LiveAIStatusIndicator />

                {/* Intelligent Provider Error Diagnostic Panel */}
                <ProviderErrorPanel />

                {/* State 1: Active Analysis Loading Skeletons */}
                {isLoading ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            {/* Left column loading preview */}
                            <div className="lg:col-span-2 space-y-4">
                                <Card className="border-border/60 p-6 space-y-4">
                                    <Skeleton height={24} width="60%" rounded="md" gradient />
                                    <Skeleton height={200} rounded="lg" gradient />
                                    <Skeleton height={16} width="80%" rounded="sm" gradient />
                                </Card>
                            </div>
                            {/* Right column loading preview */}
                            <div className="lg:col-span-3 space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <Card key={i} className="border-border/60 p-5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Skeleton height={22} width="50%" rounded="md" gradient />
                                            <Skeleton height={20} width={60} rounded="full" gradient />
                                        </div>
                                        <Skeleton height={14} width="90%" rounded="sm" gradient />
                                        <Skeleton height={14} width="75%" rounded="sm" gradient />
                                        <div className="flex gap-2 pt-2">
                                            <Skeleton height={28} width={80} rounded="md" gradient />
                                            <Skeleton height={28} width={80} rounded="md" gradient />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : hasResults ? (
                    /* State 2: Successful Results */
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Left Column - Score Chart */}
                        <div className="lg:col-span-2 space-y-4">
                            {dashboardState.results && (
                                <ScoreChart offers={dashboardState.results.topOffers} />
                            )}
                            
                            {/* Action Buttons */}
                            <Card className="border-none shadow-sm">
                                <CardContent className="pt-6 space-y-3">
                                    <Button variant="outline" className="w-full gap-2" asChild>
                                        <Link href="/data-source">
                                            <RefreshCw className="h-4 w-4" />
                                            New Analysis
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full gap-2" asChild>
                                        <Link href="/">
                                            <ArrowLeft className="h-4 w-4" />
                                            Back to Home
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Results */}
                        <div className="lg:col-span-3">
                            <ResultsSection
                                results={dashboardState.results}
                                onSaveOffer={saveOffer}
                                isOfferSaved={isSaved}
                            />
                        </div>
                    </div>
                ) : !dashboardState.providerError ? (
                    /* State 3: Empty State (When no analysis and no error) */
                    <Card className="border-2 border-dashed">
                        <CardContent className="pt-12 pb-12">
                            <div className="text-center space-y-4">
                                <div className="flex justify-center">
                                    <div className="p-4 rounded-full bg-muted">
                                        <LineChart className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold">No Analysis Available</h3>
                                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                        Start by defining your search context and configuring your data source to see analysis results here.
                                    </p>
                                </div>
                                <div className="flex justify-center gap-3 pt-4">
                                    <Button variant="outline" asChild>
                                        <Link href="/">
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Back to Home
                                        </Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href="/search-context">
                                            Start Analysis
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : null}
            </div>
        </SimpleLayout>
    );
}
