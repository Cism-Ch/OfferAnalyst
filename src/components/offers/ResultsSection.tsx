"use client";

import React from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, CheckCircle2 } from "lucide-react";
import { AnalysisResponse, ScoredOffer } from "@/types";
import { OfferCard } from "./OfferCard";

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
import { WidgetCard } from "@/components/premium/WidgetCard";

export function ResultsSection({
  results,
  onSaveOffer,
  isOfferSaved,
}: ResultsSectionProps) {
  // Show empty state if no results
  if (!results) {
    return (
      <WidgetCard
        glass
        className="border-2 border-dashed border-zinc-200 bg-transparent dark:border-zinc-800"
        delay={0.2}
      >
        <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
          <div className="mb-6 rounded-full bg-zinc-100 p-4 dark:bg-zinc-900">
            <BarChart3 className="h-10 w-10 opacity-50" />
          </div>
          <p className="text-xl font-bold text-foreground">Awaiting Input</p>
          <p className="mt-2 max-w-[200px] text-sm">
            Configure your context and execute analysis to see rankings.
          </p>
          <div className="mt-8 flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider dark:bg-zinc-900">
            <CheckCircle2 size={12} className="text-neon" />
            <span>Intelligence Engine Ready</span>
          </div>
        </CardContent>
      </WidgetCard>
    );
  }

  // Show results
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-bold tracking-tight">Intelligence Feed</h3>
        <Badge className="hover:bg-neon/90 bg-neon px-3 font-bold text-neon-foreground">
          {results.topOffers.length} Verified
        </Badge>
      </div>

      {/* Offer Cards */}
      <div className="space-y-4">
        {results.topOffers.map((offer, i) => (
          <OfferCard
            key={offer.id || i}
            offer={offer}
            index={i}
            onSave={onSaveOffer}
            isSaved={isOfferSaved(offer.id)}
          />
        ))}
      </div>

      {/* Market Summary Card */}
      <WidgetCard
        glass
        className="border-zinc-800 bg-zinc-900 text-white"
        neonHover
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-neon">
            Market Intelligence Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm font-medium leading-relaxed text-zinc-400">
          {results.marketSummary}
        </CardContent>
      </WidgetCard>
    </div>
  );
}
