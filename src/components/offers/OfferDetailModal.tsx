'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
    MapPin, 
    Tag, 
    ExternalLink, 
    CheckCircle2, 
    Wallet, 
    Search, 
    Sparkles, 
    TrendingUp, 
    CheckCheck, 
    Award,
    FileText,
    Share2,
    Check
} from 'lucide-react';
import { ScoredOffer } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/toast';

interface OfferDetailModalProps {
    offer: ScoredOffer | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (offer: ScoredOffer) => void;
    isSaved: boolean;
}

/**
 * OfferDetailModal Component
 * 
 * Accessible, expansive dialog providing full readability for any analyzed offer:
 * complete title, pricing details, 3-axis score breakdown, full AI justification,
 * all collected web insights, description, and direct external listing link.
 */
export function OfferDetailModal({
    offer,
    isOpen,
    onClose,
    onSave,
    isSaved
}: OfferDetailModalProps) {
    const { t, language } = useLanguage();
    const isEn = language === 'en';
    const toast = useToast();
    const [copied, setCopied] = React.useState(false);

    if (!offer) return null;

    const formattedPrice = offer.price && typeof offer.price === 'number'
        ? `${offer.price.toLocaleString()} €`
        : String(offer.price || 'N/A');

    const handleCopyOfferSummary = async () => {
        if (!offer) return;
        const rel = offer.breakdown?.relevance !== undefined ? `${offer.breakdown.relevance}/100` : 'N/A';
        const qual = offer.breakdown?.quality !== undefined ? `${offer.breakdown.quality}/100` : 'N/A';
        const trnd = offer.breakdown?.trend !== undefined ? `${offer.breakdown.trend}/100` : 'N/A';
        const priceLabel = isEn ? 'Price' : 'Prix';
        const locLabel = isEn ? 'Location' : 'Localisation';
        const catLabel = isEn ? 'Category' : 'Catégorie';
        const scoreLabel = isEn ? 'AI Score' : 'Score IA';
        const relLabel = isEn ? 'Relevance' : 'Pertinence';
        const qualLabel = isEn ? 'Quality' : 'Qualité';
        const trndLabel = isEn ? 'Trend' : 'Tendance';
        const justLabel = isEn ? 'AI Justification' : 'Justification';
        const linkLabel = isEn ? 'Link' : 'Lien';

        const summary = [
            `#${offer.rank || 1} ${offer.title}`,
            `${priceLabel}: ${formattedPrice} | ${locLabel}: ${offer.location || 'N/A'} | ${catLabel}: ${offer.category || 'N/A'}`,
            `${scoreLabel}: ${offer.finalScore}/100 (${relLabel}: ${rel}, ${qualLabel}: ${qual}, ${trndLabel}: ${trnd})`,
            `${justLabel}: ${offer.justification}`,
            offer.url ? `${linkLabel}: ${offer.url}` : ''
        ].filter(Boolean).join('\n');

        try {
            await navigator.clipboard.writeText(summary);
            setCopied(true);
            toast.success(t.export.linkCopied, offer.title);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            toast.error(isEn ? 'Error' : 'Erreur', isEn ? 'Failed to copy offer details.' : 'Impossible de copier les détails.');
        }
    };

    const scoreColorClass = offer.finalScore >= 80
        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
        : offer.finalScore >= 60
            ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
            : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 bg-card text-card-foreground border-border/80 shadow-2xl">
                {/* Header with Rank, Title & Key Badges */}
                <DialogHeader className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs px-2.5 py-1 font-semibold border-primary/40 bg-primary/10 text-primary">
                                #{offer.rank || 1} {t.offer.rankBadge}
                            </Badge>
                            {offer.category && (
                                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                                    <Tag className="h-3 w-3" />
                                    {offer.category}
                                </Badge>
                            )}
                            {offer.location && (
                                <Badge variant="outline" className="flex items-center gap-1 text-xs border-border/80">
                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                    {offer.location}
                                </Badge>
                            )}
                        </div>

                        {/* Total Score Badge */}
                        <div className={`px-3 py-1 rounded-full border flex items-center gap-1.5 font-bold text-sm ${scoreColorClass}`}>
                            <Award className="h-4 w-4" />
                            <span>Score IA : {offer.finalScore}/100</span>
                        </div>
                    </div>

                    <DialogTitle className="text-xl sm:text-2xl font-bold leading-snug tracking-tight text-foreground text-left">
                        {offer.title}
                    </DialogTitle>

                    {/* Prominent Price Banner */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/50 border border-border/70">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                            {t.offer.price}
                        </span>
                        <span className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                            {formattedPrice}
                        </span>
                    </div>
                    
                    <DialogDescription className="sr-only">
                        {offer.title} - Détails complets et score IA
                    </DialogDescription>
                </DialogHeader>

                {/* Body Content */}
                <div className="space-y-6 pt-2">
                    {/* Score Breakdown (3-Axis) */}
                    <div className="space-y-3 p-4 rounded-xl bg-card border border-border/70 shadow-xs">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            {t.offer.scoreBreakdown}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                            {/* Relevance */}
                            <div className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
                                        {t.offer.relevance}
                                    </span>
                                    <span className="font-bold">{offer.breakdown?.relevance ?? 0}%</span>
                                </div>
                                <Progress value={offer.breakdown?.relevance ?? 0} className="h-2" />
                            </div>

                            {/* Quality */}
                            <div className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <Award className="h-3.5 w-3.5 text-emerald-500" />
                                        {t.offer.quality}
                                    </span>
                                    <span className="font-bold">{offer.breakdown?.quality ?? 0}%</span>
                                </div>
                                <Progress value={offer.breakdown?.quality ?? 0} className="h-2" />
                            </div>

                            {/* Trend */}
                            <div className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                                        {t.offer.trend}
                                    </span>
                                    <span className="font-bold">{offer.breakdown?.trend ?? 0}%</span>
                                </div>
                                <Progress value={offer.breakdown?.trend ?? 0} className="h-2" />
                            </div>
                        </div>
                    </div>

                    {/* AI Justification (Full Text) */}
                    {offer.justification && (
                        <div className="space-y-2 p-4 rounded-xl bg-primary/5 border border-primary/20">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5" />
                                {t.offer.aiJustification}
                            </h4>
                            <p className="text-sm text-foreground/90 leading-relaxed">
                                {offer.justification}
                            </p>
                        </div>
                    )}

                    {/* Full Description (if available) */}
                    {offer.description && (
                        <div className="space-y-2 p-4 rounded-xl bg-muted/30 border border-border/60">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                {t.offer.fullDescription}
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                {offer.description}
                            </p>
                        </div>
                    )}

                    {/* Explored Web Insights */}
                    {offer.webInsights && offer.webInsights.length > 0 && (
                        <div className="space-y-2.5">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Search className="h-3.5 w-3.5 text-primary" />
                                {t.offer.allWebInsights} ({offer.webInsights.length})
                            </h4>
                            <div className="space-y-2">
                                {offer.webInsights.map((insight, idx) => (
                                    <div 
                                        key={idx} 
                                        className="p-3 rounded-lg bg-card border border-border/70 text-xs sm:text-sm text-muted-foreground flex items-start gap-2.5 shadow-2xs"
                                    >
                                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                                            {idx + 1}
                                        </span>
                                        <p className="leading-relaxed flex-1 text-foreground/90">
                                            {insight}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <DialogFooter className="pt-4 mt-2 border-t border-border/60 flex flex-col sm:flex-row gap-2.5 sm:justify-between items-stretch sm:items-center">
                    {/* Left: External Link */}
                    {offer.url ? (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 text-primary border-primary/30 hover:bg-primary/10 w-full sm:w-auto"
                            asChild
                        >
                            <a href={offer.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                                {t.offer.externalSource}
                            </a>
                        </Button>
                    ) : (
                        <span className="text-xs text-muted-foreground italic text-center sm:text-left">
                            {t.offer.noSourceUrl}
                        </span>
                    )}

                    {/* Right: Share, Save & Close */}
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyOfferSummary}
                            className="flex-1 sm:flex-none gap-1.5 text-xs border-border/80"
                            title={t.export.share}
                        >
                            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5 text-primary" />}
                            <span>{copied ? t.export.linkCopied : t.export.share}</span>
                        </Button>
                        <Button
                            variant={isSaved ? "secondary" : "default"}
                            size="sm"
                            onClick={() => onSave(offer)}
                            disabled={isSaved}
                            className="flex-1 sm:flex-none gap-2 text-xs"
                        >
                            {isSaved ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Wallet className="h-4 w-4" />}
                            {isSaved ? t.offer.saved : t.offer.save}
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={onClose}
                            className="flex-1 sm:flex-none text-xs"
                        >
                            {t.offer.close}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
