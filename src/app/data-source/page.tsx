'use client';

/**
 * Data Source Page
 * 
 * Dedicated page for configuring data input (AI fetch or manual JSON)
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
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                        <div className="flex gap-3">
                            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium">{ds.bannerTitle}</p>
                                <p className="text-xs text-muted-foreground">
                                    {ds.bannerDesc}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Source Configuration */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Database className="text-primary" size={20} />
                                    {ds.methodTitle}
                                </CardTitle>
                                <CardDescription>
                                    {ds.methodDesc}
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="gap-2">
                                <Bot size={12} />
                                AI Powered
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Auto-Fetch Toggle */}
                        <div className="flex items-center justify-between rounded-lg border-2 p-4 bg-muted/50">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold">{ds.autoFetchTitle}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {ds.autoFetchDesc}
                                </p>
                                <div className="flex gap-2 mt-2">
                                    <Badge variant="secondary" className="text-xs">{ds.badgeRecommended}</Badge>
                                    <Badge variant="outline" className="text-xs">{ds.badgeRealtime}</Badge>
                                </div>
                            </div>
                            <ClientOnlySwitch>
                                <Switch
                                    checked={dashboardState.autoFetch}
                                    onCheckedChange={dashboardState.setAutoFetch}
                                    className="data-[state=checked]:bg-primary"
                                    aria-label={ds.autoFetchTitle}
                                />
                            </ClientOnlySwitch>
                        </div>

                        {/* JSON Input */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-base">
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
                                className="font-mono text-xs h-64 resize-none"
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
                                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
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
                                            className="text-xs h-7 px-2.5 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium"
                                        >
                                            {isFr ? "Gérer ma clé" : "Manage Key"}
                                        </Button>
                                    </div>
                                ) : isQuotaExhausted ? (
                                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 space-y-2.5 text-xs">
                                        <div className="flex items-center gap-2 text-destructive font-semibold">
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
                                        <div className="flex flex-wrap items-center gap-2 pt-1">
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => setGuestKeyDialogOpen(true)}
                                                className="text-xs min-h-[36px] gap-1.5"
                                            >
                                                <KeyRound className="h-3.5 w-3.5" />
                                                {isFr ? "Entrer une clé API (BYOK)" : "Enter API Key (BYOK)"}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                asChild
                                                className="text-xs min-h-[36px]"
                                            >
                                                <Link href="/auth/signup">
                                                    {isFr ? "Créer un compte gratuit" : "Sign up for free"}
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3.5 rounded-xl bg-muted/50 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
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
                                            className="text-xs h-8 gap-1.5 shrink-0 self-start sm:self-auto font-medium"
                                        >
                                            <KeyRound className="h-3.5 w-3.5" />
                                            {isFr ? "Ajouter ma clé API (BYOK)" : "Add API Key (BYOK)"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons - Responsive Mobile-First */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t">
                            <Button variant="outline" className="w-full sm:w-auto min-h-[44px]" asChild>
                                <Link href="/search-context" className="gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    {ds.btnBack}
                                </Link>
                            </Button>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <Button variant="outline" className="w-full sm:w-auto min-h-[44px]" asChild>
                                    <Link href="/">{ds.btnCancel}</Link>
                                </Button>
                                <Button 
                                    onClick={onAnalyze} 
                                    disabled={dashboardState.loading || (!dashboardState.autoFetch && !dashboardState.offersInput) || isQuotaExhausted}
                                    className="gap-2 w-full sm:w-auto min-h-[44px]"
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

                {/* Help Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-none shadow-sm bg-gradient-to-br from-blue-500/5 to-background">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Bot className="h-4 w-4 text-blue-500" />
                                {ds.helpAutoTitle}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p className="text-muted-foreground">{ds.helpAutoDesc}</p>
                            <div className="space-y-1">
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

                    <Card className="border-none shadow-sm bg-gradient-to-br from-purple-500/5 to-background">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Database className="h-4 w-4 text-purple-500" />
                                {ds.helpJsonTitle}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p className="text-muted-foreground">{ds.helpJsonDesc}</p>
                            <div className="space-y-1">
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
