"use client";

import React, { useMemo, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, TrendingUp, MapPin, DollarSign, Star } from "lucide-react";
import { useSpecificOffers } from "@/hooks/use-saved-offers";
import { ThemeToggle } from "@/components/theme-toggle";
import { ScoredOffer } from "@/types";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ComparePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const ids = useMemo(() => {
    const idsParam = searchParams.get("ids");
    return idsParam ? idsParam.split(",") : [];
  }, [searchParams]);

  const { data: offersResponse, isLoading } = useSpecificOffers(ids);
  const specificOffers = useMemo(
    () => offersResponse?.data || [],
    [offersResponse],
  );

  const selectedOffers = useMemo(() => {
    // Filter and validate that offers have the required ScoredOffer properties
    return specificOffers.filter((offer) => {
      // Check if offer has ScoredOffer properties
      const scoredOffer = offer as ScoredOffer;
      return (
        scoredOffer.finalScore !== undefined &&
        scoredOffer.breakdown !== undefined
      );
    }) as ScoredOffer[];
  }, [specificOffers]);

  // Redirect if invalid selection
  useEffect(() => {
    if (!isLoading && selectedOffers.length < 2) {
      router.push("/saved?reason=insufficient-offers");
    }
  }, [selectedOffers, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-6 font-sans text-neutral-900 dark:bg-zinc-950 dark:text-zinc-100">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <div className="animate-pulse text-muted-foreground">
          Fetching comparison data...
        </div>
      </div>
    );
  }

  if (selectedOffers.length < 2) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-neutral-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/saved">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Compare Offers</h1>
            <p className="text-muted-foreground">Side-by-side comparison</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {selectedOffers.map((offer, index) => (
            <Card
              key={offer.id}
              className="hover:border-primary/50 border-2 transition-colors"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className="text-xs">
                    Offer #{index + 1}
                  </Badge>
                  {offer.finalScore && (
                    <Badge
                      className={
                        offer.finalScore > 80
                          ? "bg-green-500 hover:bg-green-600"
                          : offer.finalScore > 60
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-orange-500 hover:bg-orange-600"
                      }
                    >
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
                    {typeof offer.price === "number"
                      ? offer.price.toLocaleString()
                      : offer.price}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Description */}
                <div>
                  <p className="text-sm text-muted-foreground">
                    {offer.description}
                  </p>
                </div>

                {/* Category */}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{offer.category || "Offer"}</Badge>
                </div>

                {/* Score Breakdown */}
                {offer.breakdown && (
                  <div className="space-y-3 border-t pt-3">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                      Score Breakdown
                    </h4>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" /> Relevance
                        </span>
                        <span className="font-medium">
                          {offer.breakdown.relevance}%
                        </span>
                      </div>
                      <Progress
                        value={offer.breakdown.relevance}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" /> Quality
                        </span>
                        <span className="font-medium">
                          {offer.breakdown.quality}%
                        </span>
                      </div>
                      <Progress
                        value={offer.breakdown.quality}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" /> Trend
                        </span>
                        <span className="font-medium">
                          {offer.breakdown.trend}%
                        </span>
                      </div>
                      <Progress value={offer.breakdown.trend} className="h-2" />
                    </div>
                  </div>
                )}

                {/* Justification */}
                {offer.justification && (
                  <div className="rounded-lg bg-slate-100 p-3 dark:bg-zinc-800">
                    <p className="text-xs italic text-muted-foreground">
                      {offer.justification}
                    </p>
                  </div>
                )}

                {/* Web Insights */}
                {offer.webInsights && offer.webInsights.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                      Web Insights
                    </h4>
                    <ul className="space-y-1">
                      {offer.webInsights.map((insight, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-1 text-xs text-muted-foreground"
                        >
                          <span className="mt-0.5 text-primary">•</span>
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
        <Card className="bg-linear-to-br mt-6 border-none from-slate-900 to-slate-800 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Comparison Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="text-slate-300">
              Comparing {selectedOffers.length} offers.
              {selectedOffers.some((o) => o.finalScore !== undefined) && (
                <>
                  {" "}
                  Highest score:{" "}
                  <span className="font-semibold text-white">
                    {Math.max(
                      ...selectedOffers
                        .filter((o) => o.finalScore !== undefined)
                        .map((o) => o.finalScore),
                    )}
                  </span>
                  .
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 font-sans text-neutral-900 dark:bg-zinc-950 dark:text-zinc-100">
          <div className="text-muted-foreground">Loading comparison...</div>
        </div>
      }
    >
      <ComparePageContent />
    </Suspense>
  );
}
