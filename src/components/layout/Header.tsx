'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PremiumThemeSelector } from "@/components/theme-selector";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Sparkles } from 'lucide-react';
import { AI_MODEL_OPTIONS, getModelOption } from '@/lib/ai-models';
import { cn } from '@/lib/utils';
import { fadeInUpProps } from '@/lib/motion';

interface HeaderProps {
    selectedModel: string;
    onModelChange: (modelId: string) => void;
}

/**
 * Header Component
 * 
 * Top navigation bar that includes:
 * - Page title
 * - Search functionality
 * - Premium theme selector
 * - Model switcher
 * 
 * Enhanced with Framer Motion animations for premium feel
 * 
 * @returns {JSX.Element} The header
 */
export function Header({ selectedModel, onModelChange }: HeaderProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const activeModel = getModelOption(selectedModel);

    return (
        <motion.header 
            className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-6 justify-between sticky top-0 z-50"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Page Title */}
            <motion.h1 
                className="text-lg font-semibold"
                {...fadeInUpProps}
            >
                Dashboard
            </motion.h1>
            
            {/* Right Side Controls */}
            <div className="flex items-center gap-4">
                {/* Search Bar */}
                <motion.div 
                    className="relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search analysis..."
                        className="w-64 pl-9 rounded-full bg-muted/50 border-none transition-all duration-300 ease-in-out focus:bg-muted"
                    />
                </motion.div>
                
                {/* Premium Theme Selector */}
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
                            <Button variant="outline" className="rounded-full border-dashed transition-all duration-300 ease-in-out hover:border-solid hover:shadow-md">
                                <Sparkles className="h-4 w-4 mr-2 text-primary" />
                                <div className="flex flex-col text-left">
                                    <span className="text-xs text-muted-foreground">Active model</span>
                                    <span className="text-sm font-medium max-w-40 truncate">{activeModel.label}</span>
                                </div>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Choisir le modèle IA</DialogTitle>
                                <DialogDescription>
                                    Sélectionnez un modèle OpenRouter en fonction de votre budget et du niveau de raisonnement souhaité.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
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
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={cn(
                                                'w-full text-left rounded-2xl border p-4 transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                                                isActive
                                                    ? 'border-blue-500 shadow-lg shadow-blue-500/10 bg-blue-50 dark:bg-blue-950/20'
                                                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                            )}
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-base font-semibold">
                                                        {option.label}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {option.description}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={option.tier === 'free' ? 'secondary' : 'outline'}>
                                                        {option.tier === 'free' ? 'Gratuit' : 'Pro' }
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {option.contextWindow}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                <span>{option.provider}</span>
                                                <span>{option.latency === 'reasoning' ? 'Reasoning' : option.latency === 'fast' ? 'Rapide' : 'Équilibré'}</span>
                                                <span className="font-semibold text-primary">{option.price}</span>
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {option.highlights.map((highlight) => (
                                                    <span
                                                        key={highlight}
                                                        className="rounded-full bg-background/50 px-2 py-1 text-xs transition-all duration-300 ease-in-out hover:bg-background"
                                                    >
                                                        {highlight}
                                                    </span>
                                                ))}
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </DialogContent>
                    </Dialog>
                </motion.div>
            </div>
        </motion.header>
    );
}
