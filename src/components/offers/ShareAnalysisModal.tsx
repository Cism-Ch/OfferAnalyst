'use client';

/**
 * ShareAnalysisModal Component
 * 
 * Provides a fluid modal to generate and copy a public, read-only share link
 * for an analysis result. Conforms to the OfferAnalyst design system & bilingual tokens.
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Check, Loader2, Globe, ShieldCheck } from 'lucide-react';
import { AnalysisResponse } from '@/types';
import { createShareLinkAction } from '@/server/share';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/toast';

interface ShareAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AnalysisResponse | null;
  domain?: string;
  criteria?: string;
  model?: string;
}

export function ShareAnalysisModal({
  isOpen,
  onClose,
  analysis,
  domain = 'Analysis',
  criteria,
  model,
}: ShareAnalysisModalProps) {
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setShareUrl('');
    setError(null);
    setCopied(false);
    onClose();
  };

  // Generate share link when opened
  useEffect(() => {
    let isSubscribed = true;

    async function generateLink() {
      if (!isOpen || !analysis || shareUrl) return;

      setLoading(true);
      setError(null);

      try {
        const res = await createShareLinkAction({
          domain,
          criteria: criteria || null,
          model: model || analysis.modelUsed || null,
          analysis,
          ttlDays: 30,
        });

        if (!isSubscribed) return;

        if (res.success) {
          const origin = typeof window !== 'undefined' ? window.location.origin : '';
          setShareUrl(`${origin}${res.data.shareUrl}`);
        } else {
          setError(res.error || t.export.errorShare);
        }
      } catch (err) {
        if (!isSubscribed) return;
        const msg = err instanceof Error ? err.message : t.export.errorShare;
        setError(msg);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }

    if (isOpen && !shareUrl) {
      generateLink();
    }

    return () => {
      isSubscribed = false;
    };
  }, [isOpen, analysis, domain, criteria, model, shareUrl, t.export.errorShare]);

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(t.export.linkCopied, shareUrl);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error(isEn ? 'Error' : 'Erreur', isEn ? 'Unable to copy to clipboard.' : 'Impossible de copier dans le presse-papier.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md p-6 bg-card border-border shadow-xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2.5 text-primary">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Share2 className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              {t.export.shareTitle}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            {t.export.shareSubtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground">{t.export.shareLinkPlaceholder}</p>
            </div>
          ) : error ? (
            <div className="p-3 text-xs text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
              {error}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={shareUrl}
                  className="font-mono text-xs bg-muted/50 border-border select-all"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button
                  onClick={handleCopy}
                  size="sm"
                  className="shrink-0 gap-1.5 font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>{t.export.linkCopied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>{t.export.copyLink}</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Guarantees */}
              <div className="rounded-lg bg-muted/40 border border-border/60 p-3 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>{t.export.publicViewBadge}</span>
                </div>
                <p className="pl-5 leading-relaxed">
                  {t.export.expirationNotice}
                </p>
                <div className="flex items-center gap-1.5 pl-5 pt-1 text-[11px] text-muted-foreground/80">
                  <Globe className="h-3.5 w-3.5 shrink-0" />
                  <span>{t.export.sharedByNotice}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
