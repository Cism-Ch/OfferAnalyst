'use client';

/**
 * Data Source Page
 * 
 * Dedicated page for configuring data input (AI fetch or manual JSON)
 * Responsive mobile-first SaaS premium design.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SimpleLayout } from '@/components/layout/SimpleLayout';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ClientOnlySwitch } from '@/components/ClientOnlySwitch';
import { Database, Bot, Loader2, ArrowRight, Info, ArrowLeft, Check, Zap, KeyRound, Sparkles, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { LiveAIStatusIndicator } from '@/components/offers/LiveAIStatusIndicator';
import { ProviderErrorPanel } from '@/components/offers/ProviderErrorPanel';
import { getDailyQuotaAction, type DailyQuotaResult } from '@/app/actions/shared/quota-limiter';
import { GuestApiKeyDialog } from '@/components/api-keys/GuestApiKeyDialog';

export default function DataSourcePage() {
    const dashboardState = useAnalysis();
    const router = useRouter();
    const { t, language } = useLanguage();
    const isFr = language === 'fr';
    const ds = t.dataSourcePage;

    const [guestKeyDialogOpen, setGuestKeyDialogOpen] = useState(false);
    const [quota, setQuota] = useState<DailyQuotaResult | null>(null);

    const fetchQuota = useCallback(async () => {
        try {
            const res = await getDailyQuotaAction();
            if (res.success && res.data) {
                setQuota(res.data);
            }
        } catch {
            // Ignore in background
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchQuota();
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchQuota]);

    const isQuotaExhausted = Boolean(quota && !quota.isByok && quota.remaining <= 0);

    const onAnalyze = () => {
        if (isQuotaExhausted) return;
        dashboardState.startAnalysis();
        router.push('/analysis');
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

                {/* Data Source Configuration */}
                <Card className="rounded-2xl border border-border/70 bg-card/70 backdrop-blur-xs shadow-sm overflow-hidden">
                    <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                                    <Database className="text-primary h-5 w-5 shrink-0" />
                                    {ds.methodTitle}
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm mt-1">
                                    {ds.methodDesc}
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="gap-1.5 self-start sm:self-auto py-1 px-2.5 rounded-full border-primary/30 text-primary font-medium text-xs">
                                <Bot size={13} className="shrink-0" />
                                AI Powered
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-6 space-y-6">
                        {/* Auto-Fetch Toggle */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/70 p-4 sm:p-5 bg-muted/40 transition-colors">
                            <div className="space-y-1.5 flex-1 min-w-0">
                                <Label className="text-sm sm:text-base font-semibold block">{ds.autoFetchTitle}</Label>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    {ds.autoFetchDesc}
                                </p>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    <Badge variant="secondary" className="text-[11px] font-medium rounded-md">{ds.badgeRecommended}</Badge>
                                    <Badge variant="outline" className="text-[11px] font-medium rounded-md">{ds.badgeRealtime}</Badge>
                                </div>
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

                        {/* JSON Input */}
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                                <Label className="text-sm sm:text-base font-semibold">
                                    {ds.jsonTitle}
                                </Label>
                                {dashboardState.autoFetch && (
                                    <Badge variant="secondary" className="text-xs">
                                        {ds.jsonDisabled}
                                    </Badge>
                                )}
                            </div>
                            <Textarea
                                value={dashboardState.offersInput}
                                onChange={(e) => dashboardState.setOffersInput(e.target.value)}
                                className="font-mono text-xs h-56 sm:h-64 resize-none rounded-xl"
                                placeholder={`[\n  {\n    "id": "1",\n    "title": "Senior Frontend Developer",\n    "description": "React, Next.js, $120k, Remote",\n    "price": 120000,\n    "location": "Remote",\n    "category": "Job"\n  }\n]`}
                                disabled={dashboardState.autoFetch}
                            />
                            <p className="text-xs text-muted-foreground">
                                {dashboardState.autoFetch 
                                    ? ds.jsonHintDisabled
                                    : ds.jsonHintEnabled}
                            </p>
                        </div>

                        {/* Daily Quota & BYOK Status Banner */}
                        {quota && (
                            <div className="space-y-3 pt-2">
                                {quota.isByok ? (
                                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                                            <Sparkles className="h-4 w-4 shrink-0" />
                                            <span>
                                                {isFr
                                                    ? "Clé API personnelle active (BYOK) — Recherches illimitées"
                                                    : "Personal API key active (BYOK) — Unlimited searches"}
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
                                                ? "Votre quota gratuit se réinitialise à minuit UTC. Pour continuer immédiatement sans attendre, ajoutez votre propre clé API ou créez un compte."
                                                : "Your free quota resets at midnight UTC. To continue immediately without waiting, enter your own API key or sign up."}
                                        </p>
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => setGuestKeyDialogOpen(true)}
                                                className="text-xs min-h-[44px] h-11 sm:h-9 gap-1.5 rounded-xl font-medium touch-manipulation justify-center"
                                            >
                                                <KeyRound className="h-4 w-4" />
                                                {isFr ? "Entrer une clé API (BYOK)" : "Enter API Key (BYOK)"}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                asChild
                                                className="text-xs min-h-[44px] h-11 sm:h-9 rounded-xl font-medium touch-manipulation justify-center"
                                            >
                                                <Link href="/auth/signup">
                                                    {isFr ? "Créer un compte gratuit" : "Sign up for free"}
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-xl bg-muted/50 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                        <div className="flex items-center gap-2 text-foreground font-medium">
                                            <Zap className="h-4 w-4 text-amber-500 fill-amber-500/20 shrink-0" />
                                            <span>
                                                {isFr
                                                    ? `Quota quotidien gratuit : ${quota.remaining}/${quota.total} recherches restantes aujourd'hui.`
                                                    : `Daily free quota: ${quota.remaining}/${quota.total} searches remaining today.`}
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setGuestKeyDialogOpen(true)}
                                            className="text-xs min-h-[44px] sm:min-h-0 h-11 sm:h-8 px-3 gap-1.5 shrink-0 w-full sm:w-auto font-medium rounded-xl sm:rounded-lg touch-manipulation justify-center"
                                        >
                                            <KeyRound className="h-3.5 w-3.5" />
                                            {isFr ? "Ajouter ma clé API (BYOK)" : "Add API Key (BYOK)"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons - SaaS Premium Mobile-First Layout */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-5 border-t border-border/60">
                            <Button variant="outline" className="w-full sm:w-auto min-h-[44px] rounded-xl font-medium touch-manipulation order-2 sm:order-1" asChild>
                                <Link href="/search-context" className="gap-2 justify-center">
                                    <ArrowLeft className="h-4 w-4" />
                                    {ds.btnBack}
                                </Link>
                            </Button>
                            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 order-1 sm:order-2">
                                <Button variant="ghost" className="w-full sm:w-auto min-h-[44px] sm:min-h-9 rounded-xl text-muted-foreground hover:text-foreground touch-manipulation" asChild>
                                    <Link href="/" className="justify-center">{ds.btnCancel}</Link>
                                </Button>
                                <Button 
                                    onClick={onAnalyze} 
                                    disabled={dashboardState.loading || (!dashboardState.autoFetch && !dashboardState.offersInput) || isQuotaExhausted}
                                    className="gap-2 w-full sm:w-auto min-h-[44px] rounded-xl font-semibold shadow-sm touch-manipulation justify-center"
                                    title={isQuotaExhausted ? (isFr ? "Quota quotidien atteint. Ajoutez une clé API pour continuer." : "Daily quota reached. Add an API key to continue.") : undefined}
                                >
                                    {dashboardState.loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            {dashboardState.fetching ? ds.btnFetching : ds.btnAnalyzing}
                                        </>
                                    ) : (
                                        <>
                                            {ds.btnAnalyze}
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Help Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <Card className="rounded-2xl border border-blue-500/20 shadow-xs bg-gradient-to-br from-blue-500/5 to-background p-1">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Bot className="h-4 w-4 text-blue-500" />
                                {ds.helpAutoTitle}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-1 space-y-2.5 text-xs sm:text-sm">
                            <p className="text-muted-foreground">{ds.helpAutoDesc}</p>
                            <div className="space-y-1.5 pt-1">
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-blue-500 shrink-0" />
                                    <p>{ds.helpAutoPoint1}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-blue-500 shrink-0" />
                                    <p>{ds.helpAutoPoint2}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-blue-500 shrink-0" />
                                    <p>{ds.helpAutoPoint3}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-purple-500/20 shadow-xs bg-gradient-to-br from-purple-500/5 to-background p-1">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Database className="h-4 w-4 text-purple-500" />
                                {ds.helpJsonTitle}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-1 space-y-2.5 text-xs sm:text-sm">
                            <p className="text-muted-foreground">{ds.helpJsonDesc}</p>
                            <div className="space-y-1.5 pt-1">
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-purple-500 shrink-0" />
                                    <p>{ds.helpJsonPoint1}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-purple-500 shrink-0" />
                                    <p>{ds.helpJsonPoint2}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-purple-500 shrink-0" />
                                    <p>{ds.helpJsonPoint3}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Guest API Key Dialog */}
            <GuestApiKeyDialog
                open={guestKeyDialogOpen}
                onOpenChange={setGuestKeyDialogOpen}
                onKeyUpdated={fetchQuota}
            />
        </SimpleLayout>
    );
}
