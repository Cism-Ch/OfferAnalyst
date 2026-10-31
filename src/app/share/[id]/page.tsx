/**
 * Public Read-Only Shared Analysis Page
 * 
 * Conforms to Agent.md & PROJECT.md Architecture:
 * - Pure React Server Component (RSC)
 * - Strict read-only consultation (no mutation allowed)
 * - Dynamic OpenGraph metadata generation (without inflating view counter)
 * - Full bilingual support (FR / EN)
 * - PDF/CSV export and original web citations
 */

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getSharedAnalysisAction } from '@/server/share';
import { SharedViewToolbar } from './SharedViewToolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ShieldCheck,
  Sparkles,
  Globe,
  ExternalLink,
  Award,
  TrendingUp,
  MapPin,
  Tag,
  Calendar,
  Eye,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

interface SharedPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ lang?: string }>;
}

export async function generateMetadata(props: SharedPageProps): Promise<Metadata> {
  const { id } = await props.params;
  const sp = props.searchParams ? await props.searchParams : undefined;
  const isEn = sp?.lang === 'en';
  
  // Notice incrementView: false to avoid double count on page load
  const res = await getSharedAnalysisAction(id, { incrementView: false });

  if (!res.success) {
    return {
      title: isEn ? 'Analysis Summary Not Found — OfferAnalyst' : 'Synthèse d’analyse introuvable — OfferAnalyst',
      description: isEn ? 'This shared link does not exist or has expired.' : 'Ce lien de partage n’existe plus ou a expiré.',
    };
  }

  const { domain, marketSummary, topOffers } = res.data;
  const title = isEn
    ? `${domain} — Top ${topOffers.length} Analyzed Offers | OfferAnalyst`
    : `${domain} — Top ${topOffers.length} Offres Analysées | OfferAnalyst`;
  const desc = marketSummary
    ? marketSummary.slice(0, 160)
    : isEn
    ? 'Public AI-powered offer analysis summary.'
    : 'Synthèse publique d’analyse d’offres par IA.';

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: 'article',
    },
  };
}

