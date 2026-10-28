'use client';

/**
 * LiveAIStatusIndicator Component
 * 
 * Provides transparent, real-time visualization of LLM inference states.
 * Guarantees the user is never "blind" during long-running AI searches.
 * Displays:
 * - Active AI Model and provider
 * - Current processing phase with animated status indicators
 * - Live stopwatch (elapsed seconds)
 * - Dynamic status message and reasoning progress
 * - Cancel button
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Globe, Sparkles, Clock, AlertTriangle, XCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { getModelOption } from '@/lib/ai-models';

export function LiveAIStatusIndicator() {
  const { status, stepMessage, elapsedSeconds, model, cancelAnalysis, loading } = useAnalysis();

  if (!loading) {
    return null;
  }

  const modelMeta = getModelOption(model);

  // Compute progress approximation based on status and elapsed time
  let progressPercent = 15;
  if (status === 'fetching') {
    progressPercent = Math.min(65, 25 + elapsedSeconds * 5);
  } else if (status === 'analyzing') {
    progressPercent = Math.min(95, 65 + elapsedSeconds * 4);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-primary/30 bg-card/90 backdrop-blur-xl p-5 shadow-2xl space-y-4"
      >
        {/* Header: Model & Timer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center p-2.5 rounded-xl bg-primary/10 text-primary">
              <Brain className="h-5 w-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm sm:text-base text-foreground">
                  Inférence IA en cours
                </h4>
                <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5">
                  {modelMeta.label.replace(/\s*\(Free\)|\s*\(Inclus\)|\s*\(Gratuit\)/gi, '')}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Moteur d&apos;inférence : {modelMeta.provider}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-muted text-foreground border border-border">
              <Clock className="h-3.5 w-3.5 text-primary animate-spin" />
              <span>{elapsedSeconds}s</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelAnalysis}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Annuler
            </Button>
          </div>
        </div>

        {/* Dynamic Step Visualization */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          {/* Phase 1: Initialisation */}
          <div className={`p-2.5 rounded-lg border flex items-center gap-2 transition-all ${
            status === 'initializing'
              ? 'border-primary/50 bg-primary/10 text-primary font-medium'
              : 'border-border/40 bg-muted/30 text-muted-foreground'
          }`}>
            {status === 'initializing' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            )}
            <span>1. Initialisation</span>
          </div>

          {/* Phase 2: Collecte Web */}
          <div className={`p-2.5 rounded-lg border flex items-center gap-2 transition-all ${
            status === 'fetching'
              ? 'border-primary/50 bg-primary/10 text-primary font-medium'
              : status === 'analyzing'
              ? 'border-border/40 bg-muted/30 text-muted-foreground'
              : 'border-border/40 bg-muted/20 text-muted-foreground/60'
          }`}>
            {status === 'fetching' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            ) : status === 'analyzing' ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Globe className="h-3.5 w-3.5" />
            )}
            <span>2. Recherche Web live</span>
          </div>

          {/* Phase 3: Analyse & Scoring */}
          <div className={`p-2.5 rounded-lg border flex items-center gap-2 transition-all ${
            status === 'analyzing'
              ? 'border-primary/50 bg-primary/10 text-primary font-medium'
              : 'border-border/40 bg-muted/20 text-muted-foreground/60'
          }`}>
            {status === 'analyzing' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            <span>3. Analyse & Scoring</span>
          </div>
        </div>

        {/* Live Step Message & Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground/90 font-medium truncate max-w-[85%]">
              {stepMessage || "Traitement de votre requête en cours..."}
            </span>
            <span className="text-muted-foreground font-mono">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2 rounded-full" />
        </div>

        {/* Helpful reassurance message if taking more than 8 seconds */}
        {elapsedSeconds > 8 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Le modèle formule son raisonnement approfondi pour structurer les critères. La réponse arrive d&apos;un instant à l&apos;autre.
            </span>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
