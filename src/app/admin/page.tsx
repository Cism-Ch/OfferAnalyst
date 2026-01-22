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

import React, { useState } from 'react';
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
    TrendingUp,
    Database,
    Flag,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUpProps, staggerContainerProps, staggerItemProps } from '@/lib/motion';

export default function AdminPage() {
    // Mock data - will be replaced with actual admin queries
    const [featureFlags, setFeatureFlags] = useState({
        fetchV2: false,
        organizeV2: false,
        dualWorkflow: true,
        newAnalytics: true
    });

    const systemStats = {
        totalUsers: 1247,
        activeUsers: 834,
        totalSearches: 15632,
        byokActivations: 342,
        avgResponseTime: 850
    };

    const recentUsers = [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Editor', status: 'Active' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Viewer', status: 'Active' },
        { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'Admin', status: 'Suspended' }
    ];

    const providerUsage = [
        { provider: 'OpenRouter', freeRequests: 5234, byokRequests: 8921, errors: 12 },
        { provider: 'Google Gemini', freeRequests: 3421, byokRequests: 1234, errors: 5 },
        { provider: 'DeepSeek', freeRequests: 2145, byokRequests: 567, errors: 2 }
    ];

    const toggleFeature = (feature: keyof typeof featureFlags) => {
        setFeatureFlags(prev => ({ ...prev, [feature]: !prev[feature] }));
        // TODO: Call API to update feature flag
    };

    return (
        <ModernLayout>
            <div className="container mx-auto py-8 px-4 max-w-7xl">
                {/* Header */}
                <motion.div {...fadeInUpProps} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-8 h-8 text-red-500" />
                        <h1 className="text-3xl font-bold">Admin Console</h1>
                        <Badge variant="destructive">Admin Only</Badge>
                    </div>
                    <p className="text-muted-foreground">
                        System administration and monitoring dashboard
                    </p>
                </motion.div>

                <motion.div {...staggerContainerProps} className="space-y-6">
                    {/* System Stats */}
                    <motion.div {...staggerItemProps}>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Total Users
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{systemStats.totalUsers.toLocaleString()}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Activity className="w-4 h-4" />
                                        Active Users
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{systemStats.activeUsers.toLocaleString()}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" />
                                        Total Searches
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{systemStats.totalSearches.toLocaleString()}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Key className="w-4 h-4" />
                                        BYOK Active
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{systemStats.byokActivations.toLocaleString()}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Database className="w-4 h-4" />
                                        Avg Response
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{systemStats.avgResponseTime}ms</div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>

                    {/* Provider Usage */}
                    <motion.div {...staggerItemProps}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Provider Usage & Quotas</CardTitle>
                                <CardDescription>
                                    API consumption breakdown by provider
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {providerUsage.map((provider) => (
                                        <div key={provider.provider} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold">{provider.provider}</h4>
                                                {provider.errors > 10 ? (
                                                    <Badge variant="destructive">
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        High Errors
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-green-500">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        Healthy
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Free Tier</p>
                                                    <p className="font-semibold">{provider.freeRequests.toLocaleString()} requests</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">BYOK</p>
                                                    <p className="font-semibold">{provider.byokRequests.toLocaleString()} requests</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Errors</p>
                                                    <p className="font-semibold text-red-500">{provider.errors}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
                                            <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <h4 className="font-medium">{user.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">{user.role}</Badge>
                                                    <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>
                                                        {user.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="outline" className="w-full mt-4">
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
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* System Health */}
                    <motion.div {...staggerItemProps}>
                        <Card>
                            <CardHeader>
                                <CardTitle>System Health & Logs</CardTitle>
                                <CardDescription>
                                    Local observability and error tracking
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-2">
                                        System logs are managed via Pino locally. No external logging services are used to maintain privacy.
                                    </p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">View Error Logs</Button>
                                        <Button variant="outline" size="sm">View Latency Reports</Button>
                                        <Button variant="outline" size="sm">Export Logs</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>
        </ModernLayout>
    );
}
