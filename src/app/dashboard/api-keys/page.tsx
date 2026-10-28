'use client';

/**
 * API Keys Management Page
 * 
 * Allows users to manage their API keys for different AI providers.
 * Features:
 * - View existing API keys (masked)
 * - Add new API keys
 * - Delete/Regenerate keys
 * - Usage statistics
 * - BYOK (Bring Your Own Key) support
 * 
 * Security Model:
 * - Authenticated users: Keys stored securely in database (persistent)
 * - Unauthenticated users: Keys stored in browser localStorage (temporary, 24h max)
 */

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Key, 
    Plus, 
    Copy, 
    Trash2, 
    Eye, 
    EyeOff,
    CheckCircle2,
    AlertCircle,
    Clock,
    ShieldAlert,
    Activity,
    RefreshCw,
    Zap,
    DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUpProps, staggerContainerProps, staggerItemProps } from '@/lib/motion';
import { useSession } from '@/lib/auth-client';
import { useTemporaryApiKeys } from '@/hooks/use-temporary-api-keys';
import { AddAPIKeyDialog } from '@/components/api-keys/AddAPIKeyDialog';
import { SecurityMigrationBanner, UnauthenticatedSecurityWarning } from '@/components/api-keys/SecurityMigrationBanner';
import { getUserAPIKeys, addAPIKey, deleteAPIKey, getAPIKeyStats, testAPIKeyHealth } from '@/app/actions/db/api-keys';
import type { APIKeyData } from '@/app/actions/db/api-keys';

interface DisplayAPIKey {
    id: string;
    name: string;
    provider: string;
    key: string;
    createdAt: string;
    lastUsed: string | null;
    usageCount: number;
    rateLimit?: number | null;
    isTemporary?: boolean;
    expiresAt?: string;
    isExpired?: boolean;
    healthStatus?: string;
    lastChecked?: string | null;
    lastPingLatency?: number | null;
    lastError?: string | null;
    creditsRemaining?: number | null;
    creditsLimit?: number | null;
    totalTokensUsed?: number;
    totalCostUsd?: number;
}

function HealthBadge({ status, latency, error }: { status?: string; latency?: number | null; error?: string | null }) {
    const s = (status || 'UNCHECKED').toUpperCase();
    if (s === 'OPERATIONAL') {
        return (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/25" title={latency ? `Latence: ${latency}ms` : 'Opérationnel'}>
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Opérationnel</span>
                {latency !== null && latency !== undefined && (
                    <span className="text-[10px] font-mono opacity-80">({latency}ms)</span>
                )}
            </div>
        );
    }
    if (s === 'QUOTA_EXCEEDED') {
        return (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/25" title={error || 'Crédits ou quota dépassé'}>
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                <span>Quota atteint</span>
            </div>
        );
    }
    if (s === 'RATE_LIMITED' || s === 'DEGRADED') {
        return (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/25" title={error || 'Dégradé / Ralenti'}>
                <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                <span>Dégradé</span>
            </div>
        );
    }
    if (s === 'INVALID') {
        return (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-500 border border-rose-500/25" title={error || 'Clé API révoquée ou invalide'}>
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                <span>Invalide</span>
            </div>
        );
    }
    return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40"></span>
            <span>Non testé</span>
        </div>
    );
}

