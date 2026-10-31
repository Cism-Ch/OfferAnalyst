'use client';

/**
 * SharedViewToolbar Component
 * 
 * Interactive client toolbar for the public shared analysis page:
 * - Direct download of PDF report via API
 * - Direct download of CSV data via API
 * - 1-click URL copy with visual feedback
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, FileSpreadsheet, Share2, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface SharedViewToolbarProps {
  shareToken: string;
  domain: string;
}

export function SharedViewToolbar({ shareToken, domain }: SharedViewToolbarProps) {
  const { t, language } = useLanguage();
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const isEn = language === 'en';
  const safeDomain = (domain || 'analysis').toLowerCase().replace(/[^a-z0-9]/g, '-') || 'analysis';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success(t.export.linkCopied, window.location.href);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error(isEn ? 'Error' : 'Erreur', isEn ? 'Failed to copy link.' : 'Impossible de copier le lien.');
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 px-4 rounded-xl bg-card border border-border/80 shadow-2xs">
      <div className="flex flex-wrap items-center gap-2">
        {/* PDF Download Button */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs gap-1.5 rounded-lg border-border/80 text-foreground hover:bg-accent"
          asChild
        >
          <a
            href={`/api/export?token=${encodeURIComponent(shareToken)}&format=pdf&lang=${language}`}
            download={`offeranalyst-${safeDomain}-report.pdf`}
          >
            <FileText className="h-3.5 w-3.5 text-rose-500" />
            <span>{t.export.exportPdf}</span>
          </a>
        </Button>

        {/* CSV Export Button */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs gap-1.5 rounded-lg border-border/80 text-foreground hover:bg-accent"
          asChild
        >
          <a
            href={`/api/export?token=${encodeURIComponent(shareToken)}&format=csv&lang=${language}`}
            download={`offeranalyst-${safeDomain}-data.csv`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
            <span>{t.export.exportCsv}</span>
          </a>
        </Button>

        {/* Copy Share Link Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="h-8 px-3 text-xs gap-1.5 rounded-lg border-primary/30 text-primary hover:bg-primary/10"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
          <span>{copied ? t.export.linkCopied : t.export.share}</span>
        </Button>
      </div>

      {/* CTA to run your own analysis */}
      <Button
        size="sm"
        className="h-8 px-3 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
        asChild
      >
        <Link href="/">
          <span>{t.export.runYourOwnAnalysis}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  );
}
