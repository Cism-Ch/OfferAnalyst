'use client';

/**
 * Modern Premium Header Component (Unified AppHeader)
 * 
 * Features:
 * - Breadcrumb navigation (compact single crumb on mobile, full trail on desktop)
 * - Compact mobile header: height strictly <= 56px, mobile title & description scroll with page
 * - Action buttons on right (Quick Search on lg, Daily Quota Zap badge, Language, Theme, AI Model)
 * - Safe 44x44px mobile touch targets (WCAG 2.5.5)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PremiumThemeSelector } from "@/components/theme-selector";
import { Search, ChevronRight, Zap, KeyRound, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { fadeInUpProps } from '@/lib/motion';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { AIModelSelector } from './AIModelSelector';
import { LanguageToggle } from './LanguageToggle';
import { GuestApiKeyDialog } from '@/components/api-keys/GuestApiKeyDialog';
import { getDailyQuotaAction } from '@/app/actions/shared/quota-limiter';

export interface ModernHeaderProps {
    selectedModel?: string;
    onModelChange?: (modelId: string) => void;
    title?: string;
    description?: string;
    showModelSelector?: boolean;
}

export function ModernHeader({
    selectedModel,
    onModelChange,
    title,
    description,
    showModelSelector = true
}: ModernHeaderProps) {
    const pathname = usePathname();
    const { t, language } = useLanguage();
    const [guestKeyDialogOpen, setGuestKeyDialogOpen] = useState(false);
    const [quota, setQuota] = useState<{ remaining: number; total: number; isByok: boolean } | null>(null);

    const fetchQuota = useCallback(async () => {
        try {
            const res = await getDailyQuotaAction();
            if (res.success && res.data) {
                setQuota(res.data);
            }
        } catch {
            // Background fetch fallback
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchQuota();
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchQuota]);

    const routeInfo = (t.routes as Record<string, { title: string; description: string; breadcrumbs: string[] }>)[pathname] || t.routes['/'];
    const pageTitle = title || routeInfo.title;
    const pageDescription = description || routeInfo.description;

    return (
        <>
            {/* Sticky Header Bar - Height strictly <= 56px on mobile */}
            <motion.header
                className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-header"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
            >
                <div className="h-14 sm:h-auto px-2 sm:px-6 py-1.5 sm:py-4 pl-16 md:pl-6 flex flex-col justify-center">
                    {/* Top Row - Breadcrumbs and Actions */}
                    <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground min-w-0">
                            {/* Mobile Single Crumb — Premium Pill Badge */}
                            <div className="sm:hidden flex items-center min-w-0">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted/70 border border-border/70 text-foreground/90 truncate max-w-[125px] min-[375px]:max-w-[155px] shadow-2xs">
                                    {routeInfo.breadcrumbs[routeInfo.breadcrumbs.length - 1]}
                                </span>
                            </div>
                            {/* Desktop Full Breadcrumb Trail */}
                            <div className="hidden sm:flex items-center gap-2">
                                {routeInfo.breadcrumbs.map((crumb, index) => (
                                    <React.Fragment key={crumb}>
                                        {index > 0 && <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />}
                                        <span className={cn(
                                            index === routeInfo.breadcrumbs.length - 1 && 'text-foreground font-medium'
                                        )}>
                                            {crumb}
                                        </span>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0 ml-auto">
                            {/* Desktop Quick Search */}
                            <motion.div
                                className="relative hidden xl:block"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder={t.nav.quickSearch}
                                    className="w-60 pl-9 h-9 bg-muted/50 border-none transition-[background-color,box-shadow] duration-200 ease-out focus:bg-muted focus:ring-1 focus:ring-primary/20"
                                />
                            </motion.div>

                            {/* Model Switcher with tactile margins */}
                            {showModelSelector && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.12 }}
                                    className="shrink-0"
                                >
                                    <AIModelSelector
                                        selectedModel={selectedModel}
                                        onModelChange={onModelChange}
                                        compact
                                    />
                                </motion.div>
                            )}

                            {/* Daily Quota Badge & Key Dialog Trigger */}
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="flex items-center gap-1.5 shrink-0"
                            >
                                {quota && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setGuestKeyDialogOpen(true)}
                                        className={cn(
                                             "min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 h-11 md:h-8 px-2 sm:px-2.5 text-xs font-medium rounded-full border transition-all gap-1.5 touch-manipulation",
                                            quota.isByok
                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                                                : quota.remaining === 0
                                                ? "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20"
                                                : "bg-muted/50 text-foreground border-border hover:bg-muted"
                                        )}
                                        title={quota.isByok ? (language === 'fr' ? "BYOK Actif (Recherches illimitées)" : "BYOK Active (Unlimited searches)") : `Quota: ${quota.remaining}/${quota.total} ${language === 'fr' ? 'recherches' : 'searches'}`}
                                    >
                                        <Zap className={cn("h-3.5 w-3.5", quota.isByok ? "text-emerald-500 fill-emerald-500/30" : "text-amber-500 fill-amber-500/20")} />
                                        <span className="hidden xl:inline">
                                            {quota.isByok
                                                ? (language === 'fr' ? "BYOK Actif" : "BYOK Active")
                                                : `${quota.remaining}/${quota.total} ${language === 'fr' ? 'recherches' : 'searches'}`}
                                        </span>
                                    </Button>
                                )}

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setGuestKeyDialogOpen(true)}
                                    className="hidden xl:inline-flex min-h-[44px] min-w-[44px] size-11 md:size-8 md:min-h-0 md:min-w-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent touch-manipulation"
                                    title={language === 'fr' ? "Configurer clé API (BYOK)" : "Configure API Key (BYOK)"}
                                    aria-label="API Key Dialog"
                                >
                                    <KeyRound className="h-4 w-4" />
                                </Button>

                                <Link href="/landing" className="hidden 2xl:inline-flex">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-full border border-border/60 hover:bg-accent"
                                        title={t.nav.saasShowcase}
                                    >
                                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                                        <span>{t.nav.saasShowcase}</span>
                                    </Button>
                                </Link>
                            </motion.div>

                            {/* Right-Snapped Controls: Language & Theme grouped together */}
                            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pl-1 border-l border-border/50 sm:border-transparent sm:pl-0">
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.18 }}
                                >
                                    <LanguageToggle />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <PremiumThemeSelector />
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop/Tablet Bottom Row - Page Title and Description (hidden < sm to preserve vertical height) */}
                    <div className="hidden sm:block mt-2">
                        <motion.h1
                            className="text-xl sm:text-2xl font-bold tracking-tight"
                            {...fadeInUpProps}
                        >
                            {pageTitle}
                        </motion.h1>
                        {pageDescription && (
                            <motion.p
                                className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1 md:line-clamp-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                {pageDescription}
                            </motion.p>
                        )}
                    </div>
                </div>
            </motion.header>

            {/* Mobile Non-Sticky Title Banner: Scrolls with page content, centered for SaaS premium elegance */}
            <div className="sm:hidden px-4 pt-3 pb-1 text-center">
                <h1 className="text-xl font-bold tracking-tight text-foreground break-words">
                    {pageTitle}
                </h1>
                {pageDescription && (
                    <p className="text-xs text-muted-foreground mt-0.5 max-w-sm mx-auto line-clamp-2 break-words">
                        {pageDescription}
                    </p>
                )}
            </div>

            {/* Guest API Key Dialog */}
            <GuestApiKeyDialog
                open={guestKeyDialogOpen}
                onOpenChange={setGuestKeyDialogOpen}
                onKeyUpdated={fetchQuota}
            />
        </>
    );
}

export { ModernHeader as AppHeader };
export type { ModernHeaderProps as AppHeaderProps };
