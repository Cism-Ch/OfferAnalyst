'use client';

/**
 * AIModelSelector Component
 * 
 * Reusable, reactive AI model switcher button and dialog.
 * Works seamlessly across all layouts (ModernLayout, SimpleLayout, Header)
 * by syncing directly with global AnalysisContext.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Brain, Check, Key, ExternalLink, Cpu } from 'lucide-react';
import { AI_MODEL_OPTIONS, getModelOption } from '@/lib/ai-models';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAnalysis } from '@/contexts/AnalysisContext';

interface AIModelSelectorProps {
    selectedModel?: string;
    onModelChange?: (modelId: string) => void;
    compact?: boolean;
}

export function AIModelSelector({
    selectedModel: propSelectedModel,
    onModelChange: propOnModelChange,
    compact = false
}: AIModelSelectorProps) {
    const router = useRouter();
    const analysis = useAnalysis();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [modelCategory, setModelCategory] = useState<'all' | 'free' | 'reasoning' | 'fast' | 'pro'>('all');

    // Use props if explicitly passed, otherwise fallback to global AnalysisContext
    const activeModelId = propSelectedModel || analysis.model;
    const handleModelSelect = (modelId: string) => {
        if (propOnModelChange) {
            propOnModelChange(modelId);
        } else {
            analysis.setModel(modelId);
        }
    };

    const activeModel = getModelOption(activeModelId);

    const filteredModels = React.useMemo(() => {
        if (modelCategory === 'free') return AI_MODEL_OPTIONS.filter((m) => m.tier === 'free');
        if (modelCategory === 'pro') return AI_MODEL_OPTIONS.filter((m) => m.tier === 'pro');
        if (modelCategory === 'reasoning') return AI_MODEL_OPTIONS.filter((m) => m.latency === 'reasoning');
        if (modelCategory === 'fast') return AI_MODEL_OPTIONS.filter((m) => m.latency === 'fast');
        return AI_MODEL_OPTIONS;
    }, [modelCategory]);

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        "group relative min-h-[44px] min-w-[44px] h-11 md:h-9 md:min-h-0 md:min-w-0 px-2 sm:px-3 gap-2 rounded-xl transition-all duration-300 touch-manipulation",
                        "border-border/60 bg-background/60 hover:bg-accent/40 backdrop-blur-md shadow-xs shrink-0",
                        "focus-visible:ring-2 focus-visible:ring-primary/40",
                        compact && "px-2"
                    )}
                    aria-label={`Modèle d'IA actif : ${activeModel.label}`}
                >
                    <div className="relative flex items-center justify-center">
                        <Brain className="h-4 w-4 text-primary shrink-0 transition-transform duration-300 group-hover:scale-110" />
                        <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                    </div>

                    <div className="hidden xl:flex flex-col items-start leading-none text-left">
                        {!compact && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                                Moteur IA
                            </span>
                        )}
                        <span className="text-xs font-semibold max-w-[90px] sm:max-w-32 truncate text-foreground/90">
                            {activeModel.label.replace(/\s*\(Free\)/i, '')}
                        </span>
                    </div>

                    <Badge 
                        variant={activeModel.tier === 'free' ? 'secondary' : 'default'}
                        className={cn(
                            "hidden xl:inline-flex text-[10px] h-4 px-1.5 font-semibold rounded-md uppercase tracking-wide",
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
                            {filteredModels.length} modèles
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
                        const isActive = option.id === activeModelId;
                        return (
                            <motion.button
                                type="button"
                                key={option.id}
                                onClick={() => {
                                    handleModelSelect(option.id);
                                    setDialogOpen(false);
                                    if (option.tier === 'pro') {
                                        const providerSlug = option.provider.toLowerCase().includes('anthropic')
                                            ? 'anthropic'
                                            : option.provider.toLowerCase().includes('openai')
                                            ? 'openai'
                                            : option.provider.toLowerCase().includes('deepseek')
                                            ? 'deepseek'
                                            : option.provider.toLowerCase().includes('moonshot') || option.id.includes('kimi')
                                            ? 'moonshot'
                                            : option.provider.toLowerCase().includes('mistral')
                                            ? 'mistral'
                                            : 'openrouter';
                                        router.push(`/dashboard/api-keys?action=add&provider=${encodeURIComponent(providerSlug)}&model=${encodeURIComponent(option.id)}`);
                                    }
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
                                            
                                            <Badge
                                                variant={option.tier === 'free' ? 'secondary' : 'default'}
                                                className={cn(
                                                    'text-[10px] h-4 px-1.5 font-semibold rounded-md uppercase tracking-wide',
                                                    option.tier === 'free'
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                        : 'bg-primary/10 text-primary border border-primary/20'
                                                )}
                                            >
                                                {option.tier === 'free' ? 'Gratuit (0$)' : 'BYOK Pro'}
                                            </Badge>

                                            <span className="text-[11px] text-muted-foreground font-mono">
                                                {option.provider}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                                            {option.description}
                                        </p>

                                        {/* Specs Row */}
                                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                                            <span className="inline-flex items-center gap-1 font-mono">
                                                <Cpu className="h-3 w-3 text-primary/70" />
                                                {option.contextWindow}
                                            </span>
                                            <span>•</span>
                                            <span className="capitalize">
                                                Vitesse: <strong className="text-foreground">{option.latency}</strong>
                                            </span>
                                            <span>•</span>
                                            <span>{option.price}</span>
                                        </div>
                                    </div>

                                    {/* Selected Checkmark */}
                                    {isActive && (
                                        <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm animate-in zoom-in-50 duration-200">
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

                                {/* Pro BYOK Redirect Prompt */}
                                {option.tier === 'pro' && (
                                    <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-xs font-medium">
                                        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                            <Key className="h-3 w-3 text-primary shrink-0" />
                                            Nécessite clé {option.provider} ou OpenRouter
                                        </span>
                                        <span className="text-[11px] font-semibold text-primary inline-flex items-center gap-1 hover:underline">
                                            Configurer clé <ExternalLink className="h-3 w-3" />
                                        </span>
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
                            Une clé OpenRouter débloque tous les modèles Pro en une seule configuration.
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs font-semibold text-primary p-0 h-auto hover:bg-transparent hover:underline"
                        onClick={() => {
                            setDialogOpen(false);
                            router.push('/dashboard/api-keys');
                        }}
                    >
                        Gérer mes clés API →
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
