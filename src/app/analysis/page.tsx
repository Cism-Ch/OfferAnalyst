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
import { LineChart, RefreshCw, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AnalysisPage() {
    const dashboardState = useDashboardState();
    const { saveOffer, isSaved } = useSavedOffers();
    const { language } = useLanguage();

    const hasResults = dashboardState.results?.topOffers && dashboardState.results.topOffers.length > 0;
    const isLoading = dashboardState.loading;

    const pageTitle = language === 'fr' ? "Résultats de l'Analyse" : "Analysis Results";
    const pageDescription = language === 'fr' 
        ? "Recommandations et scores personnalisés générés par l'IA" 
        : "AI-powered recommendations and scores";

    return (
        <SimpleLayout
            title={pageTitle}
            description={pageDescription}
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
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Left column loading preview */}
                            <div className="lg:col-span-4 space-y-4">
                                <Card className="border border-border/80 p-6 space-y-4 rounded-xl bg-card shadow-xs">
                                    <Skeleton height={24} width="60%" rounded="md" gradient />
                                    <Skeleton height={200} rounded="lg" gradient />
                                    <Skeleton height={16} width="80%" rounded="sm" gradient />
                                </Card>
                            </div>
                            {/* Right column loading preview */}
                            <div className="lg:col-span-8 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <Card key={i} className="border border-border/80 p-5 space-y-3 rounded-xl bg-card shadow-xs">
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
                    </div>
                ) : hasResults ? (
                    /* State 2: Successful Results */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Left Column (4 cols) - Sticky Score Chart & Actions */}
                        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
                            {dashboardState.results && (
                                <ScoreChart offers={dashboardState.results.topOffers} />
                            )}
                            
                            {/* Action Buttons */}
                            <Card className="border border-border/80 bg-card shadow-xs rounded-xl overflow-hidden">
                                <CardContent className="p-4 sm:p-5 space-y-2.5">
                                    <Button variant="default" className="w-full gap-2 font-semibold shadow-xs" asChild>
                                        <Link href="/data-source">
                                            <RefreshCw className="h-4 w-4" />
                                            {language === 'fr' ? 'Nouvelle Analyse' : 'New Analysis'}
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full gap-2 border-border/80 hover:bg-muted" asChild>
                                        <Link href="/search-context">
                                            <Search className="h-4 w-4" />
                                            {language === 'fr' ? 'Modifier les Critères' : 'Refine Criteria'}
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" className="w-full gap-2 text-muted-foreground hover:text-foreground" asChild>
                                        <Link href="/">
                                            <ArrowLeft className="h-4 w-4" />
                                            {language === 'fr' ? "Retour à l'Accueil" : 'Back to Home'}
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column (8 cols) - Spacious Results Section */}
                        <div className="lg:col-span-8">
                            <ResultsSection
                                results={dashboardState.results}
                                onSaveOffer={saveOffer}
                                isOfferSaved={isSaved}
                                domain={dashboardState.domain}
                                criteria={dashboardState.explicitCriteria}
                                model={dashboardState.model}
                            />
                        </div>
                    </div>
                ) : !dashboardState.providerError ? (
                    /* State 3: Empty State (When no analysis and no error) */
                    <Card className="border-2 border-dashed border-border/70 rounded-2xl bg-card/40">
                        <CardContent className="pt-14 pb-14">
                            <div className="text-center space-y-4">
                                <div className="flex justify-center">
                                    <div className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                                        <LineChart className="h-10 w-10" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-foreground">
                                        {language === 'fr' ? "Aucune Analyse Disponible" : "No Analysis Available"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                                        {language === 'fr' 
                                            ? "Définissez votre contexte de recherche et configurez votre source de données pour afficher vos recommandations personnalisées."
                                            : "Start by defining your search context and configuring your data source to see personalized recommendations here."}
                                    </p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-3 pt-4">
                                    <Button variant="outline" asChild className="rounded-xl">
                                        <Link href="/">
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            {language === 'fr' ? "Retour à l'Accueil" : "Back to Home"}
                                        </Link>
                                    </Button>
                                    <Button asChild className="rounded-xl shadow-xs">
                                        <Link href="/search-context">
                                            {language === 'fr' ? "Commencer l'Analyse" : "Start Analysis"}
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
