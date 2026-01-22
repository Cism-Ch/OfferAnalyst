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
 */

import React, { useState } from 'react';
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
    Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUpProps, staggerContainerProps, staggerItemProps } from '@/lib/motion';

interface APIKey {
    id: string;
    name: string;
    provider: string;
    key: string;
    createdAt: string;
    lastUsed: string | null;
    requestsThisMonth: number;
}

export default function APIKeysPage() {
    // Mock data - will be replaced with actual DB queries
    const [apiKeys, setApiKeys] = useState<APIKey[]>([
        {
            id: '1',
            name: 'OpenRouter Production',
            provider: 'OpenRouter',
            key: 'sk-or-v1-1234567890abcdef',
            createdAt: '2026-01-15',
            lastUsed: '2026-01-22',
            requestsThisMonth: 234
        },
        {
            id: '2',
            name: 'Gemini Development',
            provider: 'Google Gemini',
            key: 'AIzaSyABCDEF123456',
            createdAt: '2026-01-10',
            lastUsed: '2026-01-20',
            requestsThisMonth: 89
        }
    ]);

    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [showAddDialog, setShowAddDialog] = useState(false);

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
        navigator.clipboard.writeText(key);
        // TODO: Show toast notification
    };

    const deleteKey = (id: string) => {
        if (confirm('Are you sure you want to delete this API key?')) {
            setApiKeys(keys => keys.filter(k => k.id !== id));
            // TODO: Call delete API
        }
    };

    return (
        <ModernLayout>
            <div className="container mx-auto py-8 px-4 max-w-6xl">
                {/* Header */}
                <motion.div {...fadeInUpProps} className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">API Keys</h1>
                            <p className="text-muted-foreground">
                                Manage your AI provider API keys for BYOK (Bring Your Own Key) usage
                            </p>
                        </div>
                        <Button onClick={() => setShowAddDialog(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add API Key
                        </Button>
                    </div>
                </motion.div>

                {/* Usage Overview */}
                <motion.div {...fadeInUpProps} className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Keys
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{apiKeys.length}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Active API keys
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
                                    {apiKeys.reduce((sum, key) => sum + key.requestsThisMonth, 0)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Across all keys
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
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <span className="text-2xl font-bold">Active</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Unlimited usage with your keys
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                {/* API Keys List */}
                <motion.div {...staggerContainerProps}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Your API Keys</CardTitle>
                            <CardDescription>
                                Manage and monitor your API keys. Keys are encrypted and never shared.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {apiKeys.length === 0 ? (
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
                                    {apiKeys.map((apiKey, index) => (
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
                                                            <h3 className="font-semibold">{apiKey.name}</h3>
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
                                                                Created {apiKey.createdAt}
                                                            </div>
                                                            {apiKey.lastUsed && (
                                                                <div className="flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    Last used {apiKey.lastUsed}
                                                                </div>
                                                            )}
                                                            <div>
                                                                {apiKey.requestsThisMonth} requests this month
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteKey(apiKey.id)}
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
                                        The only restrictions are those from your AI provider. Your keys are encrypted at rest and never shared.
                                    </p>
                                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                        <li>Free tier uses shared keys with rate limits</li>
                                        <li>BYOK mode removes all product limits</li>
                                        <li>You only pay your AI provider directly</li>
                                        <li>Recommended: OpenRouter for multi-model access</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </ModernLayout>
    );
}
