'use client';

/**
 * Admin Console Page
 * 
 * Protected admin-only dashboard for system management.
 * Features:
 * - Global usage statistics & FinOps breakdown
 * - User management & onboarding reasons analytics
 * - Live AI model availability (2 models per structure)
 * - Multi-service infrastructure telemetry (MongoDB, Redis, QStash, OpenRouter, Better-Auth)
 * - Adaptive DDoS Defense & Security Center (Strict 5 req/min threshold, 15-min burst jail, IP rehabilitation)
 * - Live AI execution telemetry stream
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ResponsiveTable, type ResponsiveTableColumn } from '@/components/ui/responsive-table';
import { 
    Shield, 
    Users, 
    Key, 
    Activity, 
    Database, 
    AlertCircle, 
    CheckCircle2, 
    Zap, 
    DollarSign, 
    RefreshCw, 
    Cpu, 
    Target, 
    Compass, 
    AlertTriangle,
    Server,
    ShieldAlert,
    ShieldCheck,
    Unlock,
    Radio
} from 'lucide-react';
import { AI_MODEL_OPTIONS } from '@/lib/ai-models';
import { checkModelsAvailabilityAction, type ModelsHealthReport } from '@/app/actions/models';
import { motion } from 'framer-motion';
import { fadeInUpProps, staggerContainerProps, staggerItemProps } from '@/lib/motion';
import { getAdminTelemetryStats, type AdminTelemetryStats } from '@/app/actions/db/api-key-analytics';
import { getRecentUsers, getOnboardingUseCasesSummary, type UserData, type UseCaseStat } from '@/app/actions/db/admin';
import { 
    getServicesHealthAction, 
    getDdosSecurityCenterAction, 
    unblockJailedIpAction, 
    type ServicesHealthReport, 
    type DdosCenterData 
} from '@/app/actions/db/service-health';
import { type ThreatRecord } from '@/lib/ddos-defense';
import { cn } from '@/lib/utils';

export default function AdminPage() {
    const [telemetry, setTelemetry] = useState<AdminTelemetryStats | null>(null);
    const [isLoadingTelemetry, setIsLoadingTelemetry] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [usersList, setUsersList] = useState<UserData[]>([]);
    const [useCasesSummary, setUseCasesSummary] = useState<UseCaseStat[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [modelsHealth, setModelsHealth] = useState<ModelsHealthReport>({});
    const [isLoadingModelsHealth, setIsLoadingModelsHealth] = useState(true);

    // Infrastructure services telemetry & DDoS defense state
    const [servicesHealth, setServicesHealth] = useState<ServicesHealthReport | null>(null);
    const [isLoadingServices, setIsLoadingServices] = useState(true);
    const [ddosData, setDdosData] = useState<DdosCenterData | null>(null);
    const [isLoadingDdos, setIsLoadingDdos] = useState(true);
    const [unblockingIp, setUnblockingIp] = useState<string | null>(null);
    const [unblockMessage, setUnblockMessage] = useState<{ text: string; error?: boolean } | null>(null);
    const [nowTimestamp, setNowTimestamp] = useState(() => Date.now());

    type TelemetryLogItem = NonNullable<AdminTelemetryStats['recentLogs']>[number];

    const telemetryColumns: ResponsiveTableColumn<TelemetryLogItem>[] = [
        {
            key: 'timestamp',
            header: 'Date',
            mobileLabel: 'Heure',
            hideOnMobile: true,
            render: (log) => (
                <span className="text-muted-foreground whitespace-nowrap font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                </span>
            )
        },
        {
            key: 'action',
            header: 'Action',
            hideOnMobile: true,
            render: (log) => (
                <span className="font-sans font-medium">
                    {log.action}
                </span>
            )
        },
        {
            key: 'model',
            header: 'Modèle',
            mobileClassName: 'col-span-2',
            render: (log) => (
                <span className="font-mono text-muted-foreground truncate max-w-[150px] inline-block" title={log.model}>
                    {log.model}
                </span>
            )
        },
        {
            key: 'tokensUsed',
            header: 'Tokens',
            render: (log) => (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                    {log.tokensUsed > 0 ? log.tokensUsed.toLocaleString() : '-'}
                </span>
            )
        },
        {
            key: 'costUsd',
            header: 'Coût',
            render: (log) => (
                <span className="text-sky-600 dark:text-sky-400 font-mono">
                    ${log.costUsd > 0 ? log.costUsd.toFixed(5) : '0.00'}
                </span>
            )
        },
        {
            key: 'responseTime',
            header: 'Latence',
            render: (log) => (
                <span className="text-muted-foreground font-mono">
                    {log.responseTime ? `${log.responseTime}ms` : '-'}
                </span>
            )
        },
        {
            key: 'success',
            header: 'Statut',
            render: (log) => (
                log.success ? (
                    <span className="inline-flex items-center text-emerald-500 text-[11px] font-sans">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        200 OK
                    </span>
                ) : (
                    <span className="inline-flex items-center text-rose-500 text-[11px] font-sans" title={log.errorMessage || 'Erreur'}>
                        <AlertCircle className="w-3.5 h-3.5 mr-1" />
                        Erreur
                    </span>
                )
            )
        }
    ];

    const userColumns: ResponsiveTableColumn<UserData>[] = [
        {
            key: 'name',
            header: 'Utilisateur',
            mobileClassName: 'col-span-2',
            render: (user) => (
                <div className="min-w-0">
                    <h4 className="font-medium truncate">{user.name || 'Utilisateur'}</h4>
                    <p className="text-xs text-muted-foreground truncate font-mono">{user.email}</p>
                </div>
            )
        },
        {
            key: 'role',
            header: 'Rôle',
            mobileClassName: 'col-span-2',
            render: (user) => (
                <Badge variant={user.role === 'ADMIN' ? 'default' : 'outline'} className="text-[11px]">
                    {user.role}
                </Badge>
            )
        },
        {
            key: 'useCase',
            header: "Motif / Raison d'Inscription",
            render: (user) => {
                const labels: Record<string, string> = {
                    'jobs': 'Emploi & Carrière',
                    'real-estate': 'Immobilier',
                    'startups': 'Startups & Inv.',
                    'business': 'Services B2B',
                    'e-commerce': 'E-commerce',
                    'other': 'Autre Domaine'
                };
                const text = user.useCase ? (labels[user.useCase] || user.useCase) : 'Non renseigné';
                return (
                    <Badge
                        variant="outline"
                        className={cn(
                            "text-xs font-medium",
                            user.useCase
                                ? "bg-primary/10 text-primary border-primary/25"
                                : "text-muted-foreground bg-muted/30"
                        )}
                    >
                        {text}
                    </Badge>
                );
            }
        },
        {
            key: 'status',
            header: 'Statut',
            hideOnMobile: true,
            render: (user) => (
                <Badge variant={user.status === 'Active' ? 'default' : 'destructive'} className="text-[11px]">
                    {user.status}
                </Badge>
            )
        }
    ];

    const loadTelemetry = useCallback(async (force = false) => {
        try {
            const [stats, users, useCases, healthRes, servicesRes, ddosRes] = await Promise.all([
                getAdminTelemetryStats(),
                getRecentUsers(25),
                getOnboardingUseCasesSummary(),
                checkModelsAvailabilityAction(force),
                getServicesHealthAction(),
                getDdosSecurityCenterAction()
            ]);
            setTelemetry(stats);
            setUsersList(users);
            setUseCasesSummary(useCases);
            if (healthRes.success) {
                setModelsHealth(healthRes.data.report);
            }
            if (servicesRes.success) {
                setServicesHealth(servicesRes.data);
            }
            if (ddosRes.success) {
                setDdosData(ddosRes.data);
            }
            setNowTimestamp(Date.now());
        } catch (err) {
            console.error('Failed to load admin data:', err);
        } finally {
            setIsLoadingTelemetry(false);
            setIsLoadingUsers(false);
            setIsLoadingModelsHealth(false);
            setIsLoadingServices(false);
            setIsLoadingDdos(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        const timer = setTimeout(() => {
            if (isMounted) {
                void loadTelemetry(false);
            }
        }, 0);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [loadTelemetry]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadTelemetry(true);
    };

    const handleUnblockIp = async (ip: string) => {
        setUnblockingIp(ip);
        setUnblockMessage(null);
        try {
            const res = await unblockJailedIpAction(ip);
            if (res.success) {
                setUnblockMessage({ text: res.message || `L'IP ${ip} a été débloquée.` });
                setDdosData((prev) => prev ? {
                    ...prev,
                    activeJailedCount: Math.max(0, prev.activeJailedCount - 1),
                    jailedList: prev.jailedList.filter((item) => item.ip !== ip)
                } : null);
            } else {
                setUnblockMessage({ text: res.error || 'Erreur lors du déblocage.', error: true });
            }
        } catch (err) {
            setUnblockMessage({ 
                text: err instanceof Error ? err.message : 'Erreur inattendue.', 
                error: true 
            });
        } finally {
            setUnblockingIp(null);
        }
    };

    return (
        <ModernLayout maxWidth="7xl">
            {/* Header */}
            <motion.div {...fadeInUpProps} className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold">Observatoire Plateforme & IA</h1>
                        <Badge variant="destructive">Admin Only</Badge>
                    </div>
                    <p className="text-muted-foreground">
                        Télémétrie en temps réel, FinOps des modèles IA, santé des micro-services et bouclier anti-DDoS.
                    </p>
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh} 
                    disabled={isRefreshing}
                    className="gap-2 self-start sm:self-auto"
                >
                    <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin text-primary")} />
                    <span>Actualiser la télémétrie</span>
                </Button>
            </motion.div>

            <motion.div {...staggerContainerProps} className="space-y-6">
                {/* Real-time KPI Stats */}
                <motion.div {...staggerItemProps}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                        <Card className="border-primary/20">
                            <CardHeader className="pb-2 sm:pb-3">
                                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                                    <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                                    Requêtes IA
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold">
                                    {isLoadingTelemetry ? '...' : (telemetry?.totalRequests ?? 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Succès : {telemetry?.successRate ?? 100}%
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-emerald-500/20">
                            <CardHeader className="pb-2 sm:pb-3">
                                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                                    <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                                    Tokens Consommés
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold font-mono">
                                    {isLoadingTelemetry ? '...' : (telemetry?.totalTokens ?? 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Prompt: {(telemetry?.totalPromptTokens ?? 0).toLocaleString()} • Compl: {(telemetry?.totalCompletionTokens ?? 0).toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-sky-500/20">
                            <CardHeader className="pb-2 sm:pb-3">
                                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                                    <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-500" />
                                    Dépenses FinOps
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold font-mono text-sky-600 dark:text-sky-400">
                                    {isLoadingTelemetry ? '...' : `$${(telemetry?.totalCostUsd ?? 0).toFixed(4)}`}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Coût cumulé en USD
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2 sm:pb-3">
                                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                                    <Key className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                                    Santé des Clés
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-1.5 text-xl sm:text-2xl font-bold">
                                    <span>{telemetry?.keysHealthSummary.operational ?? 0}</span>
                                    <span className="text-sm font-normal text-muted-foreground">/ {telemetry?.keysHealthSummary.total ?? 0}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-[11px]">
                                    <span className="text-emerald-500 font-medium"> {telemetry?.keysHealthSummary.operational ?? 0}</span>
                                    <span className="text-amber-500 font-medium"> {(telemetry?.keysHealthSummary.degraded ?? 0) + (telemetry?.keysHealthSummary.quotaExceeded ?? 0)}</span>
                                    <span className="text-rose-500 font-medium"> {telemetry?.keysHealthSummary.invalid ?? 0}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="col-span-2 sm:col-span-1">
                            <CardHeader className="pb-2 sm:pb-3">
                                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                                    <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    Latence P50
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold font-mono">
                                    {isLoadingTelemetry ? '...' : `${telemetry?.avgLatencyMs ?? 0}ms`}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Temps de réponse moyen
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                {/* Breakdown by Model & Provider */}
                <motion.div {...staggerItemProps}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Cpu className="w-5 h-5 text-primary" />
                                <span>Performances & Consommation par Modèle</span>
                            </CardTitle>
                            <CardDescription>
                                Ventilation en temps réel des requêtes, tokens et coûts par modèle d&apos;IA.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingTelemetry ? (
                                <div className="text-center py-8 text-muted-foreground">Chargement des données de télémétrie...</div>
                            ) : !telemetry?.modelsBreakdown || telemetry.modelsBreakdown.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Aucun appel IA enregistré pour le moment. Lancez une analyse ou une recherche pour générer des données.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {telemetry.modelsBreakdown.map((item) => (
                                        <div key={item.model} className="border rounded-lg p-4 hover:bg-accent/30 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="font-mono text-xs">
                                                        {item.model}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground font-mono">
                                                        (~{item.avgLatencyMs}ms)
                                                    </span>
                                                </div>
                                                <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                    Actif
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Requêtes</p>
                                                    <p className="font-semibold">{item.requests.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Volume Tokens</p>
                                                    <p className="font-semibold font-mono">{item.tokens.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Dépenses USD</p>
                                                    <p className="font-semibold font-mono text-sky-600 dark:text-sky-400">
                                                        ${item.costUsd.toFixed(4)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Coût moyen / req</p>
                                                    <p className="font-semibold font-mono text-xs">
                                                        ${item.requests > 0 ? (item.costUsd / item.requests).toFixed(6) : '0.000000'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Main 2-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Column 1: User Management & Onboarding Causes */}
                    <motion.div {...staggerItemProps} className="space-y-6">
                        {/* Onboarding Reasons Analytics Card */}
                        <Card className="border-primary/20 bg-card">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Target className="w-5 h-5 text-primary" />
                                        <span>Motifs & Raisons d&apos;Inscription (Onboarding)</span>
                                    </div>
                                    <Badge variant="outline" className="text-xs font-mono">
                                        {usersList.length} Inscrits
                                    </Badge>
                                </CardTitle>
                                <CardDescription>
                                    Répartition déclarée des domaines et intentions d&apos;usage lors du choix d&apos;onboarding.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingUsers ? (
                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                        Chargement des motifs d&apos;inscription...
                                    </div>
                                ) : useCasesSummary.length === 0 ? (
                                    <div className="py-6 text-center text-xs text-muted-foreground">
                                        Aucun profil d&apos;onboarding enregistré pour le moment.
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        {useCasesSummary.map((item) => (
                                            <div key={item.useCase} className="p-2.5 rounded-xl border border-border/50 bg-muted/30 flex items-center justify-between gap-3 text-xs">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Compass className="w-3.5 h-3.5 text-primary shrink-0" />
                                                    <span className="font-semibold truncate">{item.label}</span>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="font-mono text-muted-foreground font-medium">
                                                        {item.count} ({item.percentage}%)
                                                    </span>
                                                    <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                                                        <div 
                                                            className="h-full bg-primary rounded-full"
                                                            style={{ width: `${Math.max(item.percentage, 8)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Users Table with Live DB Data */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    <span>Utilisateurs Récents</span>
                                </CardTitle>
                                <CardDescription>
                                    Comptes enregistrés et attribution des rôles en base de données
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingUsers ? (
                                    <div className="py-10 text-center text-sm text-muted-foreground">
                                        Chargement des utilisateurs récents...
                                    </div>
                                ) : (
                                    <ResponsiveTable
                                        data={usersList}
                                        columns={userColumns}
                                        keyExtractor={(u) => u.id}
                                        caption="Liste des utilisateurs récents et leurs motifs d'inscription"
                                        mobileCardTitle={(u) => (
                                            <div className="flex items-center justify-between w-full">
                                                <span className="font-semibold text-sm">{u.name || 'Utilisateur'}</span>
                                                <Badge variant={u.status === 'Active' ? 'default' : 'destructive'} className="text-[10px]">
                                                    {u.status}
                                                </Badge>
                                            </div>
                                        )}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Column 2: Live Models Health & Infrastructure Telemetry */}
                    <motion.div {...staggerItemProps} className="space-y-6">
                        {/* Live Models Health Monitor */}
                        <Card className="border-border/80">
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Cpu className="w-5 h-5 text-primary" />
                                            <span>Statut des Modèles IA en Direct (OpenRouter)</span>
                                        </CardTitle>
                                        <CardDescription>
                                            Surveillance en temps réel des modèles IA configurés (2 par structure).
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => loadTelemetry(true)}
                                        disabled={isRefreshing || isLoadingModelsHealth}
                                        className="gap-2 self-start sm:self-auto h-8 text-xs shrink-0"
                                    >
                                        <RefreshCw className={cn("w-3.5 h-3.5", (isRefreshing || isLoadingModelsHealth) && "animate-spin text-primary")} />
                                        <span>Tester</span>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {AI_MODEL_OPTIONS.map((model) => {
                                        const health = modelsHealth[model.id];
                                        const isOnline = health ? health.isAvailable : true;
                                        return (
                                            <div
                                                key={model.id}
                                                className={cn(
                                                    "rounded-lg border p-3 flex flex-col justify-between gap-2 transition-colors",
                                                    isOnline
                                                        ? "bg-card/70 border-border/70 hover:border-border"
                                                        : "bg-rose-500/5 border-rose-500/30"
                                                )}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <div className="font-semibold text-xs text-foreground truncate" title={model.label}>
                                                            {model.label}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                                            {model.provider} • {model.tier === 'free' ? 'GRATUIT' : 'BYOK PRO'}
                                                        </div>
                                                    </div>
                                                    {isOnline ? (
                                                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shrink-0 font-medium gap-1">
                                                            <CheckCircle2 className="w-2.5 h-2.5" />
                                                            En Ligne
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 shrink-0 font-semibold gap-1">
                                                            <AlertTriangle className="w-2.5 h-2.5" />
                                                            Hors Ligne
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border/40 font-mono">
                                                    <span>{model.contextWindow}</span>
                                                    <span>{model.price}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Multi-Service Health & Infrastructure Telemetry */}
                        <Card className="border-border/80">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Server className="w-5 h-5 text-primary" />
                                        <CardTitle className="text-base font-bold">Santé des Services & Télémétrie en Direct</CardTitle>
                                    </div>
                                    <Badge 
                                        variant="outline" 
                                        className={cn(
                                            "text-xs font-medium gap-1.5",
                                            servicesHealth?.allHealthy 
                                                ? "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10" 
                                                : "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10"
                                        )}
                                    >
                                        <Radio className="w-3 h-3 animate-pulse" />
                                        {servicesHealth?.allHealthy ? "Système Opérationnel" : "Attention Requise"}
                                    </Badge>
                                </div>
                                <CardDescription>
                                    Surveillance active de l&apos;état des composants critiques : base de données, cache Redis, QStash, auth et IA.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingServices ? (
                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                        Vérification des micro-services en cours...
                                    </div>
                                ) : !servicesHealth ? (
                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                        Données de télémétrie système indisponibles.
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        {servicesHealth.services.map((svc) => (
                                            <div 
                                                key={svc.id} 
                                                className="p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-xs text-foreground">{svc.name}</span>
                                                        <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5 text-muted-foreground">
                                                            {svc.provider}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                                        {svc.message || 'Opérationnel'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                                                    <span className="text-[11px] font-mono text-muted-foreground">
                                                        {svc.latencyMs}ms
                                                    </span>
                                                    {svc.status === 'healthy' ? (
                                                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-medium gap-1">
                                                            <CheckCircle2 className="w-2.5 h-2.5" />
                                                            Opérationnel
                                                        </Badge>
                                                    ) : svc.status === 'degraded' ? (
                                                        <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-medium gap-1">
                                                            <AlertTriangle className="w-2.5 h-2.5" />
                                                            Dégradé
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-semibold gap-1">
                                                            <AlertCircle className="w-2.5 h-2.5" />
                                                            Hors Ligne
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Adaptive DDoS Defense & Security Center */}
                <motion.div {...staggerItemProps}>
                    <Card className="border-border/80">
                        <CardHeader className="pb-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5 text-primary" />
                                    <div>
                                        <CardTitle className="text-base font-bold">Centre de Sécurité & Bouclier Anti-DDoS</CardTitle>
                                        <CardDescription>
                                            Rate limiting adaptatif (seuil strict : 5 requêtes/min par IP) avec isolement automatique en quarantaine (Jail 15 min).
                                        </CardDescription>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge 
                                        variant="outline" 
                                        className={cn(
                                            "text-xs font-mono py-1 px-2.5 gap-1.5",
                                            ddosData?.isRedisActive 
                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" 
                                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                        )}
                                    >
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        {ddosData?.isRedisActive ? "Upstash Redis Connecté" : "Stockage Fallback Mémoire"}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs font-mono py-1">
                                        Quota : {ddosData?.thresholdPerMin ?? 5} req/min
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {unblockMessage && (
                                <div className={cn(
                                    "mb-4 p-3 rounded-lg text-xs font-medium border flex items-center justify-between",
                                    unblockMessage.error 
                                        ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400" 
                                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                                )}>
                                    <span>{unblockMessage.text}</span>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => setUnblockMessage(null)} 
                                        className="h-6 px-2 text-xs"
                                    >
                                        Fermer
                                    </Button>
                                </div>
                            )}

                            {isLoadingDdos ? (
                                <div className="py-8 text-center text-sm text-muted-foreground">
                                    Chargement des métriques de sécurité et détection DDoS...
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Stats Summary Bar */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                        <div className="p-3 rounded-lg border bg-muted/20">
                                            <p className="text-muted-foreground">IPs en Quarantaine (Jail Actif)</p>
                                            <p className="text-lg font-bold font-mono mt-1 text-rose-500">
                                                {ddosData?.activeJailedCount ?? 0}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-lg border bg-muted/20">
                                            <p className="text-muted-foreground">Plafond par Requête</p>
                                            <p className="text-lg font-bold font-mono mt-1 text-foreground">
                                                5 requêtes / 60s
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-lg border bg-muted/20">
                                            <p className="text-muted-foreground">Pénalité Burst automatique</p>
                                            <p className="text-lg font-bold font-mono mt-1 text-foreground">
                                                Quarantaine 15 minutes
                                            </p>
                                        </div>
                                    </div>

                                    {/* Jailed IPs Table or Empty State */}
                                    {(!ddosData?.jailedList || ddosData.jailedList.length === 0) ? (
                                        <div className="border border-dashed rounded-lg p-6 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                                            <ShieldCheck className="w-8 h-8 text-emerald-500/70" />
                                            <p className="font-medium text-foreground">Aucune menace active détectée</p>
                                            <p className="max-w-md">
                                                Toutes les requêtes de recherche et d&apos;analyse respectent le quota de sécurité de 5 requêtes par minute. Aucune adresse IP n&apos;est actuellement bannie.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="border rounded-lg overflow-hidden divide-y divide-border/60">
                                            <div className="bg-muted/40 px-4 py-2.5 text-xs font-semibold text-muted-foreground grid grid-cols-12 gap-2">
                                                <span className="col-span-3">Adresse IP</span>
                                                <span className="col-span-5">Motif de la Menace</span>
                                                <span className="col-span-2">Temps Restant</span>
                                                <span className="col-span-2 text-right">Action</span>
                                            </div>
                                            {ddosData.jailedList.map((item: ThreatRecord) => {
                                                const remainingMinutes = Math.max(0, Math.ceil((item.expiresAt - nowTimestamp) / (1000 * 60)));
                                                return (
                                                    <div key={item.ip} className="px-4 py-3 text-xs grid grid-cols-12 gap-2 items-center hover:bg-muted/20 transition-colors">
                                                        <div className="col-span-3 font-mono font-bold text-rose-500 truncate">
                                                            {item.ip}
                                                        </div>
                                                        <div className="col-span-5 text-muted-foreground truncate" title={item.reason}>
                                                            {item.reason}
                                                        </div>
                                                        <div className="col-span-2 font-mono text-muted-foreground">
                                                            {remainingMinutes} min
                                                        </div>
                                                        <div className="col-span-2 text-right">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleUnblockIp(item.ip)}
                                                                disabled={unblockingIp === item.ip}
                                                                className="h-7 px-2.5 text-xs gap-1 border-rose-500/30 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                                            >
                                                                {unblockingIp === item.ip ? (
                                                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                                                ) : (
                                                                    <Unlock className="w-3 h-3" />
                                                                )}
                                                                <span>Réhabiliter</span>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Live AI Telemetry Logs */}
                <motion.div {...staggerItemProps}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" />
                                <span>Flux de Télémétrie en Direct</span>
                            </CardTitle>
                            <CardDescription>
                                Historique des dernières exécutions IA avec volumétrie de tokens et latence.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingTelemetry ? (
                                <div className="text-center py-6 text-muted-foreground text-sm">Chargement des logs récents...</div>
                            ) : (
                                <ResponsiveTable
                                    data={telemetry?.recentLogs || []}
                                    columns={telemetryColumns}
                                    keyExtractor={(log) => log.id}
                                    isLoading={isLoadingTelemetry}
                                    loadingMessage="Chargement des logs récents..."
                                    emptyMessage="Aucun journal d'activité récent."
                                    caption="Historique des exécutions IA"
                                    mobileCardTitle={(log) => (
                                        <div className="flex items-center justify-between w-full">
                                            <span className="font-semibold text-sm">{log.action}</span>
                                            <span className="text-xs text-muted-foreground font-mono">
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    )}
                                />
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </ModernLayout>
    );
}
