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
import { ModernLayout } from '@/components/layout/ModernLayout';
import { ScoreChart } from '@/components/offers/ScoreChart';
import { ResultsSection } from '@/components/offers/ResultsSection';
import { ProviderErrorPanel } from '@/components/offers/ProviderErrorPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ClientOnlySelect } from '@/components/ClientOnlySelect';
import { ClientOnlySwitch } from '@/components/ClientOnlySwitch';
import { Loader2, Sparkles, Bot } from 'lucide-react';

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
        addToHistory,
        selectedModel: dashboardState.model,
        setProviderError: dashboardState.setProviderError
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
        <ModernLayout
            selectedModel={dashboardState.model}
            onModelChange={(modelId) => dashboardState.setModel(modelId)}
        >
            <div className="space-y-6">
                <ProviderErrorPanel
                    error={dashboardState.providerError}
                    onDismiss={() => dashboardState.setProviderError(null)}
                    onRetry={onAnalyze}
                    activeModelId={dashboardState.model}
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left Column - Configuration (Smaller) */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Search Context Card */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Sparkles className="text-primary" size={16} />
                                    Search Context
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Define what you're looking for
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {/* Domain and Limit Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Domain</Label>
                                        <Input 
                                            value={dashboardState.domain} 
                                            onChange={(e) => dashboardState.setDomain(e.target.value)} 
                                            placeholder="e.g. Jobs" 
                                            className="h-9"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Results</Label>
                                        <ClientOnlySelect>
                                            <Select value={dashboardState.limit} onValueChange={dashboardState.setLimit}>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Limit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="3">Top 3</SelectItem>
                                                    <SelectItem value="5">Top 5</SelectItem>
                                                    <SelectItem value="10">Top 10</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </ClientOnlySelect>
                                    </div>
                                </div>

                                {/* Explicit Criteria */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Explicit Criteria</Label>
                                    <Input 
                                        value={dashboardState.explicitCriteria} 
                                        onChange={(e) => dashboardState.setExplicitCriteria(e.target.value)} 
                                        placeholder="Budget, Location..." 
                                        className="h-9"
                                    />
                                </div>

                                {/* Implicit Context */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Implicit Context</Label>
                                    <Textarea
                                        value={dashboardState.implicitContext}
                                        onChange={(e) => dashboardState.setImplicitContext(e.target.value)}
                                        placeholder="What matters to you?"
                                        className="resize-none h-20 text-sm"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Data Source Card */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Bot className="text-primary" size={16} />
                                        Data Source
                                    </CardTitle>
                                    <Badge variant="outline" className="text-xs">
                                        AI Powered
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {/* Auto-Fetch Toggle */}
                                <div className="flex items-center justify-between rounded-lg border p-2.5 bg-muted/50">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium">Auto-Fetch</Label>
                                        <p className="text-xs text-muted-foreground">
                                            AI searches web
                                        </p>
                                    </div>
                                    <ClientOnlySwitch>
                                        <Switch
                                            checked={dashboardState.autoFetch}
                                            onCheckedChange={dashboardState.setAutoFetch}
                                        />
                                    </ClientOnlySwitch>
                                </div>

                                {/* JSON Input */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs">
                                        Manual JSON Input
                                        {dashboardState.autoFetch && (
                                            <span className="text-muted-foreground ml-1">
                                                (disabled)
                                            </span>
                                        )}
                                    </Label>
                                    <Textarea
                                        value={dashboardState.offersInput}
                                        onChange={(e) => dashboardState.setOffersInput(e.target.value)}
                                        className="font-mono text-xs h-24 resize-none"
                                        placeholder='[{"id":"1","title":"..."}]'
                                        disabled={dashboardState.autoFetch}
                                    />
                                </div>

                                {/* Action Button */}
                                <Button 
                                    onClick={onAnalyze} 
                                    disabled={dashboardState.loading} 
                                    className="w-full"
                                >
                                    {dashboardState.loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {dashboardState.fetching ? "Fetching..." : "Analyzing..."}
                                        </>
                                    ) : "Start Analysis"}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Score Chart (if results exist) */}
                        {dashboardState.results?.topOffers && dashboardState.results.topOffers.length > 0 && (
                            <ScoreChart offers={dashboardState.results.topOffers} />
                        )}
                    </div>

                    {/* Right Column - Results (Larger) */}
                    <div className="lg:col-span-3 space-y-4">
                        <ResultsSection
                            results={dashboardState.results}
                            onSaveOffer={saveOffer}
                            isOfferSaved={isSaved}
                        />
                    </div>
                </div>
            </div>
        </ModernLayout>
    );
}
