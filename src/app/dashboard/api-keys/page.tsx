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

import React, { useState, useEffect } from 'react';
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
    ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUpProps, staggerContainerProps, staggerItemProps } from '@/lib/motion';
import { useSession } from '@/lib/auth-client';
import { useTemporaryApiKeys } from '@/hooks/use-temporary-api-keys';
import { AddAPIKeyDialog } from '@/components/api-keys/AddAPIKeyDialog';
import { SecurityMigrationBanner, UnauthenticatedSecurityWarning } from '@/components/api-keys/SecurityMigrationBanner';
import { getUserAPIKeys, addAPIKey, deleteAPIKey, getAPIKeyStats } from '@/app/actions/db/api-keys';
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
}

export default function APIKeysPage() {
    const { data: session, isPending } = useSession();
    const temporaryKeys = useTemporaryApiKeys();
    
    const [displayKeys, setDisplayKeys] = useState<DisplayAPIKey[]>([]);
    const [stats, setStats] = useState({
        totalKeys: 0,
        totalRequests: 0,
        byokActive: false
    });
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const isAuthenticated = !!session?.user && !isPending;

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
                    
                    const keys: DisplayAPIKey[] = dbKeys.map((k: APIKeyData) => ({
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
                        isTemporary: false
                    }));
                    
                    setDisplayKeys(keys);
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
                        expiresAt: k.expiresAt
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
    }, [isAuthenticated, session?.user?.id, temporaryKeys.isLoaded, temporaryKeys.keys, isPending]);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

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

    const handleAddKey = async (name: string, provider: string, key: string, expiresAt?: Date | null, rateLimit?: number | null) => {
        try {
            if (isAuthenticated && session.user?.id) {
                // Add to database
                const result = await addAPIKey(session.user.id, name, provider, key, expiresAt, rateLimit);
                if (result.success) {
                    showToast('API key added successfully', 'success');
                    // Reload keys
                    const [dbKeys, dbStats] = await Promise.all([
                        getUserAPIKeys(session.user.id),
                        getAPIKeyStats(session.user.id)
                    ]);
                    
                    const keys: DisplayAPIKey[] = dbKeys.map((k: APIKeyData) => ({
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
                        isTemporary: false
                    }));
                    
                    setDisplayKeys(keys);
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
                    
                    const keys: DisplayAPIKey[] = dbKeys.map((k: APIKeyData) => ({
                        id: k.id,
                        name: k.name,
                        provider: k.provider,
                        key: k.keyPreview,
                        createdAt: k.createdAt,
                        lastUsed: k.lastUsed,
                        usageCount: k.usageCount,
                        isTemporary: false
                    }));
                    
                    setDisplayKeys(keys);
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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">API Keys</h1>
                            <p className="text-muted-foreground">
                                {isAuthenticated 
                                    ? 'Manage your AI provider API keys for BYOK (Bring Your Own Key) usage'
                                    : 'Add temporary API keys to enable BYOK access (keys expire after 24 hours)'
                                }
                            </p>
                        </div>
                        <Button onClick={() => setShowAddDialog(true)}>
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
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-semibold">{apiKey.name}</h3>
                                                                {apiKey.isTemporary && (
                                                                    <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                                                                        Temporary
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <Badge variant="outline" className="mt-1">
                                                                {apiKey.provider}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="ml-8 space-y-2">
                                                        <div className="flex items-center gap-2 font-mono text-sm">
                                                            <span>
                                                                {visibleKeys.has(apiKey.id) 
                                                                    ? apiKey.key 
                                                                    : maskKey(apiKey.key)
                                                                }
                                                            </span>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleKeyVisibility(apiKey.id)}
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
                                                                onClick={() => copyToClipboard(apiKey.key)}
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                            </Button>
                                                        </div>

                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                Created {new Date(apiKey.createdAt).toLocaleDateString()}
                                                            </div>
                                                            {apiKey.lastUsed && (
                                                                <div className="flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    Last used {new Date(apiKey.lastUsed).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                            {!apiKey.isTemporary && (
                                                                <div>
                                                                    {apiKey.usageCount} requests
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

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteKey(apiKey.id, apiKey.isTemporary)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
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
                />
            </div>
        </ModernLayout>
    );
}
