'use client';

/**
 * TailoredApplicationModal Component
 * 
 * Generates a tailored, non-generic application pitch / introductory letter
 * matching the user's specific context and the offer's unique requirements.
 */

import React, { useState, useEffect } from 'react';
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
import { 
    Send, 
    Copy, 
    Check, 
    RefreshCw, 
    AlertCircle, 
    ShieldCheck, 
    Sparkles, 
    CheckCircle2,
    FileText
} from 'lucide-react';
import { ScoredOffer } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/toast';
import { 
    generateOfferActionContentAction, 
    ActionContentResult 
} from '@/app/actions/offers/generate-action-content';
import { GuestApiKeyDialog } from '@/components/api-keys/GuestApiKeyDialog';

interface TailoredApplicationModalProps {
    offer: ScoredOffer | null;
    isOpen: boolean;
    onClose: () => void;
    domain?: string;
    userContext?: string;
}

export function TailoredApplicationModal({
    offer,
    isOpen,
    onClose,
    domain = "Opportunités",
    userContext = ""
}: TailoredApplicationModalProps) {
    const { language } = useLanguage();
    const isEn = language === 'en';
    const toast = useToast();

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ActionContentResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showKeyDialog, setShowKeyDialog] = useState(false);
    const [copied, setCopied] = useState(false);
    const [fetchKey, setFetchKey] = useState(0);

    const handleClose = () => {
        setResult(null);
        setError(null);
        setCopied(false);
        onClose();
    };

    const handleRegenerate = () => {
        setFetchKey((prev) => prev + 1);
    };

    useEffect(() => {
        if (!isOpen || !offer) return;
        let isSubscribed = true;

        async function fetchApplication() {
            setLoading(true);
            setError(null);
            setCopied(false);

            try {
                const res = await generateOfferActionContentAction(
                    offer!,
                    domain,
                    userContext,
                    'custom_application'
                );

                if (!isSubscribed) return;

                if (res.success) {
                    setResult(res.data);
                } else {
                    setError(res.error.message);
                }
            } catch (e) {
                if (!isSubscribed) return;
                setError(e instanceof Error ? e.message : 'Erreur inattendue');
            } finally {
                if (isSubscribed) {
                    setLoading(false);
                }
            }
        }

        fetchApplication();

        return () => {
            isSubscribed = false;
        };
    }, [isOpen, offer, domain, userContext, fetchKey]);

    const handleCopy = async () => {
        if (!result?.generatedText) return;
        try {
            await navigator.clipboard.writeText(result.generatedText);
            setCopied(true);
            toast.success(
                isEn ? 'Application message copied to clipboard!' : 'Message de candidature copié dans le presse-papier !'
            );
            setTimeout(() => setCopied(false), 3000);
        } catch {
            toast.error(isEn ? 'Failed to copy' : 'Impossible de copier');
        }
    };

    if (!offer) return null;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-4 sm:p-6 overflow-hidden bg-card border-border/80 rounded-2xl shadow-xl">
                    <DialogHeader className="pb-3 border-b border-border/60">
                        <div className="flex flex-wrap items-center gap-2 justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                    <Send className="h-5 w-5" />
                                </div>
                                <div>
                                    <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                                        {isEn ? "Tailored Application & Pitch" : "Candidature & Réponse Sur-Mesure"}
                                    </DialogTitle>
                                    <DialogDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                                        {offer.title} • {offer.location || 'Localisation flexible'}
                                    </DialogDescription>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-xs font-bold border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                {isEn ? "Match Score" : "Score IA"} {offer.finalScore}%
                            </Badge>
                        </div>
                    </DialogHeader>

                    {/* Content Scrollable Body */}
                    <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                        {loading ? (
                            <div className="py-14 text-center space-y-4">
                                <div className="inline-flex p-3 rounded-full bg-blue-500/10 text-blue-500 animate-spin">
                                    <RefreshCw className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold text-foreground text-sm">
                                        {isEn ? "Drafting tailored application..." : "Rédaction de la candidature personnalisée par l'IA..."}
                                    </p>
                                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                        {isEn 
                                            ? "Aligning your specific criteria with the offer's core challenges..." 
                                            : "Alignement de vos critères et exigences avec les défis clés du poste..."}
                                    </p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive space-y-3">
                                <div className="flex items-start gap-2.5">
                                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                    <div className="space-y-1 text-xs sm:text-sm">
                                        <p className="font-semibold">{isEn ? "Generation Error" : "Erreur de génération"}</p>
                                        <p className="text-muted-foreground">{error}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    <Button size="sm" variant="outline" onClick={handleRegenerate} className="text-xs gap-1.5">
                                        <RefreshCw className="h-3.5 w-3.5" />
                                        {isEn ? "Retry" : "Réessayer"}
                                    </Button>
                                    <Button size="sm" variant="default" onClick={() => setShowKeyDialog(true)} className="text-xs gap-1.5">
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        {isEn ? "Configure API Key" : "Configurer Clé API (BYOK)"}
                                    </Button>
                                </div>
                            </div>
                        ) : result ? (
                            <div className="space-y-4">
                                {/* Hook Headline */}
                                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 flex items-start gap-3">
                                    <Sparkles className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <h4 className="text-xs uppercase font-extrabold text-muted-foreground tracking-wider">
                                            {isEn ? "Value Proposition Hook" : "Accroche à Fort Impact"}
                                        </h4>
                                        <p className="text-sm font-semibold text-foreground leading-snug">
                                            {result.headline}
                                        </p>
                                    </div>
                                </div>

                                {/* Key Alignment Points */}
                                {result.keyPoints && result.keyPoints.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                                            {isEn ? "Key Profile & Needs Alignment" : "Points Clés d'Alignement"}
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {result.keyPoints.map((pt, i) => (
                                                <div key={i} className="p-2.5 rounded-lg bg-card border border-border/70 text-xs text-foreground/90 flex items-start gap-2 shadow-xs">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                                                    <span>{pt}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Full Message / Letter */}
                                <div className="space-y-2 pt-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <FileText className="h-3.5 w-3.5 text-primary" />
                                            {isEn ? "Ready-to-Send Application Message" : "Message / Lettre de Candidature Prête"}
                                        </h4>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleCopy}
                                            className="h-7 text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10 rounded-lg"
                                        >
                                            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                            {copied ? (isEn ? "Copied" : "Copié !") : (isEn ? "Copy Message" : "Copier le Message")}
                                        </Button>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-muted/30 border border-border/80 font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed select-all">
                                        {result.generatedText}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Footer Actions */}
                    <DialogFooter className="pt-3 border-t border-border/60 flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRegenerate}
                            disabled={loading}
                            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                            {isEn ? "Regenerate" : "Régénérer"}
                        </Button>
                        <div className="flex items-center gap-2">
                            {result?.generatedText && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleCopy}
                                    className="gap-1.5 text-xs font-semibold shadow-xs"
                                >
                                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                    {copied ? (isEn ? "Copied!" : "Copié !") : (isEn ? "Copy Message" : "Copier le Message")}
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClose}
                                className="text-xs"
                            >
                                {isEn ? "Close" : "Fermer"}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* BYOK Dialog Fallback */}
            <GuestApiKeyDialog
                open={showKeyDialog}
                onOpenChange={setShowKeyDialog}
                onKeyUpdated={() => {
                    setShowKeyDialog(false);
                    handleRegenerate();
                }}
            />
        </>
    );
}