function APIKeysContent() {
    const { data: session, isPending } = useSession();
    const temporaryKeys = useTemporaryApiKeys();
    const searchParams = useSearchParams();
    
    const [displayKeys, setDisplayKeys] = useState<DisplayAPIKey[]>([]);
    const [stats, setStats] = useState({
        totalKeys: 0,
        totalRequests: 0,
        byokActive: false
    });
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [initialProvider, setInitialProvider] = useState<string>('openrouter');
    const [isLoading, setIsLoading] = useState(true);
    const [testingKeyId, setTestingKeyId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = useCallback((message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    }, []);

    // Auto-open Add Dialog when redirected with ?action=add
    useEffect(() => {
        const action = searchParams.get('action');
        const providerParam = searchParams.get('provider');
        const modelParam = searchParams.get('model');

        if (action === 'add') {
            const timer = setTimeout(() => {
                if (providerParam) {
                    setInitialProvider(providerParam);
                }
                setShowAddDialog(true);
                if (modelParam) {
                    showToast(`Configuration requise : renseignez votre clé pour débloquer ${modelParam}.`, 'success');
                }
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [searchParams, showToast]);

    const isAuthenticated = !!session?.user && !isPending;

    const mapDbKeyToDisplay = useCallback((k: APIKeyData): DisplayAPIKey => ({
        id: k.id,
        name: k.name,
        provider: k.provider,
        key: k.keyPreview,
        createdAt: k.createdAt,
        lastUsed: k.lastUsed,
        usageCount: k.usageCount,
        rateLimit: k.rateLimit,
        expiresAt: k.expiresAt || undefined,
        isExpired: k.isExpired,
        isTemporary: false,
        healthStatus: k.healthStatus,
        lastChecked: k.lastChecked,
        lastPingLatency: k.lastPingLatency,
        lastError: k.lastError,
        creditsRemaining: k.creditsRemaining,
        creditsLimit: k.creditsLimit,
        totalTokensUsed: k.totalTokensUsed,
        totalCostUsd: k.totalCostUsd
    }), []);

    // Load keys based on authentication status
    useEffect(() => {
        async function loadKeys() {
            setIsLoading(true);
            try {
                if (isAuthenticated && session.user?.id) {
                    // Load persistent keys from database
                    const [dbKeys, dbStats] = await Promise.all([
                        getUserAPIKeys(session.user.id),
                        getAPIKeyStats(session.user.id)
                    ]);
                    
                    setDisplayKeys(dbKeys.map(mapDbKeyToDisplay));
                    setStats(dbStats);
                } else if (temporaryKeys.isLoaded) {
                    // Load temporary keys from localStorage
                    const keys: DisplayAPIKey[] = temporaryKeys.keys.map(k => ({
                        id: k.id,
                        name: k.name,
                        provider: k.provider,
                        key: k.key,
                        createdAt: k.createdAt,
                        lastUsed: null,
                        usageCount: 0,
                        isTemporary: true,
                        expiresAt: k.expiresAt,
                        healthStatus: 'UNCHECKED'
                    }));
                    
                    setDisplayKeys(keys);
                    setStats({
                        totalKeys: keys.length,
                        totalRequests: 0,
                        byokActive: keys.length > 0
                    });
                }
            } catch (error) {
                console.error('Failed to load API keys:', error);
                showToast('Failed to load API keys', 'error');
            } finally {
                setIsLoading(false);
            }
        }

        if (!isPending) {
            loadKeys();
        }
    }, [isAuthenticated, session?.user?.id, temporaryKeys.isLoaded, temporaryKeys.keys, isPending, showToast, mapDbKeyToDisplay]);

    const maskKey = (key: string) => {
        if (key.length <= 8) return '••••••••';
        return key.slice(0, 4) + '••••••••' + key.slice(-4);
    };

    const toggleKeyVisibility = (id: string) => {
        const newVisible = new Set(visibleKeys);
        if (newVisible.has(id)) {
            newVisible.delete(id);
        } else {
            newVisible.add(id);
        }
        setVisibleKeys(newVisible);
    };

    const copyToClipboard = (key: string) => {
        if (confirm('Copy full API key to clipboard? This will expose your key to clipboard monitoring.')) {
            navigator.clipboard.writeText(key);
            showToast('API key copied to clipboard', 'success');
        }
    };

    const handleTestKey = async (keyId: string) => {
        setTestingKeyId(keyId);
        try {
            const res = await testAPIKeyHealth(keyId);
            if (res.success && res.data) {
                const check = res.data;
                const creditInfo = check.creditsRemaining !== null && check.creditsRemaining !== undefined 
                    ? ` • Solde: $${check.creditsRemaining.toFixed(2)}` 
                    : '';
                showToast(
                    `Diagnostic OpenRouter : ${check.status} (${check.latencyMs}ms)${creditInfo}`,
                    check.isValid ? 'success' : 'error'
                );
                if (session?.user?.id) {
                    const dbKeys = await getUserAPIKeys(session.user.id);
                    setDisplayKeys(dbKeys.map(mapDbKeyToDisplay));
                }
            } else {
                showToast(res.error || 'Échec du diagnostic de la clé.', 'error');
            }
        } catch {
            showToast('Erreur inattendue pendant le diagnostic.', 'error');
        } finally {
            setTestingKeyId(null);
        }
    };

    const handleAddKey = async (name: string, provider: string, key: string, expiresAt?: Date | null, rateLimit?: number | null) => {
        try {
            if (isAuthenticated && session.user?.id) {
                // Add to database
                const result = await addAPIKey(session.user.id, name, provider, key, expiresAt, rateLimit);
                if (result.success) {
                    showToast('API key added and verified successfully', 'success');
                    // Reload keys
                    const [dbKeys, dbStats] = await Promise.all([
                        getUserAPIKeys(session.user.id),
                        getAPIKeyStats(session.user.id)
                    ]);
                    
                    setDisplayKeys(dbKeys.map(mapDbKeyToDisplay));
                    setStats(dbStats);
                } else {
                    throw new Error(result.message);
                }
            } else {
                // Add to localStorage
                temporaryKeys.addKey(name, provider, key);
                showToast('Temporary API key added (expires in 24 hours)', 'success');
            }
        } catch (error) {
            console.error('Failed to add API key:', error);
            throw error;
        }
    };

    const handleDeleteKey = async (id: string, isTemporary?: boolean) => {
        if (!confirm('Are you sure you want to delete this API key?')) {
            return;
        }

        try {
            if (isTemporary) {
                temporaryKeys.deleteKey(id);
                showToast('API key deleted', 'success');
            } else if (isAuthenticated && session.user?.id) {
                const result = await deleteAPIKey(session.user.id, id);
                if (result.success) {
                    showToast('API key deleted', 'success');
                    // Reload keys
                    const [dbKeys, dbStats] = await Promise.all([
                        getUserAPIKeys(session.user.id),
                        getAPIKeyStats(session.user.id)
                    ]);
                    
                    setDisplayKeys(dbKeys.map(mapDbKeyToDisplay));
                    setStats(dbStats);
                } else {
                    throw new Error(result.message);
                }
            }
        } catch (error) {
            console.error('Failed to delete API key:', error);
            showToast('Failed to delete API key', 'error');
        }
    };

    const getTimeRemaining = (expiresAt: string): string => {
        const now = new Date();
        const expires = new Date(expiresAt);
        const diffMs = expires.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffHours > 0) {
            return `${diffHours}h ${diffMinutes}m remaining`;
        }
        return `${diffMinutes}m remaining`;
    };

    return (
        <ModernLayout>
            {/* Security Migration Banner */}
            <SecurityMigrationBanner />
            
            <div className="container mx-auto py-8 px-4 max-w-6xl">
                {/* Toast notification */}
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
                            toast.type === 'success' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-red-500 text-white'
                        }`}
                    >
                        {toast.message}
                    </motion.div>
                )}

                {/* Unauthenticated Warning */}
                {!isAuthenticated && !isPending && (
                    <UnauthenticatedSecurityWarning />
                )}

                {/* Header */}
                <motion.div {...fadeInUpProps} className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">API Keys</h1>
                            <p className="text-sm sm:text-base text-muted-foreground">
                                {isAuthenticated 
                                    ? 'Manage your AI provider API keys for BYOK (Bring Your Own Key) usage'
                                    : 'Add temporary API keys to enable BYOK access (keys expire after 24 hours)'
                                }
                            </p>
                        </div>
                        <Button onClick={() => setShowAddDialog(true)} className="min-h-[44px] w-full sm:w-auto shrink-0">
                            <Plus className="w-4 h-4 mr-2" />
                            Add API Key
                        </Button>
                    </div>
                </motion.div>

                {/* Warning banner for unauthenticated users */}
                {!isAuthenticated && (
                    <motion.div {...fadeInUpProps} className="mb-6">
                        <Card className="border-yellow-500/50 bg-yellow-500/5">
                            <CardContent className="pt-6">
                                <div className="flex gap-3">
                                    <ShieldAlert className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold mb-2">Temporary Storage Mode</h4>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Your API keys are stored locally in your browser and will expire after 24 hours. 
                                            For persistent, encrypted storage, please{' '}
                                            <a href="/auth/signup" className="underline font-medium">create an account</a>.
                                        </p>
                                        <div className="flex gap-2">
                                            <Button size="sm" asChild>
                                                <a href="/auth/signup">Sign Up</a>
                                            </Button>
                                            <Button size="sm" variant="outline" asChild>
                                                <a href="/auth/login">Login</a>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Usage Overview */}
                {!isLoading && (
                    <motion.div {...fadeInUpProps} className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Total Keys
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.totalKeys}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {isAuthenticated ? 'Persistent' : 'Temporary'} API keys
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Requests This Month
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stats.totalRequests}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {isAuthenticated ? 'Across all keys' : 'Not tracked for temporary keys'}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        BYOK Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        {stats.byokActive ? (
                                            <>
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                <span className="text-2xl font-bold">Active</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="w-5 h-5 text-yellow-500" />
                                                <span className="text-2xl font-bold">Inactive</span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {stats.byokActive ? 'Unlimited usage with your keys' : 'Add a key to enable'}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {/* API Keys List */}
                <motion.div {...staggerContainerProps}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Your API Keys</CardTitle>
                            <CardDescription>
                                {isAuthenticated 
                                    ? 'Manage and monitor your API keys. Keys are encrypted and never shared.'
                                    : 'Temporarily stored keys for this browser session (24h expiration).'
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">Loading API keys...</p>
                                </div>
                            ) : displayKeys.length === 0 ? (
                                <div className="text-center py-12">
                                    <Key className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="text-lg font-semibold mb-2">No API Keys</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Add your first API key to enable BYOK mode
                                    </p>
                                    <Button onClick={() => setShowAddDialog(true)}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add API Key
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {displayKeys.map((apiKey, index) => (
                                        <motion.div
                                            key={apiKey.id}
                                            {...staggerItemProps}
                                            custom={index}
                                            className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Key className="w-5 h-5 text-primary" />
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h3 className="font-semibold">{apiKey.name}</h3>
                                                                {apiKey.isTemporary ? (
                                                                    <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                                                                        Temporary
                                                                    </Badge>
                                                                ) : (
                                                                    <HealthBadge status={apiKey.healthStatus} latency={apiKey.lastPingLatency} error={apiKey.lastError} />
                                                                )}
                                                            </div>
                                                            <Badge variant="outline" className="mt-1">
                                                                {apiKey.provider}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="ml-0 sm:ml-8 mt-2 space-y-2">
                                                        <div className="flex flex-wrap items-center gap-2 font-mono text-xs sm:text-sm">
                                                            <span className="break-all max-w-[220px] sm:max-w-md bg-muted/50 px-2 py-1 rounded">
                                                                {visibleKeys.has(apiKey.id) 
                                                                    ? apiKey.key 
                                                                    : maskKey(apiKey.key)
                                                                }
                                                            </span>
                                                            <div className="flex items-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                    onClick={() => toggleKeyVisibility(apiKey.id)}
                                                                    aria-label="Toggle visibility"
                                                                >
                                                                    {visibleKeys.has(apiKey.id) ? (
                                                                        <EyeOff className="w-4 h-4" />
                                                                    ) : (
                                                                        <Eye className="w-4 h-4" />
                                                                    )}
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                    onClick={() => copyToClipboard(apiKey.key)}
                                                                    aria-label="Copy key"
                                                                >
                                                                    <Copy className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                Created {new Date(apiKey.createdAt).toLocaleDateString()}
                                                            </div>
                                                            {apiKey.lastUsed && (
                                                                <div className="flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                                    Dernier appel {new Date(apiKey.lastUsed).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                            {!apiKey.isTemporary && (
                                                                <div>
                                                                    {apiKey.usageCount} requêtes
                                                                </div>
                                                            )}
                                                            {!apiKey.isTemporary && (
                                                                <div className="flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                                                                    <Zap className="w-3 h-3 text-emerald-500" />
                                                                    {(apiKey.totalTokensUsed || 0).toLocaleString()} tokens
                                                                </div>
                                                            )}
                                                            {!apiKey.isTemporary && (
                                                                <div className="flex items-center gap-1 font-mono text-sky-600 dark:text-sky-400 font-medium">
                                                                    <DollarSign className="w-3 h-3 text-sky-500" />
                                                                    ${(apiKey.totalCostUsd || 0).toFixed(4)} USD
                                                                </div>
                                                            )}
                                                            {!apiKey.isTemporary && apiKey.creditsLimit !== null && apiKey.creditsLimit !== undefined && (
                                                                <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                                                                    <Activity className="w-3 h-3" />
                                                                    Solde: ${apiKey.creditsRemaining !== null && apiKey.creditsRemaining !== undefined ? apiKey.creditsRemaining.toFixed(2) : '--'} / ${apiKey.creditsLimit.toFixed(2)}
                                                                </div>
                                                            )}
                                                            {!apiKey.isTemporary && apiKey.rateLimit && (
                                                                <div className="flex items-center gap-1 text-blue-600">
                                                                    <AlertCircle className="w-3 h-3" />
                                                                    Rate limit: {apiKey.rateLimit}/h
                                                                </div>
                                                            )}
                                                            {!apiKey.isTemporary && apiKey.expiresAt && !apiKey.isExpired && (
                                                                <div className="flex items-center gap-1 text-orange-600">
                                                                    <Clock className="w-3 h-3" />
                                                                    Expires {new Date(apiKey.expiresAt).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                            {!apiKey.isTemporary && apiKey.isExpired && (
                                                                <div className="flex items-center gap-1 text-red-600 font-semibold">
                                                                    <AlertCircle className="w-3 h-3" />
                                                                    Expired!
                                                                </div>
                                                            )}
                                                            {apiKey.isTemporary && apiKey.expiresAt && (
                                                                <div className="flex items-center gap-1 text-yellow-600">
                                                                    <AlertCircle className="w-3 h-3" />
                                                                    {getTimeRemaining(apiKey.expiresAt)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5 ml-2">
                                                    {!apiKey.isTemporary && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleTestKey(apiKey.id)}
                                                            disabled={testingKeyId === apiKey.id}
                                                            className="h-8 gap-1.5 text-xs"
                                                            title="Tester le statut et le solde OpenRouter en direct"
                                                        >
                                                            <RefreshCw className={`w-3.5 h-3.5 ${testingKeyId === apiKey.id ? 'animate-spin text-primary' : ''}`} />
                                                            <span className="hidden sm:inline">Diagnostic</span>
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteKey(apiKey.id, apiKey.isTemporary)}
                                                        className="text-destructive hover:text-destructive h-8 w-8 p-0"
                                                        aria-label="Supprimer la clé"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Info Card */}
                <motion.div {...fadeInUpProps} className="mt-6">
                    <Card className="border-blue-500/50 bg-blue-500/5">
                        <CardContent className="pt-6">
                            <div className="flex gap-3">
                                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <div className="space-y-2">
                                    <h4 className="font-semibold">About BYOK (Bring Your Own Key)</h4>
                                    <p className="text-sm text-muted-foreground">
                                        When you add your own API keys, you unlock unlimited usage with no product-imposed limits. 
                                        The only restrictions are those from your AI provider.
                                    </p>
                                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                        <li>Free tier uses shared keys with rate limits</li>
                                        <li>BYOK mode removes all product limits</li>
                                        <li>You only pay your AI provider directly</li>
                                        <li>Recommended: OpenRouter for multi-model access</li>
                                        {isAuthenticated ? (
                                            <li>Your keys are encrypted at rest and stored securely</li>
                                        ) : (
                                            <li>Temporary keys expire after 24 hours - sign up for persistent storage</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Add API Key Dialog */}
                <AddAPIKeyDialog
                    open={showAddDialog}
                    onOpenChange={setShowAddDialog}
                    onAdd={handleAddKey}
                    isAuthenticated={isAuthenticated}
                    initialProvider={initialProvider}
                />
            </div>
        </ModernLayout>
    );
}

export default function APIKeysPage() {
    return (
        <Suspense fallback={
            <ModernLayout>
                <div className="container mx-auto py-16 px-4 max-w-6xl text-center">
                    <p className="text-muted-foreground animate-pulse">Chargement de la gestion des clés API...</p>
                </div>
            </ModernLayout>
        }>
            <APIKeysContent />
        </Suspense>
    );
}
