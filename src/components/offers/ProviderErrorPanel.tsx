'use client';

/**
 * ProviderErrorPanel Component
 * 
 * Intelligent error signaling & diagnostic panel for AI inference failures.
 * Provides root-cause clarity, model state analysis, and direct 1-click remedies:
 * - 401 Unauthorized -> Direct API Key Configuration
 * - 402 Insufficient Credits -> 1-click fallback to Free Tier (Gemini 3.5 Flash Lite)
 * - 429 Rate Limit / 503 Overloaded -> Fast model switch or exponential retry
 * - Timeout -> One-click retry
 */

import React from 'react';
import Link from 'next/link';
import { 
  AlertCircle, 
  RotateCcw, 
  XCircle, 
  Key, 
  Zap, 
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProviderErrorState } from '@/types';
import { getModelOption } from '@/lib/ai-models';
import { useAnalysis } from '@/contexts/AnalysisContext';

interface ProviderErrorPanelProps {
  error?: ProviderErrorState | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  onSwitchModel?: (modelId: string) => void;
  activeModelId?: string;
}

export function ProviderErrorPanel({ 
  error: propError, 
  onDismiss: propDismiss, 
  onRetry: propRetry,
  onSwitchModel: propSwitchModel,
  activeModelId: propModelId 
}: ProviderErrorPanelProps) {
  const analysisContext = useAnalysis();

  const error = propError ?? analysisContext.providerError;
  const onDismiss = propDismiss ?? analysisContext.clearError;
  const onRetry = propRetry ?? analysisContext.retryAnalysis;
  const onSwitchModel = propSwitchModel ?? analysisContext.switchModelAndRetry;
  const activeModelId = propModelId ?? analysisContext.model;

  if (!error) {
    return null;
  }

  const model = getModelOption(error.model ?? activeModelId);
  const occurredAt = new Date(error.timestamp);

  // Diagnostic contextual details based on error code
  const isKeyError = error.code === 'API_KEY_INVALID' || error.code === 'API_KEY_MISSING' || error.code === 'API_KEY_EXPIRED';
  const isCreditError = error.code === 'INSUFFICIENT_CREDITS';
  const isRateLimit = error.code === 'RATE_LIMITED';
  const isOverloaded = error.code === 'MODEL_OVERLOADED';
  const isTimeout = error.code === 'TIMEOUT';

  let title = "Anomalie lors de l'inférence IA";
  if (isKeyError) title = "Clé d'accès API requise ou invalide";
  else if (isCreditError) title = "Solde de crédits OpenRouter insuffisant";
  else if (isRateLimit) title = "Cadence de requêtes dépassée (Rate Limit)";
  else if (isOverloaded) title = "Moteur IA temporairement surchargé";
  else if (isTimeout) title = "Délai d'attente réseau dépassé";

  return (
    <Card className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 shadow-xl overflow-hidden transition-all">
      <CardHeader className="pb-3 border-b border-destructive/15 bg-destructive/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-destructive/15 text-destructive shrink-0 mt-0.5">
            {isKeyError ? <Key className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              {title}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Étape concernée : <span className="font-semibold text-foreground/80">{error.phase === 'fetch' ? 'Collecte & Recherche d\'offres' : 'Analyse sémantique & Notation'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Badge variant="destructive" className="font-mono text-[11px] px-2.5 py-0.5 uppercase tracking-wide">
            {error.code}
          </Badge>
          {error.httpStatus && (
            <Badge variant="outline" className="font-mono text-[11px] border-destructive/40 text-destructive">
              HTTP {error.httpStatus}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Cause & Explanation */}
        <div className="space-y-1.5">
          <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Explication de la situation :
          </h5>
          <p className="text-sm font-medium text-foreground/90 leading-relaxed bg-background/60 p-3 rounded-xl border border-border/60">
            {error.message}
          </p>
        </div>

        {/* Model State & Diagnostics metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
            <span className="text-muted-foreground block text-[11px]">Modèle sollicité</span>
            <span className="font-semibold text-foreground truncate block">{model.label}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
            <span className="text-muted-foreground block text-[11px]">Fournisseur</span>
            <span className="font-semibold text-foreground truncate block">{model.provider}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
            <span className="text-muted-foreground block text-[11px]">Horodatage incident</span>
            <span className="font-mono text-foreground block">{occurredAt.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Actionable Remedies (1-Click Solutions) */}
        <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* If Key Error -> Direct add key button */}
            {isKeyError && (
              <Button asChild size="sm" className="gap-2 bg-primary text-primary-foreground shadow-sm">
                <Link href={`/dashboard/api-keys?action=add&provider=openrouter&model=${encodeURIComponent(model.id)}`}>
                  <Key className="h-4 w-4" />
                  Ajouter ma clé API
                  <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </Link>
              </Button>
            )}

            {/* If Credit or Overload Error -> Switch to Free Tier */}
            {(isCreditError || isOverloaded) && (
              <Button
                size="sm"
                onClick={() => onSwitchModel('google/gemini-3.5-flash-lite')}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                <Zap className="h-4 w-4" />
                Basculer sur Gemini 3.5 Flash Lite (Inclus & Gratuit)
              </Button>
            )}

            {/* If Overloaded or Rate Limited -> Alternative NVIDIA Nemotron */}
            {(isOverloaded || isRateLimit) && model.id !== 'nvidia/nemotron-3.5-lightning:free' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSwitchModel('nvidia/nemotron-3.5-lightning:free')}
                className="gap-2 border-border/80"
              >
                <Zap className="h-4 w-4 text-emerald-500" />
                Essayer NVIDIA Nemotron 3.5
              </Button>
            )}

            {/* General Retry Button */}
            <Button
              variant={isKeyError || isCreditError ? "outline" : "default"}
              size="sm"
              onClick={() => onRetry()}
              className="gap-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Réessayer l&apos;analyse
            </Button>
          </div>

          {/* Dismiss Button */}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Masquer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
