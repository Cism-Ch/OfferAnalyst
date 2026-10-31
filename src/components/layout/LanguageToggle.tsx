'use client';

/**
 * LanguageToggle Component
 * Allows seamless 1-click toggling between French and English with instant persistence.
 * Strict adherence to zero-emoji design rules: uses Lucide vector icons and typography badges.
 */

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageToggleProps {
  className?: string;
  variant?: 'pill' | 'button' | 'compact';
}

export function LanguageToggle({ className, variant = 'pill' }: LanguageToggleProps) {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();

  if (variant === 'button') {
    return (
      <button
        onClick={toggleLanguage}
        className={cn(
          "inline-flex items-center justify-center min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/80 bg-background/80 hover:bg-muted text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation",
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

  // Segmented Pill [ FR | EN ] with responsive compact toggle
  return (
    <>
      {/* Mobile & Tablet compact toggle button (< lg) */}
      <button
        type="button"
        onClick={toggleLanguage}
        className={cn(
          "group inline-flex lg:hidden items-center justify-center min-h-[44px] min-w-[44px] md:min-h-9 md:min-w-9 gap-1.5 px-2.5 py-1.5 rounded-full sm:rounded-xl border border-border/60 bg-background/70 backdrop-blur-md text-xs font-semibold select-none touch-manipulation hover:bg-accent/40 active:scale-95 shadow-xs transition-all",
          className
        )}
        title={t.nav.toggleLang}
        aria-label={t.nav.toggleLang}
      >
        <Globe className="h-3.5 w-3.5 text-primary shrink-0 transition-transform duration-200 group-hover:rotate-12" />
        <span className="leading-none text-[11px] font-bold uppercase tracking-wider text-foreground/90">{language}</span>
      </button>

      {/* Desktop segmented pill (lg+) */}
      <div
        role="radiogroup"
        aria-label={t.nav.language}
        className={cn(
          "hidden lg:inline-flex items-center p-0.5 rounded-lg border border-border/70 bg-muted/50 backdrop-blur-xs select-none",
          className
        )}
      >
        <button
          type="button"
          role="radio"
          aria-checked={language === 'fr'}
          onClick={() => setLanguage('fr')}
          className={cn(
            "flex items-center justify-center min-h-7 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150 touch-manipulation",
            language === 'fr'
              ? "bg-background text-foreground font-semibold shadow-xs border border-border/50 text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="leading-none font-bold">FR</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={language === 'en'}
          onClick={() => setLanguage('en')}
          className={cn(
            "flex items-center justify-center min-h-7 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150 touch-manipulation",
            language === 'en'
              ? "bg-background text-foreground font-semibold shadow-xs border border-border/50 text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="leading-none font-bold">EN</span>
        </button>
      </div>
    </>
  );
}