export default async function SharedAnalysisPage(props: SharedPageProps) {
  const { id } = await props.params;
  const sp = props.searchParams ? await props.searchParams : undefined;
  const isEn = sp?.lang === 'en';

  // Increment view count on actual page component render
  const res = await getSharedAnalysisAction(id, { incrementView: true });

  if (!res.success) {
    return (
      <div className="min-h-app flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full border-border/80 shadow-lg text-center p-6 space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertCircle className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            {isEn ? 'Summary Not Found or Expired' : 'Synthèse introuvable ou expirée'}
          </CardTitle>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {res.error || (isEn ? 'This share link does not exist, has been revoked or expired.' : "Ce lien de partage n'existe plus, a été révoqué ou a expiré.")}
          </p>
          <div className="pt-2">
            <Button asChild className="gap-2 w-full">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                {isEn ? 'Back to Home' : "Retour à l'accueil"}
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const data = res.data;
  const dateFormatted = new Date(data.createdAt).toLocaleDateString(isEn ? 'en-US' : 'fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-app bg-background text-foreground pb-16">
      {/* Top Read-Only Consultation Banner */}
      <div className="bg-primary/10 border-b border-primary/20 py-2.5 px-4 text-xs">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-primary font-medium">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>
              {isEn
                ? 'Public read-only consultation • Analysis shared via OfferAnalyst'
                : 'Consultation publique en lecture seule • Analyse partagée via OfferAnalyst'}
            </span>
          </div>
          <Link
            href="/"
            className="text-primary hover:underline font-semibold flex items-center gap-1"
          >
            <span>{isEn ? 'Create my own analysis' : 'Créer ma propre analyse'}</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Header Block */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="px-3 py-1 font-semibold text-xs border-primary/40 bg-primary/10 text-primary">
              {data.domain}
            </Badge>
            {data.model && (
              <Badge variant="secondary" className="text-xs">
                {data.model}
              </Badge>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <Calendar className="h-3.5 w-3.5" />
              <span>{dateFormatted}</span>
              <span className="mx-1">•</span>
              <Eye className="h-3.5 w-3.5" />
              <span>{data.views} {isEn ? 'views' : 'vues'}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {isEn ? `Analysis Summary: ${data.domain}` : `Synthèse d'Analyse : ${data.domain}`}
          </h1>

          {data.criteria && (
            <p className="text-sm text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border/60">
              <span className="font-semibold text-foreground">
                {isEn ? 'Search criteria: ' : 'Critères recherchés : '}
              </span>
              {data.criteria}
            </p>
          )}
        </div>

        {/* Action Toolbar (Download PDF / CSV / Share) */}
        <SharedViewToolbar shareToken={data.shareToken} domain={data.domain} />

        {/* Market Summary Card */}
        {data.marketSummary && (
          <Card className="bg-primary/5 border border-primary/25 shadow-xs rounded-xl overflow-hidden">
            <CardHeader className="pb-2 bg-primary/10 border-b border-primary/15">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold text-primary">
                  {isEn ? 'Executive Market Summary' : 'Synthèse Globale du Marché'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 text-sm text-foreground/90 leading-relaxed">
              {data.marketSummary}
            </CardContent>
          </Card>
        )}

        {/* Scored Offers Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              {isEn
                ? `Selected & Ranked Offers (${data.topOffers.length})`
                : `Offres Sélectionnées & Classées (${data.topOffers.length})`}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.topOffers.map((offer, idx) => {
              const rank = offer.rank || idx + 1;
              const formattedPrice =
                offer.price && typeof offer.price === 'number'
                  ? `${offer.price.toLocaleString()} €`
                  : String(offer.price || '');

              const scoreColorClass =
                offer.finalScore >= 80
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : offer.finalScore >= 60
                  ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';

              return (
                <Card
                  key={offer.id || idx}
                  className="p-5 bg-card border-border/80 shadow-xs rounded-xl flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-3">
                    {/* Top Row: Rank & Score */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="font-bold text-xs px-2.5 py-0.5 bg-primary/10 text-primary border-primary/30"
                        >
                          #{rank} {isEn ? 'Rank' : 'Rang'}
                        </Badge>
                        {offer.category && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {offer.category}
                          </Badge>
                        )}
                      </div>

                      <div
                        className={`px-2.5 py-0.5 rounded-full border text-xs font-bold flex items-center gap-1 ${scoreColorClass}`}
                      >
                        <Award className="h-3.5 w-3.5" />
                        <span>{offer.finalScore}/100</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-base text-foreground leading-snug">
                      {offer.title || (isEn ? `Offer #${rank}` : `Offre #${rank}`)}
                    </h3>

                    {/* Price & Location */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {formattedPrice && (
                        <span className="font-semibold text-foreground">{formattedPrice}</span>
                      )}
                      {offer.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {offer.location}
                        </span>
                      )}
                    </div>

                    {/* Score Breakdown Bars */}
                    {offer.breakdown && (
                      <div className="space-y-1.5 pt-2 border-t border-border/50 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Award className="h-3 w-3 text-primary" /> {isEn ? 'Relevance (50%)' : 'Pertinence (50%)'}
                          </span>
                          <span className="font-semibold text-foreground">
                            {offer.breakdown.relevance}%
                          </span>
                        </div>
                        <Progress value={offer.breakdown.relevance} className="h-1.5" />

                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3 text-blue-500" /> {isEn ? 'Quality (30%)' : 'Qualité (30%)'}
                          </span>
                          <span className="font-semibold text-foreground">
                            {offer.breakdown.quality}%
                          </span>
                        </div>
                        <Progress value={offer.breakdown.quality} className="h-1.5" />

                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-amber-500" /> {isEn ? 'Trend (20%)' : 'Tendance (20%)'}
                          </span>
                          <span className="font-semibold text-foreground">
                            {offer.breakdown.trend}%
                          </span>
                        </div>
                        <Progress value={offer.breakdown.trend} className="h-1.5" />
                      </div>
                    )}

                    {/* AI Justification */}
                    {offer.justification && (
                      <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs text-foreground/90 leading-relaxed">
                        <span className="font-semibold text-primary block mb-1">
                          {isEn ? 'AI Analysis:' : 'Analyse IA :'}
                        </span>
                        {offer.justification}
                      </div>
                    )}
                  </div>

                  {/* External Link */}
                  {offer.url && (
                    <div className="pt-2 border-t border-border/40">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-primary hover:text-primary justify-between p-0 h-auto"
                        asChild
                      >
                        <a href={offer.url} target="_blank" rel="noopener noreferrer">
                          <span>{isEn ? 'View original offer' : "Consulter l'offre d'origine"}</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Sources & Citations */}
        {data.searchSources && data.searchSources.length > 0 && (
          <Card className="border border-border/80 bg-card/60 shadow-xs rounded-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold text-foreground">
                  {isEn
                    ? `Explored Web Sources & Citations (${data.searchSources.length})`
                    : `Sources & Citations Web Explorées (${data.searchSources.length})`}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="flex flex-wrap gap-2">
                {data.searchSources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted/60 border border-border/70 hover:bg-accent hover:text-accent-foreground transition-colors font-medium max-w-full"
                    title={source.uri}
                  >
                    <span className="truncate max-w-[240px]">
                      {source.title || source.uri}
                    </span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
