'use client';

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

import React from 'react';
import { useSavedOffers } from '@/hooks/use-saved-offers';
import { useSearchHistory } from '@/hooks/use-search-history';
import { useDashboardState } from '@/hooks/use-dashboard-state';
import { useOfferAnalysis } from '@/hooks/use-offer-analysis';
import { useRestoreSearch } from '@/hooks/use-restore-search';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ConfigurationCard } from '@/components/offers/ConfigurationCard';
import { ScoreChart } from '@/components/offers/ScoreChart';
import { ResultsSection } from '@/components/offers/ResultsSection';

/**
 * Main Home Page Component
 * 
 * Orchestrates the entire dashboard interface by composing
 * smaller, focused components and managing the application state.
 * 
 * @returns {JSX.Element} The complete dashboard interface
 */
export default function Home() {
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
        setResults: dashboardState.setResults
    });

    // Custom hook for business logic
    const { handleAnalyze } = useOfferAnalysis({
        setLoading: dashboardState.setLoading,
        setFetching: dashboardState.setFetching,
        setResults: dashboardState.setResults,
        setOffersInput: dashboardState.setOffersInput,
        addToHistory
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
            limit: dashboardState.limit
        });
    };

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans text-neutral-900">
            {/* Sidebar Navigation */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col">
                {/* Header */}
                <Header />

                {/* Dashboard Content */}
                <div className="flex-1 p-6 overflow-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Column - Configuration and Visualization */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Configuration Card */}
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

                            {/* Score Distribution Chart */}
                            {dashboardState.results?.topOffers && dashboardState.results.topOffers.length > 0 && (
                                <ScoreChart offers={dashboardState.results.topOffers} />
                            )}
                        </div>

                        {/* Right Column - Results */}
                        <div className="space-y-6">
                            <ResultsSection
                                results={dashboardState.results}
                                onSaveOffer={saveOffer}
                                isOfferSaved={isSaved}
                            />
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
