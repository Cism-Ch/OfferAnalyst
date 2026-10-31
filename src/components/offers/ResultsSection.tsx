'use client';

/**
 * ResultsSection Component
 * 
 * Displays the results of the offer analysis with customizable view modes (Grid / List),
 * luminous card layout, and an integrated modal for full offer details.
 * Features bilingual action toolbar:
 * - Download styled PDF report
 * - Export structured CSV file
 * - Secure public share link generation
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    BarChart3, 
    CheckCircle2, 
    Globe, 
    ExternalLink, 
    LayoutGrid, 
    List, 
    Sparkles, 
    FileText, 
    FileSpreadsheet, 
    Share2 
} from 'lucide-react';
import { AnalysisResponse, ScoredOffer } from '@/types';
import { OfferCard } from './OfferCard';
import { OfferDetailModal } from './OfferDetailModal';
import { ShareAnalysisModal } from './ShareAnalysisModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { exportAnalysisAsCsv, exportAnalysisAsPdf } from '@/lib/export';
import { useToast } from '@/components/ui/toast';

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
    /** Optional domain context */
    domain?: string;
    /** Optional search criteria */
    criteria?: string;
    /** Optional model identifier */
    model?: string;
}

export function ResultsSection({
    results,
    onSaveOffer,
    isOfferSaved,
    domain = 'Analysis',
    criteria,
    model
}: ResultsSectionProps) {
    const { t, language } = useLanguage();
    const toast = useToast();
    const [selectedOffer, setSelectedOffer] = useState<ScoredOffer | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isExportingCsv, setIsExportingCsv] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);

    const handleOpenDetail = (offer: ScoredOffer) => {
        setSelectedOffer(offer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOffer(null);
    };

    const isEn = language === 'en';

    const handleExportCsv = () => {
        if (!results) return;
        setIsExportingCsv(true);
        try {
            exportAnalysisAsCsv(results, domain, criteria);
            toast.success(t.export.exportCsv, isEn ? 'CSV file exported successfully' : 'Fichier CSV exporté avec succès');
        } catch (err) {
            console.error('Failed to export CSV:', err);
            toast.error(t.export.errorExport, isEn ? 'Unable to generate CSV file' : 'Impossible de générer le fichier CSV');
        } finally {
            setIsExportingCsv(false);
        }
    };

    const handleExportPdf = () => {
        if (!results) return;
        setIsExportingPdf(true);
        try {
            exportAnalysisAsPdf(results, domain, criteria);
            toast.success(t.export.exportPdf, isEn ? 'PDF report generated successfully' : 'Rapport PDF généré avec succès');
        } catch (err) {
            console.error('Failed to export PDF:', err);
            toast.error(t.export.errorExport, isEn ? 'Unable to generate PDF report' : 'Impossible de générer le rapport PDF');
        } finally {
            setIsExportingPdf(false);
        }
    };

    // Show empty state if no results
    if (!results) {
        return (
            <Card className="border-dashed border-2 shadow-none bg-card/40 border-border/70">
                <CardContent className="flex flex-col items-center justify-center p-12 text-muted-foreground text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                        <BarChart3 className="h-8 w-8" />
                    </div>
                    <p className="font-semibold text-foreground text-base">{t.results.noResults}</p>
                    <p className="text-sm mt-1 max-w-sm">
                        {t.results.emptyDescription}
                    </p>
                    <div className="flex items-center gap-2 mt-5 text-xs bg-muted/60 px-3 py-1.5 rounded-full border border-border/60">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span className="font-medium text-foreground">AI Fetch Ready</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Show results
    return (
        <div className="space-y-6 @container">
            {/* Modal for detailed offer view */}
            <OfferDetailModal
                offer={selectedOffer}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={onSaveOffer}
                isSaved={selectedOffer ? isOfferSaved(selectedOffer.id) : false}
            />

            {/* Modal for sharing analysis */}
            <ShareAnalysisModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                analysis={results}
                domain={domain}
                criteria={criteria}
                model={model}
            />

            {/* Section Header with Actions & View Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 px-4 rounded-xl bg-card border border-border/80 shadow-2xs">
                <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-lg text-foreground tracking-tight">{t.results.title}</h3>
                    <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-semibold">
                        {results.topOffers.length} {t.config.top}
                    </Badge>
                </div>

                {/* Right toolbar: Export & Share Actions + View Mode Switcher */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Export PDF Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportPdf}
                        disabled={isExportingPdf}
                        className="h-8 px-2.5 text-xs gap-1.5 rounded-lg border-border/80 text-foreground hover:bg-accent"
                        title={t.export.exportPdf}
                    >
                        <FileText className="h-3.5 w-3.5 text-rose-500" />
                        <span className="hidden sm:inline">{t.export.exportPdf}</span>
                    </Button>

                    {/* Export CSV Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportCsv}
                        disabled={isExportingCsv}
                        className="h-8 px-2.5 text-xs gap-1.5 rounded-lg border-border/80 text-foreground hover:bg-accent"
                        title={t.export.exportCsv}
                    >
                        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="hidden sm:inline">{t.export.exportCsv}</span>
                    </Button>

                    {/* Share Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsShareModalOpen(true)}
                        className="h-8 px-2.5 text-xs gap-1.5 rounded-lg border-primary/30 text-primary hover:bg-primary/10"
                        title={t.export.share}
                    >
                        <Share2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{t.export.share}</span>
                    </Button>

                    {/* View Mode Switcher (Grid vs List) */}
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/60 border border-border/60 ml-1">
                        <Button
                            variant={viewMode === 'grid' ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className="h-7 px-2 text-xs gap-1 rounded-md"
                            title={t.results.viewGrid}
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                            <span className="hidden md:inline">{t.results.viewGrid}</span>
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="h-7 px-2 text-xs gap-1 rounded-md"
                            title={t.results.viewList}
                        >
                            <List className="h-3.5 w-3.5" />
                            <span className="hidden md:inline">{t.results.viewList}</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Offer Cards (Grid or List Mode) */}
            <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 gap-4" 
                : "space-y-4"
            }>
                {results.topOffers.map((offer, i) => (
                    <OfferCard
                        key={offer.id || i}
                        offer={offer}
                        index={i}
                        onSave={onSaveOffer}
                        isSaved={isOfferSaved(offer.id)}
                        onOpenDetail={handleOpenDetail}
                    />
                ))}
            </div>

            {/* Market Summary Card - Luminous & Accessible */}
            <Card className="bg-primary/5 border border-primary/25 text-foreground shadow-xs rounded-xl overflow-hidden">
                <CardHeader className="pb-2 bg-primary/10 border-b border-primary/15">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm font-bold text-primary">
                            {t.results.marketSummary}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-3.5 text-sm text-foreground/90 leading-relaxed font-normal">
                    {results.marketSummary}
                </CardContent>
            </Card>

            {/* Explored Web Sources / Citations */}
            {results.searchSources && results.searchSources.length > 0 && (
                <Card className="border border-border/80 bg-card/60 shadow-xs rounded-xl">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-primary" />
                            <CardTitle className="text-sm font-bold text-foreground">
                                {t.results.verifiedSources}
                            </CardTitle>
                            <Badge variant="outline" className="text-xs ml-auto border-border/80">
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
                                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted/60 border border-border/70 hover:bg-accent hover:text-accent-foreground transition-colors group max-w-full font-medium"
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
