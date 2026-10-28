'use client';

/**
 * Modern Premium Header Component
 * 
 * Features:
 * - Breadcrumb navigation
 * - Better visual hierarchy
 * - Glassmorphism effect
 * - Improved spacing and layout
 * - Action buttons on right (Search, Theme Selector, AI Model Switcher)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { PremiumThemeSelector } from "@/components/theme-selector";
import { Search, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fadeInUpProps } from '@/lib/motion';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { AIModelSelector } from './AIModelSelector';
import { LanguageToggle } from './LanguageToggle';

interface ModernHeaderProps {
    selectedModel?: string;
    onModelChange?: (modelId: string) => void;
    title?: string;
    description?: string;
}

export function ModernHeader({ selectedModel, onModelChange, title, description }: ModernHeaderProps) {
    const pathname = usePathname();
    const { t } = useLanguage();
    const routeInfo = (t.routes as Record<string, { title: string; description: string; breadcrumbs: string[] }>)[pathname] || t.routes['/'];
    const pageTitle = title || routeInfo.title;
    const pageDescription = description || routeInfo.description;

    return (
        <motion.header
            className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="px-4 sm:px-6 py-3 sm:py-4 pl-16 md:pl-6">
                {/* Top Row - Breadcrumbs and Actions */}
                <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground min-w-0">
                        {/* Mobile Single Crumb */}
                        <span className="sm:hidden text-xs text-foreground font-semibold truncate max-w-[130px]">
                            {routeInfo.breadcrumbs[routeInfo.breadcrumbs.length - 1]}
                        </span>
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
                    <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                        {/* Search (Desktop only to prevent mobile overflow) */}
                        <motion.div
                            className="relative hidden lg:block"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder={t.nav.quickSearch}
                                className="w-56 pl-9 h-9 bg-muted/50 border-none transition-all duration-300 ease-in-out focus:bg-muted focus:w-64"
                            />
                        </motion.div>

                        {/* Language Switcher */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.15 }}
                        >
                            <LanguageToggle />
                        </motion.div>

                        {/* Theme Selector */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <PremiumThemeSelector />
                        </motion.div>

                        {/* Model Switcher */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <AIModelSelector
                                selectedModel={selectedModel}
                                onModelChange={onModelChange}
                            />
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Row - Page Title and Description */}
                <div>
                    <motion.h1
                        className="text-xl sm:text-2xl font-bold tracking-tight"
                        {...fadeInUpProps}
                    >
                        {pageTitle}
                    </motion.h1>
                    <motion.p
                        className="text-xs sm:text-sm text-muted-foreground mt-0.5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        {pageDescription}
                    </motion.p>
                </div>
            </div>
        </motion.header>
    );
}
