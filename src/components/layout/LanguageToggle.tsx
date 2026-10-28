'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageToggleProps {
  className?: string;
  variant?: 'pill' | 'button' | 'compact';
}

/**
 * LanguageToggle Component
 * Allows seamless 1-click toggling between French and English with instant persistence.
 */
export function LanguageToggle({ className, variant = 'pill' }: LanguageToggleProps) {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();

  if (variant === 'button') {
    return (
      <button
        onClick={toggleLanguage}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/80 bg-background/80 hover:bg-muted text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
        title={t.nav.toggleLang}
        aria-label={t.nav.toggleLang}
      >
        <Globe className="h-3.5 w-3.5 text-primary" />
        <span className="font-semibold uppercase tracking-wider">{language}</span>
      </button>
    );
  }

  // Segmented Pill [ FR | EN ]
  return (
    <div
      role="radiogroup"
      aria-label={t.nav.language}
      className={cn(
        "inline-flex items-center p-0.5 rounded-lg border border-border/70 bg-muted/50 backdrop-blur-xs select-none",
        className
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={language === 'fr'}
        onClick={() => setLanguage('fr')}
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-150",
          language === 'fr'
            ? "bg-background text-foreground font-semibold shadow-xs border border-border/50"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <span className="text-[11px] leading-none">🇫🇷</span>
        <span className="leading-none">FR</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={language === 'en'}
        onClick={() => setLanguage('en')}
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-150",
          language === 'en'
            ? "bg-background text-foreground font-semibold shadow-xs border border-border/50"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <span className="text-[11px] leading-none">🇬🇧</span>
        <span className="leading-none">EN</span>
      </button>
    </div>
  );
}
