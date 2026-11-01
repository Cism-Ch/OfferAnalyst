'use client';

/**
 * Capture Assistant Modal (1-Click Universal Bookmarklet)
 * 
 * Provides:
 * - 1-Click Drag-and-Drop Universal Bookmarklet (zero-install, works across all browsers)
 * - Solves the critical anti-bot/Cloudflare scraping wall by capturing job text client-side.
 * - Clean, ultra-simple UX without any complex extension installations.
 */

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Zap,
    Copy,
    Check,
    ShieldCheck,
    Sparkles,
    MousePointerClick,
    ExternalLink
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/toast';

interface CaptureAssistantModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CaptureAssistantModal({
    open,
    onOpenChange,
}: CaptureAssistantModalProps) {
    const { t, language } = useLanguage();
    const isFr = language === 'fr';
    const ca = t.captureAssistant;
    const toast = useToast();

    const [copied, setCopied] = useState(false);
    const [appOrigin] = useState<string>(() => {
        if (typeof window !== 'undefined' && window.location?.origin) {
            return window.location.origin;
        }
        return 'https://offer-analyst.vercel.app';
    });

    // Deterministic bookmarklet code pointing to current origin
    const bookmarkletCode = `javascript:(function(){try{const s=window.getSelection()?.toString()?.trim();let t=s;if(!t||t.length<30){const q=['.jobs-description__content','.jobs-description','#job-details','#jobDescriptionText','.jobsearch-JobComponent-description','[data-testid="job-section-description"]','article','main'];for(const sel of q){const el=document.querySelector(sel);if(el&&el.innerText&&el.innerText.trim().length>60){t=el.innerText.trim();break;}}}if(!t){t=document.body?.innerText?.slice(0,10000)||'';}const p='[Source: '+window.location.href+']\\n[Titre: '+document.title+']\\n\\n'+t;window.open('${appOrigin}/data-source#capture='+encodeURIComponent(p),'_blank');}catch(e){alert('Erreur: '+e.message);}})();`;

    const handleCopyBookmarklet = async () => {
        try {
            await navigator.clipboard.writeText(bookmarkletCode);
            setCopied(true);
            toast.success(ca.codeCopied);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // Clipboard fallback
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl border border-border/80 bg-background/95 backdrop-blur-md shadow-2xl">
                <DialogHeader className="space-y-2 pb-3 border-b border-border/40">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                            <Zap className="h-5 w-5 fill-primary/20" />
                        </div>
                        <div>
                            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                                <span>{isFr ? "Bookmarklet de Capture 1-Clic" : "1-Click Capture Bookmarklet"}</span>
                                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                                    <ShieldCheck className="h-3 w-3 mr-1 inline" />
                                    100% Anti-Bot
                                </Badge>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                {ca.modalSubtitle}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 pt-3">
                    {/* Hero Drag Area */}
                    <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-3.5">
                        <div className="flex items-start gap-2.5">
                            <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-xs sm:text-sm font-semibold text-foreground">
                                    {ca.bookmarkletTitle}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                    {ca.bookmarkletDesc}
                                </p>
                            </div>
                        </div>

                        {/* Interactive Drag Button Area */}
                        <div className="p-4 rounded-xl bg-background border border-dashed border-primary/40 text-center space-y-2.5">
                            <p className="text-xs font-medium text-foreground flex items-center justify-center gap-1.5">
                                <MousePointerClick className="h-4 w-4 text-primary animate-bounce" />
                                <span>{ca.bookmarkletDragHint}</span>
                            </p>

                            <div className="pt-1 pb-1">
                                <a
                                    href={bookmarkletCode}
                                    onClick={(e) => {
                                        if (e.button === 0) {
                                            e.preventDefault();
                                            alert(isFr 
                                                ? "Glissez ce bouton vers votre barre de favoris (en haut de votre navigateur) pour l'installer !" 
                                                : "Drag this button into your bookmarks bar (at the top of your browser) to install it!"
                                            );
                                        }
                                    }}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs sm:text-sm shadow-md hover:from-blue-700 hover:to-indigo-700 cursor-grab active:cursor-grabbing transition-all select-none touch-manipulation"
                                    title={isFr ? "Glissez-moi dans votre barre de favoris !" : "Drag me to your bookmarks bar!"}
                                >
                                    <Zap className="h-4 w-4 fill-white" />
                                    <span>{ca.bookmarkletDragBtn}</span>
                                </a>
                            </div>

                            <div className="flex items-center justify-center gap-2 pt-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCopyBookmarklet}
                                    className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8 rounded-lg"
                                >
                                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                    <span>{copied ? ca.codeCopied : ca.copyCodeBtn}</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* How It Works Steps */}
                    <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2.5 text-xs">
                        <span className="font-semibold text-foreground block">{ca.howItWorksTitle}</span>
                        <div className="space-y-2 text-muted-foreground">
                            <p className="flex items-start gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                                <span>{ca.step1}</span>
                            </p>
                            <p className="flex items-start gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                                <span>{ca.step2}</span>
                            </p>
                            <p className="flex items-start gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                                <span className="text-foreground font-medium">{ca.step3}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-border/40 mt-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="text-xs rounded-xl"
                    >
                        {ca.closeBtn}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
