'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, CheckCircle2 } from 'lucide-react';
import { AnalysisResponse } from '@/types';
import { OfferCard } from './OfferCard';

/**
 * ResultsSection Component Props
 */
interface ResultsSectionProps {
    /** Analysis results to display, or null if no results yet */
    results: AnalysisResponse | null;
    /** Function to save an offer */
    onSaveOffer: (offer: unknown) => void;
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
 * 
 * This component adapts its display based on whether results are available,
 * showing either the analysis results or a helpful empty state.
 * 
 * Features:
 * - Dynamic rendering based on results state
 * - List of top offers with individual cards
 * - Market summary card
 * - Encouraging empty state for new users
 * 
 * @param {ResultsSectionProps} props - Component props
 * @returns {JSX.Element} The results section
 */
export function ResultsSection({ 
    results, 
    onSaveOffer, 
    isOfferSaved 
}: ResultsSectionProps) {
    // Show empty state if no results
    if (!results) {
        return (
            <Card className="border-dashed border-2 shadow-none bg-transparent">
                <CardContent className="flex flex-col items-center justify-center p-12 text-muted-foreground text-center">
                    <BarChart3 className="h-12 w-12 mb-4 opacity-50" />
                    <p className="font-medium">No Analysis Yet</p>
                    <p className="text-sm">
                        Contextualize your search to see ranked offers here.
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
                <h3 className="font-semibold text-lg">Top Recommendations</h3>
                <Badge variant="secondary">
                    {results.topOffers.length} Recommended
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
            <Card className="bg-slate-900 text-white border-none">
                <CardHeader>
                    <CardTitle className="text-sm">Market Summary</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-300">
                    {results.marketSummary}
                </CardContent>
            </Card>
        </div>
    );
}
