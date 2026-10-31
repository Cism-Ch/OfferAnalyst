'use client';

/**
 * Data Source Page
 * 
 * Multi-source ingestion hub:
 * - Tab 1: Raw Text copy-paste with 1-click AI structuring (Default)
 * - Tab 2: URLs / Links import
 * - Tab 3: CSV / TXT / JSON File Upload
 * - Tab 4: Developer / API Raw JSON
 * - Top Toggle: Automated AI Web Search (Auto-Fetch)
 * 
 * Responsive mobile-first SaaS premium design.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SimpleLayout } from '@/components/layout/SimpleLayout';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ClientOnlySwitch } from '@/components/ClientOnlySwitch';
import {
    Database,
    Bot,
    Loader2,
    ArrowRight,
    Info,
    ArrowLeft,
    Check,
    Zap,
    KeyRound,
    Sparkles,
    AlertTriangle,
    FileText,
    Globe,
    Upload,
    Code2,
    CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { LiveAIStatusIndicator } from '@/components/offers/LiveAIStatusIndicator';
import { ProviderErrorPanel } from '@/components/offers/ProviderErrorPanel';
import { getDailyQuotaAction, type DailyQuotaResult } from '@/app/actions/shared/quota-limiter';
import { GuestApiKeyDialog } from '@/components/api-keys/GuestApiKeyDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RawTextTab } from '@/components/data-source/RawTextTab';
import { UrlImportTab } from '@/components/data-source/UrlImportTab';
import { FileUploadTab } from '@/components/data-source/FileUploadTab';
import { JsonInputTab } from '@/components/data-source/JsonInputTab';
import { CaptureAssistantModal } from '@/components/data-source/CaptureAssistantModal';
import { Offer } from '@/types';
import { cn } from '@/lib/utils';

export default function DataSourcePage() {
    const dashboardState = useAnalysis();
    const router = useRouter();
    const { t, language } = useLanguage();
    const isFr = language === 'fr';
    const ds = t.dataSourcePage;

    const [guestKeyDialogOpen, setGuestKeyDialogOpen] = useState(false);
    const [quota, setQuota] = useState<DailyQuotaResult | null>(null);
    const [activeTab, setActiveTab] = useState<string>('raw');
    const [captureModalOpen, setCaptureModalOpen] = useState<boolean>(false);
    const [capturedText, setCapturedText] = useState<string>('');

    // Capture incoming bookmarklet / extension payload from URL hash or query params
    useEffect(() => {
        if (typeof window === 'undefined') return;

        let payload: string | null = null;
        if (window.location.hash.startsWith('#capture=')) {
            try {
                const raw = window.location.hash.replace('#capture=', '');
                payload = decodeURIComponent(raw);
            } catch {
                // Ignore decoding error
            }
        } else {
            const params = new URLSearchParams(window.location.search);
            const qCapture = params.get('capture') || params.get('text');
            if (qCapture) {
                payload = qCapture;
            }
        }

        if (payload && payload.trim().length > 0) {
            const captured = payload;
            let isMounted = true;
            const timer = setTimeout(() => {
                if (isMounted) {
                    setCapturedText(captured);
                    setActiveTab('raw');
                    dashboardState.setAutoFetch(false);
                }
            }, 0);

            if (window.history && window.history.replaceState) {
                window.history.replaceState(null, '', window.location.pathname);
            }

            return () => {
                isMounted = false;
                clearTimeout(timer);
            };
        }
    }, [dashboardState]);

    const fetchQuota = useCallback(async () => {
        try {
            const res = await getDailyQuotaAction();
            if (res.success && res.data) {
                setQuota(res.data);
            }
        } catch {
            // Background fetch fallback
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchQuota();
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchQuota]);

    // Parse current offers to show ready counter
    const currentOffersCount = useMemo(() => {
        if (!dashboardState.offersInput) return 0;
        try {
            const parsed = JSON.parse(dashboardState.offersInput);
            return Array.isArray(parsed) ? parsed.length : 0;
        } catch {
            return 0;
        }
    }, [dashboardState.offersInput]);

    const isQuotaExhausted = Boolean(quota && !quota.isByok && quota.remaining <= 0);

    const onAnalyze = () => {
        if (isQuotaExhausted) return;
        dashboardState.startAnalysis();
        router.push('/analysis');
    };

    const handleOffersExtracted = (offers: Offer[]) => {
        dashboardState.setOffersInput(JSON.stringify(offers, null, 2));
    };

    return (
        <SimpleLayout
            title={ds.methodTitle}
            description={ds.methodDesc}
            maxWidth="5xl"
        >
            <div className="space-y-6">
                {/* Live AI Status or Provider Error */}
                <LiveAIStatusIndicator />
                <ProviderErrorPanel />

                {/* Info Banner */}
                <Card className="rounded-2xl border border-primary/20 bg-primary/5 shadow-xs overflow-hidden">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-foreground">{ds.bannerTitle}</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {ds.bannerDesc}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Source Configuration Container */}
                <Card className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xs shadow-sm overflow-hidden">
                    <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                                    <Database className="text-primary h-5 w-5 shrink-0" />
                                    <span>{ds.methodTitle}</span>
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm mt-1">
                                    {ds.methodDesc}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCaptureModalOpen(true)}
                                    className="gap-1.5 h-7 py-1 px-2.5 rounded-full border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium text-xs hover:bg-blue-500/20 touch-manipulation"
                                >
                                    <Zap size={12} className="shrink-0 fill-current" />
                                    <span>{t.captureAssistant?.triggerBtn || "Assistant 1-Clic"}</span>
                                </Button>
                                <Badge variant="outline" className="gap-1.5 py-1 px-2.5 rounded-full border-primary/30 text-primary font-medium text-xs">
                                    <Bot size={13} className="shrink-0" />
                                    <span>NVIDIA & Multi-Source</span>
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-6 space-y-6">
                        {/* Auto-Fetch Toggle Switch */}
                        <div className={cn(
                            "flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 sm:p-5 transition-all",
                            dashboardState.autoFetch 
                                ? "bg-primary/5 border-primary/40 shadow-xs" 
                                : "bg-muted/30 border-border/70"
                        )}>
                            <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <Label className="text-sm sm:text-base font-semibold block cursor-pointer">
                                        {ds.autoFetchTitle}
                                    </Label>
                                    <Badge variant="secondary" className="text-[11px] font-medium rounded-md">
                                        {ds.badgeRecommended}
                                    </Badge>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    {ds.autoFetchDesc}
                                </p>
                            </div>
                            <div className="shrink-0 self-end sm:self-center pt-2 sm:pt-0">
                                <ClientOnlySwitch>
                                    <Switch
                                        checked={dashboardState.autoFetch}
                                        onCheckedChange={dashboardState.setAutoFetch}
                                        className="data-[state=checked]:bg-primary"
                                        aria-label={ds.autoFetchTitle}
                                    />
                                </ClientOnlySwitch>
                            </div>
                        </div>

                        {/* Mode Presentation: Auto-Fetch Active vs Ingestion Tabs */}
                        {dashboardState.autoFetch ? (
                            <div className="p-5 sm:p-6 rounded-xl border border-primary/20 bg-primary/5 text-center space-y-3">
                                <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm sm:text-base font-semibold text-foreground">
                                        {isFr ? "Exploration Web Automatisée Activée" : "Automated Web Search Enabled"}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-lg mx-auto">
                                        {ds.autoFetchActiveBanner}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => dashboardState.setAutoFetch(false)}
                                    className="text-xs font-medium border-primary/30 text-primary hover:bg-primary/10 touch-manipulation"
                                >
                                    {isFr ? "Je préfère importer mes propres offres" : "Switch to custom offer import"}
                                </Button>
                            </div>
                        ) : (
                            /* Multi-Source Ingestion Tabs */
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        {ds.tabManualMode}
                                    </span>
                                    {currentOffersCount > 0 && (
                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-mono self-start sm:self-auto">
                                            <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                                            {currentOffersCount} {ds.offersReadyBadge}
                                        </Badge>
                                    )}
                                </div>

                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto p-1 bg-muted/60 rounded-xl gap-1">
                                        <TabsTrigger value="raw" className="text-xs py-2 gap-1.5 touch-manipulation rounded-lg">
                                            <FileText className="h-3.5 w-3.5" />
                                            <span>{ds.tabRawText}</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="urls" className="text-xs py-2 gap-1.5 touch-manipulation rounded-lg">
                                            <Globe className="h-3.5 w-3.5" />
                                            <span>{ds.tabUrls}</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="files" className="text-xs py-2 gap-1.5 touch-manipulation rounded-lg">
                                            <Upload className="h-3.5 w-3.5" />
                                            <span>{ds.tabFiles}</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="json" className="text-xs py-2 gap-1.5 touch-manipulation rounded-lg">
                                            <Code2 className="h-3.5 w-3.5" />
                                            <span>{ds.tabJson}</span>
                                        </TabsTrigger>
                                    </TabsList>

                                    <div className="pt-4">
                                        <TabsContent value="raw">
                                            <RawTextTab
                                                domain={dashboardState.domain}
                                                model={dashboardState.model}
                                                onOffersExtracted={handleOffersExtracted}
                                                currentOffersCount={currentOffersCount}
                                                initialText={capturedText}
                                                onOpenCaptureAssistant={() => setCaptureModalOpen(true)}
                                            />
                                        </TabsContent>

                                        <TabsContent value="urls">
                                            <UrlImportTab
                                                domain={dashboardState.domain}
                                                onOffersExtracted={handleOffersExtracted}
                                                onOpenCaptureAssistant={() => setCaptureModalOpen(true)}
                                            />
                                        </TabsContent>

                                        <TabsContent value="files">
                                            <FileUploadTab
                                                domain={dashboardState.domain}
                                                onOffersExtracted={handleOffersExtracted}
                                            />
                                        </TabsContent>

                                        <TabsContent value="json">
                                            <JsonInputTab
                                                value={dashboardState.offersInput}
                                                onChange={dashboardState.setOffersInput}
                                                disabled={dashboardState.autoFetch}
                                            />
                                        </TabsContent>
                                    </div>
                                </Tabs>
                            </div>
                        )}

                        {/* Quota / BYOK Status Card */}
                        {quota && (
                            <div className="space-y-3 pt-2">
                                {quota.isByok ? (
                                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                                            <Sparkles className="h-4 w-4 shrink-0" />
                                            <span>
                                                {isFr
                                                    ? "Clé API personnelle active (BYOK) — Recherches et analyses illimitées"
                                                    : "Personal API key active (BYOK) — Unlimited searches & analyses"}
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setGuestKeyDialogOpen(true)}
                                            className="text-xs h-9 sm:h-7 px-3 w-full sm:w-auto hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold rounded-lg touch-manipulation"
                                        >
                                            {isFr ? "Gérer ma clé" : "Manage Key"}
                                        </Button>
                                    </div>
                                ) : isQuotaExhausted ? (
                                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 space-y-3 text-xs">
                                        <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
                                            <AlertTriangle className="h-4 w-4 shrink-0" />
                                            <span>
                                                {isFr
                                                    ? "Quota quotidien de 10 recherches atteint."
                                                    : "Daily quota of 10 searches reached."}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {isFr
                                                ? "Votre quota gratuit se réinitialise à minuit UTC. Pour continuer immédiatement sans attendre, ajoutez votre propre clé API ou connectez-vous."
                                                : "Your free quota resets at midnight UTC. To continue immediately without waiting, enter your own API key or sign up."}
                                        </p>
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setGuestKeyDialogOpen(true)}
                                                className="min-h-[44px] sm:min-h-0 sm:h-8 text-xs font-semibold gap-1.5 touch-manipulation"
                                            >
                                                <KeyRound className="h-3.5 w-3.5" />
                                                <span>{isFr ? "Entrer ma clé (BYOK)" : "Enter API Key (BYOK)"}</span>
                                            </Button>
                                            <Button
                                                asChild
                                                variant="secondary"
                                                size="sm"
                                                className="min-h-[44px] sm:min-h-0 sm:h-8 text-xs font-semibold touch-manipulation"
                                            >
                                                <Link href="/auth/signup">
                                                    {isFr ? "Créer un compte" : "Sign Up"}
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                                        <div className="flex items-center gap-1.5">
                                            <Zap className="h-3.5 w-3.5 text-amber-500" />
                                            <span>
                                                {isFr ? "Quota gratuit restant :" : "Remaining free quota:"}{' '}
                                                <strong className="text-foreground">{quota.remaining}/{quota.total}</strong>
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setGuestKeyDialogOpen(true)}
                                            className="text-primary hover:underline font-medium touch-manipulation"
                                        >
                                            {isFr ? "+ Utiliser ma propre clé (BYOK)" : "+ Use my own key (BYOK)"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bottom Navigation Buttons */}
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/search-context')}
                        disabled={dashboardState.loading}
                        className="min-h-[44px] w-full sm:w-auto font-medium touch-manipulation"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {ds.btnBack}
                    </Button>

                    <Button
                        type="button"
                        onClick={onAnalyze}
                        disabled={dashboardState.loading || isQuotaExhausted || (!dashboardState.autoFetch && currentOffersCount === 0)}
                        className="min-h-[44px] w-full sm:w-auto px-6 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md gap-2 touch-manipulation"
                    >
                        {dashboardState.loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>{dashboardState.fetching ? ds.btnFetching : ds.btnAnalyzing}</span>
                            </>
                        ) : (
                            <>
                                <span>{ds.btnAnalyze}</span>
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Guest API Key Dialog */}
            <GuestApiKeyDialog
                open={guestKeyDialogOpen}
                onOpenChange={setGuestKeyDialogOpen}
                onKeyUpdated={() => fetchQuota()}
            />
        </SimpleLayout>
    );
}
