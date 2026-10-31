'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    CheckCircle2, 
    Wallet, 
    Search, 
    Maximize2, 
    MapPin, 
    Tag, 
    CheckCheck, 
    TrendingUp, 
    Award 
} from 'lucide-react';
import { ScoredOffer } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

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
    /** Function to open the detailed modal view */
    onOpenDetail?: (offer: ScoredOffer) => void;
}

/**
 * OfferCard Component
 * 
 * Luminous, accessible, and high-readability card displaying an offer with its
 * AI ranking, price tag, 3-axis score overview, and instant detail modal launcher.
 */
export function OfferCard({ offer, index, onSave, isSaved, onOpenDetail }: OfferCardProps) {
    const { t } = useLanguage();

    const formattedPrice = offer.price && typeof offer.price === 'number' 
        ? `${offer.price.toLocaleString()} €` 
        : String(offer.price || 'N/A');

    const scoreBadgeColor = offer.finalScore >= 80 
        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" 
        : offer.finalScore >= 60 
            ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30" 
            : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";

    const handleCardClick = () => {
        if (onOpenDetail) {
            onOpenDetail(offer);
        }
    };

    return (
        <Card 
            key={offer.id || index} 
            onClick={handleCardClick}
            className="group relative @container @container/offer-card overflow-hidden border border-border/80 bg-card hover:bg-accent/5 hover:border-primary/50 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer rounded-xl"
        >
            {/* Top Bar with Badges, Price, Score, and Actions */}
            <CardHeader className="p-3.5 @min-[400px]:p-5 pb-3">
                <div className="flex flex-col gap-3">
                    {/* Upper row: Rank, Tags, Score, & Save Button */}
                    <div className="flex flex-col @min-[400px]:flex-row @min-[400px]:items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge variant="outline" className="text-xs px-2 py-0.5 font-bold border-primary/40 bg-primary/10 text-primary">
                                #{offer.rank || index + 1}
                            </Badge>

                            {offer.category && (
                                <Badge variant="secondary" className="text-[11px] px-2 py-0.5 flex items-center gap-1">
                                    <Tag className="h-3 w-3" />
                                    {offer.category}
                                </Badge>
                            )}

                            {offer.location && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                                    <MapPin className="h-3 w-3" />
                                    {offer.location}
                                </span>
                            )}
                        </div>

                        {/* Right: Score + Save Button */}
                        <div className="flex items-center justify-between @min-[400px]:justify-end gap-2 shrink-0 w-full @min-[400px]:w-auto">
                            <div className={`px-2.5 py-0.5 rounded-full border text-xs font-bold flex items-center gap-1 ${scoreBadgeColor}`}>
                                <Award className="h-3.5 w-3.5" />
                                <span>{offer.finalScore}/100</span>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSave(offer);
                                }}
                                disabled={isSaved}
                                aria-label={isSaved ? t.offer.alreadySaved : t.offer.saveThisOffer}
                                className="h-8 px-2.5 text-xs rounded-lg touch-manipulation"
                            >
                                {isSaved ? (
                                    <>
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 @min-[400px]:mr-1" />
                                        <span className="hidden @min-[400px]:inline">{t.offer.saved}</span>
                                    </>
                                ) : (
                                    <>
                                        <Wallet className="h-3.5 w-3.5 @min-[400px]:mr-1" />
                                        <span className="hidden @min-[400px]:inline">{t.offer.save}</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Middle row: Large Title & Price */}
                    <div className="flex flex-col @min-[400px]:flex-row @min-[400px]:items-baseline @min-[400px]:justify-between gap-1.5">
                        <CardTitle className="text-base @min-[400px]:text-lg font-bold leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors">
                            {offer.title}
                        </CardTitle>
                        <div className="shrink-0">
                            <span className="text-base @min-[400px]:text-lg font-extrabold text-foreground tracking-tight">
                                {formattedPrice}
                            </span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            
            {/* Card Content: Justification, 3-Axis Scores & Web Insights */}
            <CardContent className="p-3.5 @min-[400px]:p-5 pt-0 space-y-3.5 text-sm">
                {/* AI Justification (Readable & Clean) */}
                {offer.justification && (
                    <p className="text-muted-foreground line-clamp-2 text-xs @min-[400px]:text-sm leading-relaxed">
                        {offer.justification}
                    </p>
                )}

                {/* 3-Axis Compact Score Badges */}
                <div className="grid grid-cols-1 @min-[380px]:grid-cols-3 gap-2 pt-1 border-t border-border/50">
                    <div className="flex items-center justify-between p-1.5 px-2 rounded-md bg-muted/40 text-[11px]">
                        <span className="text-muted-foreground flex items-center gap-1">
                            <CheckCheck className="h-3 w-3 text-blue-500" />
                            {t.offer.relevance}
                        </span>
                        <span className="font-bold text-foreground">{offer.breakdown?.relevance ?? 0}%</span>
                    </div>

                    <div className="flex items-center justify-between p-1.5 px-2 rounded-md bg-muted/40 text-[11px]">
                        <span className="text-muted-foreground flex items-center gap-1">
                            <Award className="h-3 w-3 text-emerald-500" />
                            {t.offer.quality}
                        </span>
                        <span className="font-bold text-foreground">{offer.breakdown?.quality ?? 0}%</span>
                    </div>

                    <div className="flex items-center justify-between p-1.5 px-2 rounded-md bg-muted/40 text-[11px]">
                        <span className="text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-purple-500" />
                            {t.offer.trend}
                        </span>
                        <span className="font-bold text-foreground">{offer.breakdown?.trend ?? 0}%</span>
                    </div>
                </div>

                {/* Web Insights preview */}
                {offer.webInsights && offer.webInsights.length > 0 && (
                    <div className="bg-muted/30 p-2.5 rounded-lg text-xs text-muted-foreground border border-border/60 flex items-start gap-2">
                        <Search className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="line-clamp-1 flex-1">
                            {offer.webInsights[0]}
                        </span>
                    </div>
                )}

                {/* Card Action: View Details Button */}
                <div className="pt-1 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                        {offer.webInsights?.length ? `${offer.webInsights.length} ${t.offer.webInsight}(s)` : ''}
                    </span>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenDetail) onOpenDetail(offer);
                        }}
                        className="text-xs h-7 gap-1.5 text-primary hover:text-primary hover:bg-primary/10 rounded-md font-semibold touch-manipulation"
                    >
                        <Maximize2 className="h-3.5 w-3.5" />
                        {t.offer.viewDetails}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
