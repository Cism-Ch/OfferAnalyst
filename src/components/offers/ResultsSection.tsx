'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, CheckCircle2, Globe, ExternalLink } from 'lucide-react';
import { AnalysisResponse, ScoredOffer } from '@/types';
import { OfferCard } from './OfferCard';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * ResultsSection Component Props
 */
interface ResultsSectionProps {
    /** Analysis results to display, or null if no results yet */
    results: AnalysisResponse | null;
    /** Function to save an offer */
    onSaveOffer: (offer: ScoredOffer) => void;
    /** Function to check if an offer is saved */
    isOfferSaved: (offerId: string) => boolean;
}

/**
 * ResultsSection Component
 * 
 * Displays the results of the offer analysis, including:
 * - Top recommended offers with scores
 * - Market summary
 * - Empty state when no analysis has been performed
 */
export function ResultsSection({
    results,
    onSaveOffer,
    isOfferSaved
}: ResultsSectionProps) {
    const { t } = useLanguage();

    // Show empty state if no results
    if (!results) {
        return (
            <Card className="border-dashed border-2 shadow-none bg-transparent">
                <CardContent className="flex flex-col items-center justify-center p-12 text-muted-foreground text-center">
                    <BarChart3 className="h-12 w-12 mb-4 opacity-50" />
                    <p className="font-medium">{t.results.noResults}</p>
                    <p className="text-sm mt-1">
                        {t.results.emptyDescription}
                    </p>
                    <div className="flex items-center gap-2 mt-4 text-xs bg-muted p-2 rounded">
                        <CheckCircle2 size={14} className="text-green-500" />
                        <span>AI Fetch Ready</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Show results
    return (
        <div className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{t.results.title}</h3>
                <Badge variant="secondary">
                    {results.topOffers.length} {t.config.top}
                </Badge>
            </div>

            {/* Offer Cards */}
            {results.topOffers.map((offer, i) => (
                <OfferCard
                    key={offer.id || i}
                    offer={offer}
                    index={i}
                    onSave={onSaveOffer}
                    isSaved={isOfferSaved(offer.id)}
                />
            ))}

            {/* Market Summary Card */}
            <Card className="bg-primary/5 border border-primary/20 text-foreground shadow-xs">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">{t.results.marketSummary}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                    {results.marketSummary}
                </CardContent>
            </Card>

            {/* Explored Web Sources / Citations */}
            {results.searchSources && results.searchSources.length > 0 && (
                <Card className="border border-border/60 bg-muted/30 shadow-none">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-primary" />
                            <CardTitle className="text-sm font-semibold">{t.results.verifiedSources}</CardTitle>
                            <Badge variant="outline" className="text-xs ml-auto">
                                {results.searchSources.length} {t.results.sourcesCount}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-1">
                        <div className="flex flex-wrap gap-2">
                            {results.searchSources.map((source, idx) => (
                                <a
                                    key={idx}
                                    href={source.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-background border hover:bg-accent hover:text-accent-foreground transition-colors group max-w-full"
                                    title={source.uri}
                                >
                                    <span className="truncate max-w-[200px] sm:max-w-xs">{source.title || source.uri}</span>
                                    <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-foreground shrink-0" />
                                </a>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
