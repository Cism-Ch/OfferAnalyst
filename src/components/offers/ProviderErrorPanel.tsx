"use client";

import { AlertCircle, RotateCcw, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProviderErrorState } from "@/types";
import { getModelOption } from "@/lib/ai-models";

interface ProviderErrorPanelProps {
  error: ProviderErrorState | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  activeModelId: string;
}

export function ProviderErrorPanel({
  error,
  onDismiss,
  onRetry,
  activeModelId,
}: ProviderErrorPanelProps) {
  if (!error) {
    return null;
  }

  const model = getModelOption(error.model ?? activeModelId);
  const occurredAt = new Date(error.timestamp);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden border-red-500/20 bg-red-500/5 backdrop-blur-md">
        {/* Decorative background glow */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-500/10 blur-3xl" />

        <CardHeader className="p-6 pb-2">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-red-500/20 p-3 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-bold tracking-tight text-red-500">
                    Intelligence Pipeline Interrupted
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="border-red-500/30 px-2 text-[10px] font-bold uppercase tracking-widest text-red-500"
                  >
                    {error.code}
                  </Badge>
                </div>
                <p className="mt-1 text-[10px] text-sm font-medium uppercase tracking-wider text-red-500/70">
                  Phase:{" "}
                  {error.phase === "fetch"
                    ? "Autonomous Data Collection"
                    : "Neural Analysis Mapping"}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="h-10 gap-2 rounded-xl border-red-500/30 px-4 text-xs font-bold text-red-500 transition-all hover:border-red-500 hover:bg-red-500/10"
                >
                  <RotateCcw className="h-4 w-4" />
                  INITIATE RE-SYNCHRONIZATION
                </Button>
              )}
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDismiss}
                  className="h-10 w-10 rounded-xl text-red-500/50 transition-colors hover:bg-red-500/10 hover:text-red-500"
                  title="Dismiss"
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <div className="mt-4 rounded-xl border border-red-500/10 bg-red-500/10 p-4">
            <p className="text-sm font-medium leading-relaxed text-red-200/80">
              {error.message}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-red-500/40">
            <div className="flex items-center gap-1.5">
              <span className="opacity-50">Target Model:</span>
              <span>{model.label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="opacity-50">Context Interface:</span>
              <span>{error.context ?? "OpenRouter Grid"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="opacity-50">Incident Log:</span>
              <span>{occurredAt.toLocaleTimeString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
