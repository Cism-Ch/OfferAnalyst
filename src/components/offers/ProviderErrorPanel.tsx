'use client';

import { AlertCircle, RotateCcw, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProviderErrorState } from '@/types';
import { getModelOption } from '@/lib/ai-models';

interface ProviderErrorPanelProps {
  error: ProviderErrorState | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  activeModelId: string;
}

export function ProviderErrorPanel({ error, onDismiss, onRetry, activeModelId }: ProviderErrorPanelProps) {
  if (!error) {
    return null;
  }

  const model = getModelOption(error.model ?? activeModelId);
  const occurredAt = new Date(error.timestamp);

  return (
    <Card className="border-red-300 bg-red-50/80 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-50">
      <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <CardTitle className="text-base">Erreur du provider OpenRouter</CardTitle>
            <p className="text-xs text-red-800/80 dark:text-red-100/80">
              Phase: {error.phase === 'fetch' ? 'Collecte des offres' : 'Analyse des offres'}
            </p>
          </div>
        </div>
        <Badge variant="destructive" className="uppercase tracking-wide">
          {error.code}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed">{error.message}</p>
        <div className="flex flex-wrap gap-4 text-xs text-red-900/80 dark:text-red-100/80">
          <span>Modèle: {model.label}</span>
          <span>Contexte: {error.context ?? 'OpenRouter'}</span>
          <span>Horodatage: {occurredAt.toLocaleTimeString()}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {onRetry && (
            <Button size="sm" onClick={onRetry} className="gap-2">
              <RotateCcw className="h-3.5 w-3.5" />
              Réessayer avec ce modèle
            </Button>
          )}
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss} className="gap-2 text-red-900 hover:text-red-900 dark:text-red-100">
              <XCircle className="h-3.5 w-3.5" />
              Masquer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
