"use client";

/**
 * Home Page - Main Dashboard Interface
 *
 * Main dashboard interface for the OfferAnalyst application.
 * Provides a comprehensive interface for analyzing offers using AI-powered
 * contextual analysis and web scraping capabilities.
 *
 * Features:
 * - User input for domain, criteria, and preferences
 * - Auto-fetch functionality for web scraping
 * - AI-powered offer analysis and scoring
 * - Interactive visualizations of results
 * - Save functionality for interesting offers
 * - Search history tracking
 *
 * Architecture:
 * - Modular component structure for maintainability
 * - Custom hooks for state and business logic separation
 * - Reusable UI components for consistency
 */

import React, { Suspense } from "react";
import { motion } from "framer-motion";
import { useSavedOffers } from "@/hooks/use-saved-offers";
import { useSearchHistory } from "@/hooks/use-search-history";
import { useDashboardState } from "@/hooks/use-dashboard-state";
import { useOfferAnalysis } from "@/hooks/use-offer-analysis";
import { useRestoreSearch } from "@/hooks/use-restore-search";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ConfigurationCard } from "@/components/offers/ConfigurationCard";
import { ScoreChart } from "@/components/offers/ScoreChart";
import { ResultsSection } from "@/components/offers/ResultsSection";
import { ProviderErrorPanel } from "@/components/offers/ProviderErrorPanel";

/**
 * Main Home Page Content
 *
 * Separated to allow for Suspense boundary when using search params
 */
function HomeContent() {
    // Custom hooks for state management
    const dashboardState = useDashboardState();
    const { saveOffer, isSaved } = useSavedOffers();
    const { addToHistory } = useSearchHistory();

    // Restore search from history if requested
    useRestoreSearch({
        setDomain: dashboardState.setDomain,
        setExplicitCriteria: dashboardState.setExplicitCriteria,
        setImplicitContext: dashboardState.setImplicitContext,
        setOffersInput: dashboardState.setOffersInput,
        setResults: dashboardState.setResults,
    });

    // Custom hook for business logic
    const { handleAnalyze } = useOfferAnalysis({
        setLoading: dashboardState.setLoading,
        setFetching: dashboardState.setFetching,
        setResults: dashboardState.setResults,
        setOffersInput: dashboardState.setOffersInput,
        addToHistory,
        selectedModel: dashboardState.model,
        setProviderError: dashboardState.setProviderError,
    });

    /**
     * Handles the analysis workflow initiation
     * Passes all necessary parameters to the analysis hook
     */
    const onAnalyze = () => {
        handleAnalyze({
            autoFetch: dashboardState.autoFetch,
            offersInput: dashboardState.offersInput,
            domain: dashboardState.domain,
            explicitCriteria: dashboardState.explicitCriteria,
            implicitContext: dashboardState.implicitContext,
            limit: dashboardState.limit,
        });
    };

    return (
        <div className="flex min-h-screen overflow-hidden bg-zinc-50 font-sans text-neutral-900 dark:bg-zinc-950">
            {/* Sidebar Navigation */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex h-screen flex-1 flex-col overflow-hidden">
                {/* Header */}
                <Header
                    selectedModel={dashboardState.model}
                    onModelChange={(modelId) => dashboardState.setModel(modelId)}
                />

                {/* Dashboard Content */}
                <div className="custom-scrollbar flex-1 overflow-y-auto p-8">
                    <div className="mx-auto max-w-[1600px] space-y-8">
                        {/* Alert / Progress Panel */}
                        <ProviderErrorPanel
                            error={dashboardState.providerError}
                            onDismiss={() => dashboardState.setProviderError(null)}
                            onRetry={onAnalyze}
                            activeModelId={dashboardState.model}
                        />

                        {/* Interactive Grid Layout */}
                        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-12">
                            {/* Main Analysis Column */}
                            <div className="space-y-8 xl:col-span-8">
                                <ConfigurationCard
                                    domain={dashboardState.domain}
                                    setDomain={dashboardState.setDomain}
                                    explicitCriteria={dashboardState.explicitCriteria}
                                    setExplicitCriteria={dashboardState.setExplicitCriteria}
                                    implicitContext={dashboardState.implicitContext}
                                    setImplicitContext={dashboardState.setImplicitContext}
                                    offersInput={dashboardState.offersInput}
                                    setOffersInput={dashboardState.setOffersInput}
                                    autoFetch={dashboardState.autoFetch}
                                    setAutoFetch={dashboardState.setAutoFetch}
                                    limit={dashboardState.limit}
                                    setLimit={dashboardState.setLimit}
                                    loading={dashboardState.loading}
                                    fetching={dashboardState.fetching}
                                    onAnalyze={onAnalyze}
                                />

                                {/* Intelligence Visualization */}
                                {dashboardState.results?.topOffers &&
                                    dashboardState.results.topOffers.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3, duration: 0.7 }}
                                        >
                                            <ScoreChart offers={dashboardState.results.topOffers} />
                                        </motion.div>
                                    )}
                            </div>

                            {/* Intelligence Feed Column */}
                            <div className="sticky top-0 xl:col-span-4">
                                <ResultsSection
                                    results={dashboardState.results}
                                    onSaveOffer={saveOffer}
                                    isOfferSaved={isSaved}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

/**
 * Main Home Page Component
 *
 * Orchestrates the entire dashboard interface by composing
 * smaller, focused components and managing the application state.
 *
 * @returns {JSX.Element} The complete dashboard interface
 */
export default function Home() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950">
                    <div className="animate-pulse text-muted-foreground">
                        Loading dashboard...
                    </div>
                </div>
            }
        >
            <HomeContent />
        </Suspense>
    );
}
