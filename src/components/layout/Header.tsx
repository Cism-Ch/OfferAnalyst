'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Sparkles } from 'lucide-react';
import { AI_MODEL_OPTIONS, getModelOption } from '@/lib/ai-models';
import { cn } from '@/lib/utils';

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
 * - Theme toggle
 * - Settings access
 * 
 * This component provides consistent navigation and controls
 * across the application interface.
 * 
 * @returns {JSX.Element} The header
 */
export function Header({ selectedModel, onModelChange }: HeaderProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const activeModel = getModelOption(selectedModel);

    return (
        <header className="h-16 border-b bg-white dark:bg-zinc-900 flex items-center px-6 justify-between">
            {/* Page Title */}
            <h1 className="text-lg font-semibold">Dashboard</h1>
            
            {/* Right Side Controls */}
            <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search analysis..."
                        className="w-64 pl-9 rounded-full bg-slate-100 dark:bg-zinc-800 border-none"
                    />
                </div>
                
                {/* Theme Toggle */}
                <ThemeToggle />
                
                {/* Model Switcher */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="rounded-full border-dashed">
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
                            {AI_MODEL_OPTIONS.map((option) => {
                                const isActive = option.id === selectedModel;
                                return (
                                    <button
                                        type="button"
                                        key={option.id}
                                        onClick={() => {
                                            onModelChange(option.id);
                                            setDialogOpen(false);
                                        }}
                                        className={cn(
                                            'w-full text-left rounded-2xl border p-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                                            isActive
                                                ? 'border-blue-500 shadow-lg shadow-blue-500/10 bg-blue-50 dark:bg-blue-950/20'
                                                : 'border-slate-200 dark:border-zinc-700 hover:border-blue-400/80 hover:bg-slate-50 dark:hover:bg-zinc-800'
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
                                                    className="rounded-full bg-white/50 px-2 py-1 text-xs text-slate-600 dark:bg-zinc-900/50 dark:text-zinc-100"
                                                >
                                                    {highlight}
                                                </span>
                                            ))}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </header>
    );
}
