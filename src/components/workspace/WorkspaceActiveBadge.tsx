'use client';

/**
 * Workspace Active Badge & Quick Switcher Indicator
 * 
 * Displays current active workspace name with plan/role indicator.
 * Works seamlessly in ModernHeader (desktop & mobile) and ModernSidebar.
 * Clicking directs to the workspace management view (/dashboard/workspace).
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Building2, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getWorkspaceAction, type WorkspaceDTO } from '@/app/actions/db/workspaces';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface WorkspaceActiveBadgeProps {
    variant?: 'compact' | 'full' | 'sidebar';
    className?: string;
    onClick?: () => void;
}

export function WorkspaceActiveBadge({
    variant = 'compact',
    className,
    onClick
}: WorkspaceActiveBadgeProps) {
    const { language } = useLanguage();
    const isFr = language === 'fr';
    const [workspace, setWorkspace] = useState<WorkspaceDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const isMountedRef = useRef(true);

    const loadWorkspace = useCallback(async () => {
        try {
            const res = await getWorkspaceAction();
            if (isMountedRef.current && res.success && res.data) {
                setWorkspace(res.data);
            }
        } catch {
            // Background fallback
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        isMountedRef.current = true;
        const timer = setTimeout(() => {
            loadWorkspace();
        }, 0);

        return () => {
            isMountedRef.current = false;
            clearTimeout(timer);
        };
    }, [loadWorkspace]);

    if (loading) {
        if (variant === 'sidebar') {
            return (
                <div className={cn("p-2.5 rounded-xl border border-border/60 bg-card/40 flex items-center gap-2.5", className)}>
                    <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                    <div className="space-y-1.5 flex-1 min-w-0">
                        <Skeleton className="h-2.5 w-16" />
                        <Skeleton className="h-3.5 w-24" />
                    </div>
                </div>
            );
        }

        return (
            <Skeleton className={cn("h-7 w-28 rounded-lg", className)} />
        );
    }

    if (!workspace) return null;

    const displayName = workspace.name || (isFr ? 'Espace Personnel' : 'Personal Workspace');
    const roleLabel = workspace.currentUserRole === 'OWNER' 
        ? (isFr ? 'Propriétaire' : 'Owner')
        : workspace.currentUserRole === 'ADMIN'
        ? 'Admin'
        : (isFr ? 'Membre' : 'Member');

    if (variant === 'sidebar') {
        return (
            <Link
                href="/dashboard/workspace"
                onClick={onClick}
                className={cn(
                    "flex items-center justify-between p-2.5 rounded-xl border border-border/70 bg-card/60 hover:bg-accent/50 hover:border-primary/40 transition-all group touch-manipulation",
                    className
                )}
                title={isFr ? `Espace actif : ${displayName} (${roleLabel})` : `Active workspace: ${displayName} (${roleLabel})`}
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-105 transition-transform">
                        <Building2 className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0 text-left">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            {isFr ? 'Espace Actif' : 'Workspace'}
                            {workspace.isGuest && (
                                <span className="text-[9px] text-amber-500 font-semibold">(Démo)</span>
                            )}
                        </span>
                        <span className="text-xs font-semibold text-foreground truncate max-w-[130px]">
                            {displayName}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 text-muted-foreground group-hover:text-primary">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 rounded-sm border-primary/30 text-primary">
                        {roleLabel}
                    </Badge>
                    <ChevronRight className="h-3.5 w-3.5" />
                </div>
            </Link>
        );
    }

    return (
        <Link
            href="/dashboard/workspace"
            onClick={onClick}
            className={cn(
                "group inline-flex items-center gap-1.5 px-2 py-1 min-h-[30px] rounded-lg border border-border/60 bg-background/80 hover:bg-accent/50 hover:border-primary/40 active:scale-95 transition-all touch-manipulation shadow-2xs max-w-full",
                className
            )}
            title={isFr ? `Espace actif : ${displayName} (${roleLabel})` : `Active workspace: ${displayName} (${roleLabel})`}
        >
            <div className="h-4.5 w-4.5 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <Building2 className="h-3 w-3" />
            </div>
            <div className="flex items-center gap-1 min-w-0 flex-wrap">
                <span className="text-xs font-semibold text-foreground/90 truncate max-w-[110px] min-[380px]:max-w-[150px] sm:max-w-[180px]">
                    {displayName}
                </span>
                <Badge 
                    variant="secondary" 
                    className="text-[9px] h-3.5 px-1 font-semibold rounded-xs hidden min-[360px]:inline-flex bg-muted text-muted-foreground group-hover:text-foreground shrink-0"
                >
                    {roleLabel}
                </Badge>
            </div>
            <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors hidden sm:inline-block shrink-0" />
        </Link>
    );
}
