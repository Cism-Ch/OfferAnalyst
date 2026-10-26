'use client';

/**
 * Admin Console Page
 * 
 * Protected admin-only dashboard for system management.
 * Features:
 * - Global usage statistics
 * - User management
 * - API key monitoring
 * - Feature flags
 * - System health monitoring
 * 
 * Note: This page should be protected by Better-Auth role check
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
    Shield, 
    Users,
    Key,
    Activity,
    Database,
    Flag,
    AlertCircle,
    CheckCircle2,
    Zap,
    DollarSign,
    RefreshCw,
    Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUpProps, staggerContainerProps, staggerItemProps } from '@/lib/motion';
import { getAdminTelemetryStats, type AdminTelemetryStats } from '@/app/actions/db/api-key-analytics';

export default function AdminPage() {
    const [featureFlags, setFeatureFlags] = useState({
        fetchV2: true,
        organizeV2: true,
        dualWorkflow: true,
        newAnalytics: true,
        enableWebhooks: true,
        enableCache: true
    });

    const [telemetry, setTelemetry] = useState<AdminTelemetryStats | null>(null);
    const [isLoadingTelemetry, setIsLoadingTelemetry] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const recentUsers = [
        { id: '1', name: 'Administrateur Principal', email: 'admin@offeranalyst.com', role: 'Superadmin', status: 'Active' },
        { id: '2', name: 'Analyste Recrutement', email: 'analyst@offeranalyst.com', role: 'Editor', status: 'Active' },
        { id: '3', name: 'Utilisateur Démo', email: 'demo@offeranalyst.com', role: 'Viewer', status: 'Active' }
    ];

    const loadTelemetry = useCallback(async () => {
        try {
            const stats = await getAdminTelemetryStats();
            setTelemetry(stats);
        } catch (err) {
            console.error('Failed to load admin telemetry:', err);
        } finally {
            setIsLoadingTelemetry(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        
        getAdminTelemetryStats()
            .then(stats => {
                if (isMounted) {
                    setTelemetry(stats);
                    setIsLoadingTelemetry(false);
                }
            })
            .catch(err => {
                console.error('Failed to load admin telemetry:', err);
                if (isMounted) setIsLoadingTelemetry(false);
            });

        const timer = setTimeout(async () => {
            try {
                const res = await fetch('/api/admin/feature-flags');
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted && data.flags) {
                        setFeatureFlags(data.flags);
                    }
                }
            } catch (err) {
                console.error('Failed to load feature flags:', err);
            }
        }, 0);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadTelemetry();
    };

    const toggleFeature = async (feature: keyof typeof featureFlags) => {
        const nextValue = !featureFlags[feature];
        setFeatureFlags(prev => ({ ...prev, [feature]: nextValue }));

        try {
            await fetch('/api/admin/feature-flags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ flag: feature, enabled: nextValue })
            });
        } catch (err) {
            console.error('Failed to save feature flag:', err);
            // Revert on error
            setFeatureFlags(prev => ({ ...prev, [feature]: !nextValue }));
        }
    };

    return (
        <ModernLayout>
            <div className="container mx-auto py-8 px-4 max-w-7xl">
                {/* Header */}
                <motion.div {...fadeInUpProps} className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="w-8 h-8 text-primary" />
                            <h1 className="text-3xl font-bold">Observatoire Plateforme & IA</h1>
                            <Badge variant="destructive">Admin Only</Badge>
                        </div>
                        <p className="text-muted-foreground">
                            Télémétrie en temps réel, FinOps des modèles IA et gouvernance système.
                        </p>
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRefresh} 
                        disabled={isRefreshing}
                        className="gap-2 self-start sm:self-auto"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
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
                                        <span className="text-emerald-500 font-medium">🟢 {telemetry?.keysHealthSummary.operational ?? 0}</span>
                                        <span className="text-amber-500 font-medium">🟡 {(telemetry?.keysHealthSummary.degraded ?? 0) + (telemetry?.keysHealthSummary.quotaExceeded ?? 0)}</span>
                                        <span className="text-rose-500 font-medium">🔴 {telemetry?.keysHealthSummary.invalid ?? 0}</span>
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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* User Management */}
                        <motion.div {...staggerItemProps}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        Recent Users
                                    </CardTitle>
                                    <CardDescription>
                                        User management and role assignment
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {recentUsers.map((user) => (
                                            <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-medium truncate">{user.name}</h4>
                                                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <Badge variant="outline">{user.role}</Badge>
                                                    <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>
                                                        {user.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="outline" className="w-full mt-4 min-h-[44px]">
                                        View All Users
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Feature Flags */}
                        <motion.div {...staggerItemProps}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Flag className="w-5 h-5" />
                                        Feature Flags
                                    </CardTitle>
                                    <CardDescription>
                                        Enable or disable system features
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Fetch Agent v2</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Enhanced data fetching with caching
                                            </p>
                                        </div>
                                        <Switch
                                            checked={featureFlags.fetchV2}
                                            onCheckedChange={() => toggleFeature('fetchV2')}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Organize Agent v2</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Advanced organization templates
                                            </p>
                                        </div>
                                        <Switch
                                            checked={featureFlags.organizeV2}
                                            onCheckedChange={() => toggleFeature('organizeV2')}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Dual Workflow</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Free tier + BYOK mode switching
                                            </p>
                                        </div>
                                        <Switch
                                            checked={featureFlags.dualWorkflow}
                                            onCheckedChange={() => toggleFeature('dualWorkflow')}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">New Analytics</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Enhanced analytics dashboard
                                            </p>
                                        </div>
                                        <Switch
                                            checked={featureFlags.newAnalytics}
                                            onCheckedChange={() => toggleFeature('newAnalytics')}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Async Webhooks</h4>
                                            <p className="text-sm text-muted-foreground">
                                                HMAC-signed notification delivery
                                            </p>
                                        </div>
                                        <Switch
                                            checked={featureFlags.enableWebhooks}
                                            onCheckedChange={() => toggleFeature('enableWebhooks')}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">In-Memory Cache</h4>
                                            <p className="text-sm text-muted-foreground">
                                                TTL-based fetch and workflow acceleration
                                            </p>
                                        </div>
                                        <Switch
                                            checked={featureFlags.enableCache}
                                            onCheckedChange={() => toggleFeature('enableCache')}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

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
                                ) : !telemetry?.recentLogs || telemetry.recentLogs.length === 0 ? (
                                    <div className="p-4 bg-muted/40 rounded-lg text-center text-sm text-muted-foreground">
                                        Aucun journal d&apos;activité récent.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left">
                                            <thead className="text-muted-foreground border-b uppercase font-mono">
                                                <tr>
                                                    <th className="py-2.5 px-3">Date</th>
                                                    <th className="py-2.5 px-3">Action</th>
                                                    <th className="py-2.5 px-3">Modèle</th>
                                                    <th className="py-2.5 px-3">Tokens</th>
                                                    <th className="py-2.5 px-3">Coût</th>
                                                    <th className="py-2.5 px-3">Latence</th>
                                                    <th className="py-2.5 px-3">Statut</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y font-mono">
                                                {telemetry.recentLogs.map((log) => (
                                                    <tr key={log.id} className="hover:bg-muted/30">
                                                        <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">
                                                            {new Date(log.timestamp).toLocaleTimeString()}
                                                        </td>
                                                        <td className="py-2 px-3 font-sans font-medium">
                                                            {log.action}
                                                        </td>
                                                        <td className="py-2 px-3 text-muted-foreground truncate max-w-[150px]">
                                                            {log.model}
                                                        </td>
                                                        <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                                                            {log.tokensUsed > 0 ? log.tokensUsed.toLocaleString() : '-'}
                                                        </td>
                                                        <td className="py-2 px-3 text-sky-600 dark:text-sky-400">
                                                            ${log.costUsd > 0 ? log.costUsd.toFixed(5) : '0.00'}
                                                        </td>
                                                        <td className="py-2 px-3 text-muted-foreground">
                                                            {log.responseTime ? `${log.responseTime}ms` : '-'}
                                                        </td>
                                                        <td className="py-2 px-3">
                                                            {log.success ? (
                                                                <span className="inline-flex items-center text-emerald-500 text-[11px] font-sans">
                                                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                                                    200 OK
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center text-rose-500 text-[11px] font-sans" title={log.errorMessage || 'Erreur'}>
                                                                    <AlertCircle className="w-3.5 h-3.5 mr-1" />
                                                                    Erreur
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>
        </ModernLayout>
    );
}
