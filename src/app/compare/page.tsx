'use client';

import React, { useMemo, useEffect, Suspense } from 'react';
import { SimpleLayout } from '@/components/layout/SimpleLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, MapPin, DollarSign, Star } from 'lucide-react';
import { useSavedOffers } from '@/hooks/use-saved-offers';
import { useLanguage } from '@/contexts/LanguageContext';
import { ScoredOffer } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';

function ComparePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { savedOffers, isLoaded } = useSavedOffers();
    const { t } = useLanguage();
    const cp = t.comparePage;

    const selectedOffers = useMemo(() => {
        const idsParam = searchParams.get('ids');
        if (!idsParam) {
            return [];
        }

        const ids = idsParam.split(',');
        // Filter and validate that offers have the required ScoredOffer properties
        return savedOffers.filter(offer => {
            if (!ids.includes(offer.id)) return false;
            // Check if offer has ScoredOffer properties
            const scoredOffer = offer as ScoredOffer;
            return scoredOffer.finalScore !== undefined && scoredOffer.breakdown !== undefined;
        }) as ScoredOffer[];
    }, [searchParams, savedOffers]);

    // Redirect only when storage is loaded and selection is invalid
    useEffect(() => {
        if (isLoaded && selectedOffers.length < 2) {
            router.push('/saved');
        }
    }, [isLoaded, selectedOffers, router]);

    // Show clean loading skeletons during initial load to prevent flash or premature redirection
    if (!isLoaded) {
        return (
            <SimpleLayout
                title={cp.title}
                description={cp.description}
                maxWidth="7xl"
            >
                <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="w-[85vw] sm:w-[70vw] md:w-auto shrink-0 snap-center md:shrink animate-pulse p-6 space-y-4 border-2 border-border/40">
                            <div className="h-5 w-24 bg-muted rounded" />
                            <div className="h-6 w-3/4 bg-muted rounded" />
                            <div className="h-4 w-1/2 bg-muted rounded" />
                            <div className="h-28 bg-muted/50 rounded-lg" />
                        </Card>
                    ))}
                </div>
            </SimpleLayout>
        );
    }

    if (selectedOffers.length < 2) {
        return null;
    }

    return (
        <SimpleLayout
            title={cp.title}
            description={cp.description}
            maxWidth="7xl"
        >
            <div className="space-y-6">
                {/* Mobile Magnetic Snap Carousel / Desktop Grid */}
                <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory scroll-smooth">
                    {selectedOffers.map((offer, index) => (
                        <Card 
                            key={offer.id} 
                            className="w-[85vw] sm:w-[70vw] md:w-auto shrink-0 snap-center md:shrink border-2 hover:border-primary/50 transition-colors flex flex-col justify-between"
                        >
                            <CardHeader className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <Badge variant="outline" className="text-xs">
                                        {cp.offerNumber}{index + 1}
                                    </Badge>
                                    {offer.finalScore && (
                                        <Badge className={
                                            offer.finalScore > 80 
                                                ? "bg-green-500 hover:bg-green-600" 
                                                : offer.finalScore > 60 
                                                    ? "bg-blue-500 hover:bg-blue-600" 
                                                    : "bg-orange-500 hover:bg-orange-600"
                                        }>
                                            {cp.scoreLabel} {offer.finalScore}
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-lg">{offer.title}</CardTitle>
                                <CardDescription className="flex flex-col gap-1">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {offer.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        {typeof offer.price === 'number' ? offer.price.toLocaleString() : offer.price}
                                    </span>
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Description */}
                                <div>
                                    <p className="text-sm text-muted-foreground">{offer.description}</p>
                                </div>

                                {/* Category */}
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{offer.category || t.offer.category}</Badge>
                                </div>

                                {/* Score Breakdown */}
                                {offer.breakdown && (
                                    <div className="space-y-3 pt-3 border-t">
                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase">{t.offer.scoreBreakdown}</h4>
                                        
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="flex items-center gap-1">
                                                    <Star className="h-3 w-3" /> {t.offer.relevance}
                                                </span>
                                                <span className="font-medium">{offer.breakdown.relevance}%</span>
                                            </div>
                                            <Progress value={offer.breakdown.relevance} className="h-2" />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="flex items-center gap-1">
                                                    <TrendingUp className="h-3 w-3" /> {t.offer.quality}
                                                </span>
                                                <span className="font-medium">{offer.breakdown.quality}%</span>
                                            </div>
                                            <Progress value={offer.breakdown.quality} className="h-2" />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="flex items-center gap-1">
                                                    <TrendingUp className="h-3 w-3" /> {t.offer.trend}
                                                </span>
                                                <span className="font-medium">{offer.breakdown.trend}%</span>
                                            </div>
                                            <Progress value={offer.breakdown.trend} className="h-2" />
                                        </div>
                                    </div>
                                )}

                                {/* Justification */}
                                {offer.justification && (
                                    <div className="bg-muted/50 border border-border/50 p-3 rounded-lg">
                                        <p className="text-xs text-muted-foreground italic">{offer.justification}</p>
                                    </div>
                                )}

                                {/* Web Insights */}
                                {offer.webInsights && offer.webInsights.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase">{t.offer.allWebInsights}</h4>
                                        <ul className="space-y-1">
                                            {offer.webInsights.map((insight, idx) => (
                                                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                                                    <span className="text-primary mt-0.5">•</span>
                                                    <span>{insight}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Summary Section */}
                <Card className="mt-6 bg-primary/5 border border-primary/20 text-foreground">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            {cp.summaryTitle}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                        <p className="text-muted-foreground">
                            {cp.comparingText} {selectedOffers.length} {cp.offersCountText}{' '}
                            {selectedOffers.some(o => o.finalScore !== undefined) && (
                                <> {cp.highestScoreText} <span className="font-semibold text-primary">
                                    {Math.max(...selectedOffers.filter(o => o.finalScore !== undefined).map(o => o.finalScore))}
                                </span>.</>
                            )}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </SimpleLayout>
    );
}

export default function ComparePage() {
    const { t } = useLanguage();
    return (
        <Suspense fallback={
            <div className="min-h-app bg-background p-6 font-sans text-foreground flex items-center justify-center">
                <div className="text-muted-foreground">{t.comparePage.loadingTitle}</div>
            </div>
        }>
            <ComparePageContent />
        </Suspense>
    );
}
