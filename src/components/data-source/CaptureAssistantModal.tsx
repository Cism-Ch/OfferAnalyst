'use client';

/**
 * Capture Assistant Modal
 * 
 * Provides:
 * 1. 1-Click Drag-and-Drop Universal Bookmarklet (zero-install, works in all browsers)
 * 2. Dedicated Chrome Extension download (.zip) & step-by-step developer installation guide
 * 
 * Solves the critical anti-bot/Cloudflare scraping wall by capturing DOM client-side.
 */

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Zap,
    Globe,
    Copy,
    Check,
    Download,
    ExternalLink,
    ShieldCheck,
    Sparkles,
    MousePointerClick,
    CheckCircle2
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl border border-border/80 bg-background/95 backdrop-blur-md shadow-2xl">
                <DialogHeader className="space-y-2 pb-2 border-b border-border/40">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Zap className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                                <span>{ca.modalTitle}</span>
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

                <Tabs defaultValue="bookmarklet" className="w-full mt-4">
                    <TabsList className="grid grid-cols-2 w-full h-auto p-1 bg-muted/60 rounded-xl">
                        <TabsTrigger value="bookmarklet" className="text-xs py-2 gap-1.5 rounded-lg touch-manipulation">
                            <Zap className="h-3.5 w-3.5 text-primary" />
                            <span>{ca.tabBookmarklet}</span>
                        </TabsTrigger>
                        <TabsTrigger value="extension" className="text-xs py-2 gap-1.5 rounded-lg touch-manipulation">
                            <Globe className="h-3.5 w-3.5 text-blue-500" />
                            <span>{ca.tabExtension}</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Bookmarklet Universel */}
                    <TabsContent value="bookmarklet" className="space-y-4 pt-3">
                        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
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

                            {/* Drag Button Area */}
                            <div className="p-4 rounded-xl bg-background border border-dashed border-primary/40 text-center space-y-2">
                                <p className="text-xs font-medium text-foreground flex items-center justify-center gap-1.5">
                                    <MousePointerClick className="h-4 w-4 text-primary animate-bounce" />
                                    <span>{ca.bookmarkletDragHint}</span>
                                </p>

                                <div className="pt-1 pb-1">
                                    <a
                                        href={bookmarkletCode}
                                        onClick={(e) => {
                                            // Explain to drag instead of normal click
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

                                <div className="flex items-center justify-center gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCopyBookmarklet}
                                        className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8"
                                    >
                                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                        <span>{copied ? ca.codeCopied : ca.copyCodeBtn}</span>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* How it works 3 steps */}
                        <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2.5 text-xs">
                            <span className="font-semibold text-foreground block">{ca.howItWorksTitle}</span>
                            <div className="space-y-1.5 text-muted-foreground">
                                <p className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                                    <span>{ca.step1}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                                    <span>{ca.step2}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                                    <span className="text-foreground font-medium">{ca.step3}</span>
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab 2: Extension Chrome Manifest V3 */}
                    <TabsContent value="extension" className="space-y-4 pt-3">
                        <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div>
                                    <h4 className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-blue-500" />
                                        <span>{ca.extensionTitle}</span>
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {ca.extensionDesc}
                                    </p>
                                </div>
                                <a
                                    href="/extension/offeranalyst-extension.zip"
                                    download="offeranalyst-extension.zip"
                                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-xs shadow-xs hover:bg-primary/90 transition-colors touch-manipulation"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>{ca.downloadZipBtn}</span>
                                </a>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                                <div className="p-3 rounded-lg border border-border/50 bg-background/50 space-y-1">
                                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                                        <Download className="h-3.5 w-3.5 text-primary" />
                                        <span>{ca.extStep1Title}</span>
                                    </span>
                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                        {ca.extStep1Desc}
                                    </p>
                                </div>

                                <div className="p-3 rounded-lg border border-border/50 bg-background/50 space-y-1">
                                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                                        <ExternalLink className="h-3.5 w-3.5 text-primary" />
                                        <span>{ca.extStep2Title}</span>
                                    </span>
                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                        {ca.extStep2Desc}
                                    </p>
                                </div>

                                <div className="p-3 rounded-lg border border-border/50 bg-background/50 space-y-1">
                                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                        <span>{ca.extStep3Title}</span>
                                    </span>
                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                        {ca.extStep3Desc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end pt-2 border-t border-border/40 mt-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="text-xs"
                    >
                        {ca.closeBtn}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
