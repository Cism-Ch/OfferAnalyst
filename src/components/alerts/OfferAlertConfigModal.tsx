'use client';

/**
 * Offer Alert Configuration Modal
 * 
 * Allows users to set up automated alerts for high-matching offers
 * to Slack, Discord, Zapier, Make, or Email.
 */

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Bell,
    Check,
    Loader2,
    Send,
    ShieldCheck,
    Sparkles,
    CheckCircle2,
    SlidersHorizontal
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/toast';
import { dispatchOfferAlertAction } from '@/app/actions/alerts/dispatch-offer-alert';

interface OfferAlertConfigModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    topOffer?: {
        id: string;
        title: string;
        company: string;
        score: number;
        location?: string;
        price?: string;
        url?: string;
    } | null;
}

export function OfferAlertConfigModal({
    open,
    onOpenChange,
    topOffer
}: OfferAlertConfigModalProps) {
    const { t, language } = useLanguage();
    const isFr = language === 'fr';
    const al = t.offerAlerts;
    const toast = useToast();

    // Load initial config from localStorage lazily
    const [webhookUrl, setWebhookUrl] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('offeranalyst_alert_webhook');
                if (saved) return saved;
            } catch {
                // Ignore localStorage error
            }
        }
        return '';
    });

    const [email, setEmail] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('offeranalyst_alert_email');
                if (saved) return saved;
            } catch {
                // Ignore localStorage error
            }
        }
        return '';
    });

    const [minScore, setMinScore] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('offeranalyst_alert_min_score');
                if (saved) return Number(saved) || 80;
            } catch {
                // Ignore
            }
        }
        return 80;
    });

    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    // Platform detection
    const isSlack = webhookUrl.includes('hooks.slack.com') || webhookUrl.includes('slack.com');
    const isDiscord = webhookUrl.includes('discord.com/api/webhooks') || webhookUrl.includes('discordapp.com/api/webhooks');

    const handleSave = () => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('offeranalyst_alert_webhook', webhookUrl.trim());
                localStorage.setItem('offeranalyst_alert_email', email.trim());
                localStorage.setItem('offeranalyst_alert_min_score', String(minScore));
            } catch {
                // Ignore
            }
        }
        toast.success(al.savedToast);
        onOpenChange(false);
    };

    const handleTestWebhook = async () => {
        if (!webhookUrl && !email) {
            toast.error(isFr ? "Veuillez saisir une URL de webhook ou un email." : "Please enter a webhook URL or an email.");
            return;
        }

        setIsTesting(true);
        setTestResult(null);

        const sampleOffer = topOffer || {
            id: '1',
            title: 'Lead Platform Architect (Test Alerte)',
            company: 'TechCorp Innovation',
            score: 92,
            location: 'Paris (Hybride)',
            price: '95k€ - 105k€',
            url: 'https://example.com/jobs/lead-architect'
        };

        try {
            const res = await dispatchOfferAlertAction({
                offer: {
                    id: sampleOffer.id,
                    title: sampleOffer.title,
                    company: sampleOffer.company,
                    score: sampleOffer.score,
                    location: sampleOffer.location,
                    price: sampleOffer.price,
                    url: sampleOffer.url
                },
                destination: {
                    webhookUrl: webhookUrl.trim(),
                    email: email.trim(),
                    minScore
                },
                isTest: true
            });

            if (res.success) {
                setTestResult({
                    success: true,
                    message: al.testSuccess
                });
                toast.success(al.testSuccess);
            } else {
                setTestResult({
                    success: false,
                    message: res.error || (isFr ? "Échec du test" : "Test failed")
                });
                toast.error(res.error || (isFr ? "Échec de l'envoi" : "Dispatch error"));
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
            setTestResult({
                success: false,
                message: errorMsg
            });
            toast.error(errorMsg);
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg p-5 sm:p-6 rounded-2xl border border-border/80 bg-background/95 backdrop-blur-md shadow-2xl">
                <DialogHeader className="space-y-2 pb-3 border-b border-border/40">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Bell className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                                <span>{al.modalTitle}</span>
                                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                                    <Sparkles className="h-3 w-3 mr-1 inline" />
                                    Temps Réel
                                </Badge>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                {al.modalSubtitle}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-5 pt-3 text-xs">
                    {/* Minimum Score Threshold selector */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                            <span>{al.thresholdLabel}</span>
                        </Label>
                        <div className="grid grid-cols-4 gap-2">
                            {[75, 80, 85, 90].map((score) => (
                                <button
                                    key={score}
                                    type="button"
                                    onClick={() => setMinScore(score)}
                                    className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all touch-manipulation ${
                                        minScore === score
                                            ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                            : 'bg-muted/40 hover:bg-muted text-muted-foreground border-border/60'
                                    }`}
                                >
                                    <span>≥ {score}%</span>
                                    {score === 80 && (
                                        <span className="block text-[9px] opacity-80 mt-0.5 font-normal">
                                            {isFr ? 'Défaut' : 'Default'}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            {al.thresholdHint}
                        </p>
                    </div>

                    {/* Webhook Input */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="webhook-url" className="text-xs font-semibold text-foreground">
                                {al.webhookLabel}
                            </Label>
                            {isSlack && (
                                <Badge variant="secondary" className="text-[10px] bg-[#4A154B]/10 text-[#4A154B] dark:text-purple-300">
                                    Slack Connecté
                                </Badge>
                            )}
                            {isDiscord && (
                                <Badge variant="secondary" className="text-[10px] bg-[#5865F2]/10 text-[#5865F2] dark:text-blue-300">
                                    Discord Connecté
                                </Badge>
                            )}
                        </div>
                        <Input
                            id="webhook-url"
                            type="url"
                            placeholder={al.webhookPlaceholder}
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            className="text-xs h-9"
                        />
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1.5">
                        <Label htmlFor="alert-email" className="text-xs font-semibold text-foreground">
                            {al.emailLabel}
                        </Label>
                        <Input
                            id="alert-email"
                            type="email"
                            placeholder={al.emailPlaceholder}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="text-xs h-9"
                        />
                    </div>

                    {/* Test result banner */}
                    {testResult && (
                        <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                            testResult.success
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                                : 'bg-destructive/10 border-destructive/30 text-destructive'
                        }`}>
                            {testResult.success ? (
                                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                            ) : (
                                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                            )}
                            <p className="leading-relaxed flex-1">{testResult.message}</p>
                        </div>
                    )}

                    {/* Test Action */}
                    <div className="pt-1 flex items-center justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isTesting || (!webhookUrl && !email)}
                            onClick={handleTestWebhook}
                            className="text-xs h-8 gap-1.5 touch-manipulation"
                        >
                            {isTesting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Send className="h-3.5 w-3.5" />
                            )}
                            <span>{isTesting ? al.btnTesting : al.btnTest}</span>
                        </Button>

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onOpenChange(false)}
                                className="text-xs h-8"
                            >
                                {al.closeBtn}
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleSave}
                                className="text-xs h-8 gap-1.5 font-semibold touch-manipulation"
                            >
                                <Check className="h-3.5 w-3.5" />
                                <span>{al.saveBtn}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
