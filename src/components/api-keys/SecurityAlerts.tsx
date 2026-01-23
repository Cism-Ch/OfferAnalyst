'use client';

/**
 * Security Alerts Component
 * 
 * Displays security alerts for API key usage and allows users to manage them.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    AlertTriangle, 
    ShieldAlert, 
    CheckCircle2, 
    Trash2,
    Eye,
    EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    getUserSecurityAlerts, 
    markAlertAsRead, 
    resolveAlert,
    deleteResolvedAlerts,
    type SecurityAlertData 
} from '@/app/actions/db/security-alerts';

interface SecurityAlertsProps {
    userId: string;
}

export function SecurityAlerts({ userId }: SecurityAlertsProps) {
    const [alerts, setAlerts] = useState<SecurityAlertData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showResolved, setShowResolved] = useState(false);

    useEffect(() => {
        let cancelled = false;
        
        const loadAlerts = async () => {
            setIsLoading(true);
            const data = await getUserSecurityAlerts(userId, {
                unresolvedOnly: !showResolved
            });
            if (!cancelled) {
                setAlerts(data);
                setIsLoading(false);
            }
        };
        
        loadAlerts();
        
        return () => {
            cancelled = true;
        };
    }, [userId, showResolved]);
    
    const loadAlertsManually = async () => {
        setIsLoading(true);
        const data = await getUserSecurityAlerts(userId, {
            unresolvedOnly: !showResolved
        });
        setAlerts(data);
        setIsLoading(false);
    };

    const handleMarkAsRead = async (alertId: string) => {
        await markAlertAsRead(userId, alertId);
        await loadAlertsManually();
    };

    const handleResolve = async (alertId: string) => {
        await resolveAlert(userId, alertId);
        await loadAlertsManually();
    };

    const handleDeleteResolved = async () => {
        const result = await deleteResolvedAlerts(userId);
        if (result.success) {
            await loadAlertsManually();
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-500';
            case 'high':
                return 'bg-orange-500';
            case 'medium':
                return 'bg-yellow-500';
            case 'low':
                return 'bg-blue-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
            case 'high':
                return <ShieldAlert className="w-5 h-5" />;
            case 'medium':
                return <AlertTriangle className="w-5 h-5" />;
            default:
                return <AlertTriangle className="w-5 h-5" />;
        }
    };

    const unresolvedCount = alerts.filter(a => !a.isResolved).length;
    // Track unread alerts for future notifications
    // const unreadCount = alerts.filter(a => !a.isRead).length;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5" />
                            Security Alerts
                            {unresolvedCount > 0 && (
                                <Badge variant="destructive">{unresolvedCount}</Badge>
                            )}
                        </CardTitle>
                        <CardDescription>
                            Monitor suspicious activity and security events
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowResolved(!showResolved)}
                        >
                            {showResolved ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                            {showResolved ? 'Hide Resolved' : 'Show Resolved'}
                        </Button>
                        {showResolved && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDeleteResolved}
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Clear Resolved
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Loading alerts...
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="text-center py-8">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
                        <p className="text-muted-foreground">
                            {showResolved ? 'No alerts found' : 'No active security alerts'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {alerts.map((alert) => (
                                <motion.div
                                    key={alert.id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`p-4 rounded-lg border ${
                                        alert.isResolved 
                                            ? 'bg-muted/50 border-muted' 
                                            : alert.isRead 
                                            ? 'bg-background border-border' 
                                            : 'bg-accent/10 border-accent'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-full text-white ${getSeverityColor(alert.severity)}`}>
                                            {getSeverityIcon(alert.severity)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {alert.alertType.replace(/_/g, ' ')}
                                                </Badge>
                                                <Badge className={getSeverityColor(alert.severity) + ' text-white'}>
                                                    {alert.severity}
                                                </Badge>
                                                {alert.apiKeyName && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {alert.apiKeyName}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm mb-2">{alert.message}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(alert.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            {!alert.isRead && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleMarkAsRead(alert.id)}
                                                    title="Mark as read"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            )}
                                            {!alert.isResolved && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleResolve(alert.id)}
                                                    title="Resolve alert"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
