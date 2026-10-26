'use client';

import React, { useMemo, useEffect, Suspense } from 'react';
import { SimpleLayout } from '@/components/layout/SimpleLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, MapPin, DollarSign, Star } from 'lucide-react';
import { useSavedOffers } from '@/hooks/use-saved-offers';
import { ScoredOffer } from '@/types';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function ComparePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { savedOffers } = useSavedOffers();

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

    // Redirect if invalid selection
    useEffect(() => {
        if (selectedOffers.length < 2) {
            router.push('/saved');
        }
    }, [selectedOffers, router]);

    if (selectedOffers.length < 2) {
        return null;
    }

    return (
        <SimpleLayout
            title="Compare Offers"
            description="Side-by-side comparison of selected offers"
            maxWidth="7xl"
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedOffers.map((offer, index) => (
                        <Card key={offer.id} className="border-2 hover:border-primary/50 transition-colors">
                            <CardHeader className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <Badge variant="outline" className="text-xs">
                                        Offer #{index + 1}
                                    </Badge>
                                    {offer.finalScore && (
                                        <Badge className={
                                            offer.finalScore > 80 
                                                ? "bg-green-500 hover:bg-green-600" 
                                                : offer.finalScore > 60 
                                                    ? "bg-blue-500 hover:bg-blue-600" 
                                                    : "bg-orange-500 hover:bg-orange-600"
                                        }>
                                            Score: {offer.finalScore}
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
                                    <Badge variant="secondary">{offer.category || "Offer"}</Badge>
                                </div>

                                {/* Score Breakdown */}
                                {offer.breakdown && (
                                    <div className="space-y-3 pt-3 border-t">
                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase">Score Breakdown</h4>
                                        
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="flex items-center gap-1">
                                                    <Star className="h-3 w-3" /> Relevance
                                                </span>
                                                <span className="font-medium">{offer.breakdown.relevance}%</span>
                                            </div>
                                            <Progress value={offer.breakdown.relevance} className="h-2" />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="flex items-center gap-1">
                                                    <TrendingUp className="h-3 w-3" /> Quality
                                                </span>
                                                <span className="font-medium">{offer.breakdown.quality}%</span>
                                            </div>
                                            <Progress value={offer.breakdown.quality} className="h-2" />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="flex items-center gap-1">
                                                    <TrendingUp className="h-3 w-3" /> Trend
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
                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase">Web Insights</h4>
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
                            Comparison Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                        <p className="text-muted-foreground">
                            Comparing {selectedOffers.length} offers. 
                            {selectedOffers.some(o => o.finalScore !== undefined) && (
                                <> Highest score: <span className="font-semibold text-primary">
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
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background p-6 font-sans text-foreground flex items-center justify-center">
                <div className="text-muted-foreground">Loading comparison...</div>
            </div>
        }>
            <ComparePageContent />
        </Suspense>
    );
}
