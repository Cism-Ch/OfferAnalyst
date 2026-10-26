'use client';

/**
 * Modern Premium Header Component
 * 
 * Features:
 * - Breadcrumb navigation
 * - Better visual hierarchy
 * - Glassmorphism effect
 * - Improved spacing and layout
 * - Action buttons on right
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PremiumThemeSelector } from "@/components/theme-selector";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Sparkles, ChevronRight, Brain, Zap, Check, Key, ExternalLink, Cpu, Layers } from 'lucide-react';
import { AI_MODEL_OPTIONS, getModelOption } from '@/lib/ai-models';
import { cn } from '@/lib/utils';
import { fadeInUpProps } from '@/lib/motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface ModernHeaderProps {
    selectedModel: string;
    onModelChange: (modelId: string) => void;
    title?: string;
    description?: string;
}

const getPageInfo = (pathname: string) => {
    const routes: Record<string, { title: string; description: string; breadcrumbs: string[] }> = {
        '/': {
            title: 'Dashboard',
            description: 'AI-powered offer analysis and insights',
            breadcrumbs: ['Home', 'Dashboard']
        },
        '/projects': {
            title: 'Projects',
            description: 'Manage your analysis projects',
            breadcrumbs: ['Home', 'Projects']
        },
        '/history': {
            title: 'History',
            description: 'View your search history',
            breadcrumbs: ['Home', 'History']
        },
        '/saved': {
            title: 'Saved Offers',
            description: 'Your bookmarked offers',
            breadcrumbs: ['Home', 'Saved Offers']
        },
        '/compare': {
            title: 'Compare',
            description: 'Side-by-side comparison',
            breadcrumbs: ['Home', 'Compare']
        },
    };

    return routes[pathname] || routes['/'];
};

export function ModernHeader({ selectedModel, onModelChange, title, description }: ModernHeaderProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [modelCategory, setModelCategory] = useState<'all' | 'free' | 'reasoning' | 'fast' | 'pro'>('all');
    const activeModel = getModelOption(selectedModel);
    const pathname = usePathname();
    const pageInfo = getPageInfo(pathname);

    const filteredModels = React.useMemo(() => {
        if (modelCategory === 'free') return AI_MODEL_OPTIONS.filter((m) => m.tier === 'free');
        if (modelCategory === 'pro') return AI_MODEL_OPTIONS.filter((m) => m.tier === 'pro');
        if (modelCategory === 'reasoning') return AI_MODEL_OPTIONS.filter((m) => m.latency === 'reasoning');
        if (modelCategory === 'fast') return AI_MODEL_OPTIONS.filter((m) => m.latency === 'fast');
        return AI_MODEL_OPTIONS;
    }, [modelCategory]);

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
                            {pageInfo.breadcrumbs[pageInfo.breadcrumbs.length - 1]}
                        </span>
                        {/* Desktop Full Breadcrumb Trail */}
                        <div className="hidden sm:flex items-center gap-2">
                            {pageInfo.breadcrumbs.map((crumb, index) => (
                                <React.Fragment key={crumb}>
                                    {index > 0 && <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />}
                                    <span className={cn(
                                        index === pageInfo.breadcrumbs.length - 1 && 'text-foreground font-medium'
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
                                placeholder="Quick search..."
                                className="w-56 pl-9 h-9 bg-muted/50 border-none transition-all duration-300 ease-in-out focus:bg-muted focus:w-64"
                            />
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
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                            "group relative h-9 px-2 sm:px-3 gap-2 rounded-xl transition-all duration-300",
                                            "border-border/60 bg-background/60 hover:bg-accent/40 backdrop-blur-md shadow-xs",
                                            "focus-visible:ring-2 focus-visible:ring-primary/40"
                                        )}
                                        aria-label={`Modèle d'IA : ${activeModel.label}`}
                                    >
                                        <div className="relative flex items-center justify-center">
                                            <Brain className="h-4 w-4 text-primary shrink-0 transition-transform duration-300 group-hover:scale-110" />
                                            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                                        </div>

                                        <div className="flex flex-col items-start leading-none text-left">
                                            <span className="hidden sm:inline text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                                                Moteur IA
                                            </span>
                                            <span className="text-xs font-semibold max-w-[85px] sm:max-w-32 truncate text-foreground/90">
                                                {activeModel.label.replace(/\s*\(Free\)/i, '')}
                                            </span>
                                        </div>

                                        <Badge 
                                            variant={activeModel.tier === 'free' ? 'secondary' : 'default'}
                                            className={cn(
                                                "text-[10px] h-4 px-1.5 font-semibold rounded-md uppercase tracking-wide",
                                                activeModel.tier === 'free' 
                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                                    : "bg-primary/10 text-primary border border-primary/20"
                                            )}
                                        >
                                            {activeModel.tier === 'free' ? 'Free' : 'Pro'}
                                        </Badge>
                                    </Button>
                                </DialogTrigger>

                                <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6 rounded-2xl border-border/60 bg-popover/95 backdrop-blur-xl shadow-2xl">
                                    <DialogHeader className="pb-3 border-b border-border/60">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                                                    <Brain className="h-5 w-5 text-primary" />
                                                    Sélection du Moteur d&apos;IA
                                                </DialogTitle>
                                                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                                    Choisissez le modèle d&apos;inférence adapté à la complexité de votre recherche
                                                </DialogDescription>
                                            </div>
                                            <Badge variant="outline" className="hidden sm:inline-flex text-xs px-2.5 py-0.5 rounded-full border-primary/30 text-primary font-medium">
                                                {filteredModels.length} disponibles
                                            </Badge>
                                        </div>

                                        {/* Category Filter Pills */}
                                        <div className="flex items-center gap-1.5 pt-3 overflow-x-auto no-scrollbar">
                                            {[
                                                { id: 'all', label: 'Tous' },
                                                { id: 'free', label: 'Gratuits (0$)' },
                                                { id: 'reasoning', label: 'Raisonnement' },
                                                { id: 'fast', label: 'Rapides' },
                                                { id: 'pro', label: 'BYOK Pro' },
                                            ].map((filter) => {
                                                const isActive = modelCategory === filter.id;
                                                return (
                                                    <button
                                                        key={filter.id}
                                                        type="button"
                                                        onClick={() => setModelCategory(filter.id as typeof modelCategory)}
                                                        className={cn(
                                                            "px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0",
                                                            isActive
                                                                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                                                                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                        )}
                                                    >
                                                        {filter.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </DialogHeader>

                                    {/* Models List */}
                                    <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-2.5">
                                        {filteredModels.map((option, index) => {
                                            const isActive = option.id === selectedModel;
                                            return (
                                                <motion.button
                                                    type="button"
                                                    key={option.id}
                                                    onClick={() => {
                                                        onModelChange(option.id);
                                                        setDialogOpen(false);
                                                    }}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.02 }}
                                                    whileHover={{ scale: 1.006 }}
                                                    whileTap={{ scale: 0.995 }}
                                                    className={cn(
                                                        'w-full text-left rounded-xl p-3.5 sm:p-4 transition-all duration-200 border relative group',
                                                        isActive
                                                            ? 'border-primary bg-primary/10 shadow-md ring-1 ring-primary/40'
                                                            : 'border-border/60 bg-card/60 hover:border-primary/40 hover:bg-accent/40'
                                                    )}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            {/* Title & Badges */}
                                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                <h4 className="text-sm sm:text-base font-bold text-foreground truncate">
                                                                    {option.label}
                                                                </h4>
                                                                {isActive && (
                                                                    <Badge className="text-[10px] h-5 px-2 bg-primary text-primary-foreground font-semibold">
                                                                        Actif
                                                                    </Badge>
                                                                )}
                                                                <Badge 
                                                                    variant={option.tier === 'free' ? 'secondary' : 'outline'}
                                                                    className={cn(
                                                                        "text-[10px] h-5 px-1.5 font-semibold",
                                                                        option.tier === 'free' 
                                                                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" 
                                                                            : "border-border/80 text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {option.tier === 'free' ? 'Inclus Gratuit' : 'Clé requise (BYOK)'}
                                                                </Badge>
                                                            </div>

                                                            <p className="text-xs text-muted-foreground mb-2.5 line-clamp-2">
                                                                {option.description}
                                                            </p>

                                                            {/* Metrics Bar */}
                                                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                                <span className="flex items-center gap-1 font-medium text-foreground/80">
                                                                    <Cpu className="h-3 w-3 text-primary shrink-0" />
                                                                    {option.provider}
                                                                </span>
                                                                <span className="text-border">•</span>
                                                                <span className="flex items-center gap-1">
                                                                    <span className={cn(
                                                                        "h-1.5 w-1.5 rounded-full shrink-0",
                                                                        option.latency === 'fast' && "bg-emerald-500",
                                                                        option.latency === 'reasoning' && "bg-purple-500",
                                                                        option.latency === 'balanced' && "bg-blue-500"
                                                                    )} />
                                                                    <span className="capitalize">{option.latency}</span>
                                                                </span>
                                                                <span className="text-border">•</span>
                                                                <span className="flex items-center gap-1">
                                                                    <Layers className="h-3 w-3 text-muted-foreground shrink-0" />
                                                                    {option.contextWindow}
                                                                </span>
                                                                <span className="text-border">•</span>
                                                                <span className="font-semibold text-primary">
                                                                    {option.price}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Check circle */}
                                                        {isActive && (
                                                            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-xs">
                                                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Highlights */}
                                                    {option.highlights.length > 0 && (
                                                        <div className="mt-2.5 pt-2.5 border-t border-border/40 flex flex-wrap gap-1.5">
                                                            {option.highlights.map((highlight) => (
                                                                <span
                                                                    key={highlight}
                                                                    className="rounded-md bg-muted/70 px-2 py-0.5 text-[10px] text-muted-foreground font-medium"
                                                                >
                                                                    {highlight}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    {/* Footer BYOK Callout */}
                                    <div className="pt-3 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-muted/20 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-3 sm:px-6">
                                        <div className="flex items-center gap-2">
                                            <Key className="h-4 w-4 text-primary shrink-0" />
                                            <span className="text-xs text-muted-foreground">
                                                Besoin de quotas illimités ou de Claude Sonnet ?
                                            </span>
                                        </div>
                                        <Link 
                                            href="/dashboard/api-keys" 
                                            onClick={() => setDialogOpen(false)}
                                            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                                        >
                                            Gérer mes clés API <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Row - Page Title and Description */}
                <div>
                    <motion.h1
                        className="text-xl sm:text-2xl font-bold tracking-tight"
                        {...fadeInUpProps}
                    >
                        {title || pageInfo.title}
                    </motion.h1>
                    <motion.p
                        className="text-xs sm:text-sm text-muted-foreground mt-0.5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        {description || pageInfo.description}
                    </motion.p>
                </div>
            </div>
        </motion.header>
    );
}
