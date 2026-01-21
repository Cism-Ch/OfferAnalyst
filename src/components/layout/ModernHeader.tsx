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
import { Search, Sparkles, ChevronRight } from 'lucide-react';
import { AI_MODEL_OPTIONS, getModelOption } from '@/lib/ai-models';
import { cn } from '@/lib/utils';
import { fadeInUpProps } from '@/lib/motion';
import { usePathname } from 'next/navigation';

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
    const activeModel = getModelOption(selectedModel);
    const pathname = usePathname();
    const pageInfo = getPageInfo(pathname);

    return (
        <motion.header
            className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="px-6 py-4">
                {/* Top Row - Breadcrumbs and Actions */}
                <div className="flex items-center justify-between mb-3">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {pageInfo.breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={crumb}>
                                {index > 0 && <ChevronRight className="h-4 w-4" />}
                                <span className={cn(
                                    index === pageInfo.breadcrumbs.length - 1 && 'text-foreground font-medium'
                                )}>
                                    {crumb}
                                </span>
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Quick search..."
                                className="w-64 pl-9 h-9 bg-muted/50 border-none transition-all duration-300 ease-in-out focus:bg-muted focus:w-72"
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
                                        className="gap-2 transition-all duration-300 ease-in-out hover:border-primary/50"
                                    >
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        <div className="flex flex-col items-start">
                                            <span className="text-xs text-muted-foreground">AI Model</span>
                                            <span className="text-xs font-medium max-w-32 truncate">
                                                {activeModel.label}
                                            </span>
                                        </div>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                                    <DialogHeader>
                                        <DialogTitle>Select AI Model</DialogTitle>
                                        <DialogDescription>
                                            Choose an AI model based on your needs and budget
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                                        {AI_MODEL_OPTIONS.map((option, index) => {
                                            const isActive = option.id === selectedModel;
                                            return (
                                                <motion.button
                                                    type="button"
                                                    key={option.id}
                                                    onClick={() => {
                                                        onModelChange(option.id);
                                                        setDialogOpen(false);
                                                    }}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.03 }}
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.99 }}
                                                    className={cn(
                                                        'w-full text-left rounded-xl border p-4 transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                                                        isActive
                                                            ? 'border-primary shadow-lg shadow-primary/10 bg-primary/5 ring-2 ring-primary/20'
                                                            : 'border-border hover:border-primary/30 hover:bg-accent/50'
                                                    )}
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className="text-base font-semibold">
                                                                    {option.label}
                                                                </p>
                                                                {isActive && (
                                                                    <Badge variant="default" className="text-xs">
                                                                        Active
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mb-2">
                                                                {option.description}
                                                            </p>
                                                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <span className="font-medium">{option.provider}</span>
                                                                </span>
                                                                <span>•</span>
                                                                <span>{option.latency === 'reasoning' ? 'Reasoning' : option.latency === 'fast' ? 'Fast' : 'Balanced'}</span>
                                                                <span>•</span>
                                                                <span className="font-semibold text-primary">{option.price}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <Badge variant={option.tier === 'free' ? 'secondary' : 'outline'}>
                                                                {option.tier === 'free' ? 'Free' : 'Pro'}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground">
                                                                {option.contextWindow}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {option.highlights.length > 0 && (
                                                        <div className="mt-3 flex flex-wrap gap-1">
                                                            {option.highlights.map((highlight) => (
                                                                <span
                                                                    key={highlight}
                                                                    className="rounded-full bg-muted px-2.5 py-1 text-xs transition-all duration-300 ease-in-out hover:bg-muted/80"
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
                                </DialogContent>
                            </Dialog>
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Row - Page Title and Description */}
                <div>
                    <motion.h1
                        className="text-2xl font-bold tracking-tight"
                        {...fadeInUpProps}
                    >
                        {title || pageInfo.title}
                    </motion.h1>
                    <motion.p
                        className="text-sm text-muted-foreground mt-1"
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
