'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Wallet, Search } from 'lucide-react';
import { ScoredOffer } from '@/types';

/**
 * OfferCard Component Props
 */
interface OfferCardProps {
    /** The scored offer to display */
    offer: ScoredOffer;
    /** Index of the offer in the list */
    index: number;
    /** Function to save the offer */
    onSave: (offer: ScoredOffer) => void;
    /** Whether the offer is already saved */
    isSaved: boolean;
}

/**
 * OfferCard Component
 * 
 * Displays a single offer with its AI-generated score, justification,
 * and web insights. Provides functionality to save the offer for later reference.
 * 
 * Features:
 * - Score badge with color coding (green for high scores)
 * - Relevance progress bar
 * - Web insights panel
 * - Save/Saved functionality
 * - Responsive design for mobile and desktop
 * 
 * @param {OfferCardProps} props - Component props
 * @returns {JSX.Element} The offer card
 */
export function OfferCard({ offer, index, onSave, isSaved }: OfferCardProps) {
    return (
        <Card 
            key={offer.id || index} 
            className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow duration-200"
        >
            {/* Card Header with Title and Score */}
            <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg leading-tight sm:leading-normal">
                            {offer.rank}. {offer.title}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                            {offer.location} • {offer.price && typeof offer.price === 'number' 
                                ? offer.price.toLocaleString() 
                                : offer.price}
                        </CardDescription>
                    </div>
                    
                    {/* Score and Save Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Score Badge */}
                        <Badge 
                            className={offer.finalScore > 80 
                                ? "bg-green-500 hover:bg-green-600" 
                                : "bg-blue-500 hover:bg-blue-600"}
                        >
                            {offer.finalScore}
                        </Badge>
                        
                        {/* Save Button - Desktop */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSave(offer)}
                            disabled={isSaved}
                            aria-label={isSaved ? "Offre déjà sauvegardée" : "Sauvegarder cette offre"}
                            className="hidden sm:flex"
                        >
                            {isSaved ? <CheckCircle2 className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
                            {isSaved ? "Sauvegardé" : "Sauvegarder"}
                        </Button>
                        
                        {/* Save Button - Mobile */}
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onSave(offer)}
                            disabled={isSaved}
                            aria-label={isSaved ? "Offre déjà sauvegardée" : "Sauvegarder cette offre"}
                            className="sm:hidden h-8 w-8"
                        >
                            {isSaved ? <CheckCircle2 className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            
            {/* Card Content with Justification and Breakdown */}
            <CardContent className="pb-3 text-sm space-y-3">
                {/* AI Justification */}
                <p className="text-muted-foreground line-clamp-2">
                    {offer.justification}
                </p>

                {/* Relevance Score Breakdown */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Relevance</span>
                        <span>{offer.breakdown.relevance}%</span>
                    </div>
                    <Progress value={offer.breakdown.relevance} className="h-1.5" />
                </div>

                {/* Web Insights */}
                {offer.webInsights && offer.webInsights.length > 0 && (
                    <div className="bg-slate-50 dark:bg-zinc-800 p-2 rounded text-xs text-muted-foreground mt-2 border">
                        <span className="font-semibold flex items-center gap-1 text-primary mb-1">
                            <Search size={10} /> Web Insight
                        </span>
                        {offer.webInsights[0]}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
