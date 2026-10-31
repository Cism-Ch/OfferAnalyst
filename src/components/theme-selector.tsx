'use client';

/**
 * Premium Theme Selector (2026 High-Legibility Edition)
 * 
 * Features:
 * - High-contrast circular theme previews with perfectly paired icons (black on light, white on dark)
 * - Harmonized trigger button with active theme circle and icon
 * - Organized in Signature Luxury Palettes & Core Standards
 * - Accessible, smooth Framer Motion micro-interactions
 */

import * as React from 'react';
import { 
  Check, 
  Sparkles, 
  Sun, 
  Moon, 
  Waves, 
  TreePine, 
  Zap, 
  Shield, 
  Laptop,
  ChevronDown 
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface ThemeOption {
  name: string;
  value: string;
  description: string;
  circleBg: string;
  borderColor: string;
  iconColor: 'text-white' | 'text-slate-900';
  icon: React.ComponentType<{ className?: string }>;
  category: 'signature' | 'core';
}

export const THEME_OPTIONS: ThemeOption[] = [
  // Signature Luxury & Tech Themes
  {
    name: 'Gold Luxury',
    value: 'gold',
    description: 'Or impérial ambré & prestige doré',
    circleBg: 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700',
    borderColor: 'border-amber-300/50',
    iconColor: 'text-white',
    icon: Sparkles,
    category: 'signature',
  },
  {
    name: 'Neon Cyber',
    value: 'neon',
    description: 'Violet néon & fuchsia cyberpunk',
    circleBg: 'bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-600',
    borderColor: 'border-purple-300/50',
    iconColor: 'text-white',
    icon: Zap,
    category: 'signature',
  },
  {
    name: 'Ocean Saphir',
    value: 'ocean',
    description: 'Bleu cobalt immersif & reflets marins',
    circleBg: 'bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-800',
    borderColor: 'border-blue-300/50',
    iconColor: 'text-white',
    icon: Waves,
    category: 'signature',
  },
  {
    name: 'Forest Opal',
    value: 'forest',
    description: 'Vert émeraude organique & teintes boisées',
    circleBg: 'bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-800',
    borderColor: 'border-emerald-300/50',
    iconColor: 'text-white',
    icon: TreePine,
    category: 'signature',
  },
  {
    name: 'Silver Titanium',
    value: 'silver',
    description: 'Platine métallisé & ardoise pure',
    circleBg: 'bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300',
    borderColor: 'border-slate-400/60 shadow-xs',
    iconColor: 'text-slate-900',
    icon: Shield,
    category: 'signature',
  },
  // Core Standard Themes
  {
    name: 'Clair Moderne',
    value: 'light',
    description: 'Clarté maximale & haute lisibilité',
    circleBg: 'bg-gradient-to-br from-white to-slate-100',
    borderColor: 'border-slate-300 shadow-xs',
    iconColor: 'text-slate-900',
    icon: Sun,
    category: 'core',
  },
  {
    name: 'Sombre Studio',
    value: 'dark',
    description: 'Noir d’encre reposant & contrastes doux',
    circleBg: 'bg-gradient-to-br from-neutral-800 via-zinc-900 to-black',
    borderColor: 'border-neutral-700/80',
    iconColor: 'text-white',
    icon: Moon,
    category: 'core',
  },
  {
    name: 'Système',
    value: 'system',
    description: 'Synchronisé avec les préférences OS',
    circleBg: 'bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800',
    borderColor: 'border-slate-600/80',
    iconColor: 'text-white',
    icon: Laptop,
    category: 'core',
  },
];

const emptySubscribe = () => () => {};

export function PremiumThemeSelector() {
  const { setTheme, theme } = useTheme();
  const mounted = React.useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [open, setOpen] = React.useState(false);

  // Active theme helper
  const activeTheme = React.useMemo(() => {
    return THEME_OPTIONS.find((t) => t.value === theme) || THEME_OPTIONS[0];
  }, [theme]);

  if (!mounted) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="min-h-[44px] min-w-[44px] h-11 md:h-9 md:min-h-0 md:min-w-0 px-2.5 rounded-xl border-border/60 bg-background/50 backdrop-blur-md touch-manipulation"
      >
        <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
      </Button>
    );
  }

  const ActiveIcon = activeTheme.icon;
  const signatureThemes = THEME_OPTIONS.filter((t) => t.category === 'signature');
  const coreThemes = THEME_OPTIONS.filter((t) => t.category === 'core');

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={cn(
            "group relative min-h-[44px] min-w-[44px] h-11 md:h-9 md:min-h-0 md:min-w-0 px-2 sm:px-2.5 gap-2 rounded-xl transition-all duration-200 touch-manipulation",
            "border-border/60 bg-background/70 hover:bg-accent/40 backdrop-blur-md shadow-xs",
            "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1"
          )}
          aria-label={`Thème actif : ${activeTheme.name}`}
        >
          {/* Active theme miniature circle with contrasting icon */}
          <div 
            className={cn(
              "h-5 w-5 rounded-full flex items-center justify-center shrink-0 border shadow-xs transition-transform group-hover:scale-105",
              activeTheme.circleBg,
              activeTheme.borderColor
            )}
          >
            <ActiveIcon className={cn("h-3 w-3 stroke-[2.5]", activeTheme.iconColor)} />
          </div>

          <span className="text-xs font-semibold tracking-wide hidden lg:inline text-foreground/90">
            {activeTheme.name}
          </span>

          <ChevronDown className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
            open && "rotate-180 text-foreground"
          )} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        sideOffset={8}
        className="w-80 p-2.5 rounded-2xl border-border/60 bg-popover/95 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
      >
        {/* Header Signature */}
        <div className="px-2 py-1.5 flex items-center justify-between">
          <DropdownMenuLabel className="p-0 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Palettes Signatures
          </DropdownMenuLabel>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            5 Styles
          </span>
        </div>

        {/* Signature themes list */}
        <div className="space-y-1 mt-1">
          {signatureThemes.map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.value;
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => {
                  setTheme(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "cursor-pointer rounded-xl px-2.5 py-2 transition-all flex items-center gap-3",
                  isSelected 
                    ? "bg-primary/10 text-primary font-medium border border-primary/25 shadow-xs" 
                    : "hover:bg-accent/60 text-foreground/90"
                )}
              >
                {/* Beautiful circular representation containing the high-contrast icon */}
                <div 
                  className={cn(
                    "relative h-9 w-9 rounded-full flex items-center justify-center shrink-0 border shadow-sm transition-transform",
                    option.circleBg,
                    option.borderColor,
                    isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-popover"
                  )}
                >
                  <Icon className={cn("h-4 w-4 stroke-[2.5]", option.iconColor)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold truncate leading-tight">
                      {option.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                    {option.description}
                  </p>
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                    className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-xs"
                  >
                    <Check className="h-3 w-3 stroke-[3]" />
                  </motion.div>
                )}
              </DropdownMenuItem>
            );
          })}
        </div>

        <DropdownMenuSeparator className="my-2 bg-border/60" />

        {/* Header Core */}
        <div className="px-2 py-1 flex items-center justify-between">
          <DropdownMenuLabel className="p-0 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Essentiels & Système
          </DropdownMenuLabel>
        </div>

        {/* Core themes list */}
        <div className="space-y-1 mt-1">
          {coreThemes.map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.value;
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => {
                  setTheme(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "cursor-pointer rounded-xl px-2.5 py-2 transition-all flex items-center gap-3",
                  isSelected 
                    ? "bg-primary/10 text-primary font-medium border border-primary/25 shadow-xs" 
                    : "hover:bg-accent/60 text-foreground/90"
                )}
              >
                {/* Beautiful circular representation containing the high-contrast icon */}
                <div 
                  className={cn(
                    "relative h-9 w-9 rounded-full flex items-center justify-center shrink-0 border shadow-sm transition-transform",
                    option.circleBg,
                    option.borderColor,
                    isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-popover"
                  )}
                >
                  <Icon className={cn("h-4 w-4 stroke-[2.5]", option.iconColor)} />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold truncate block leading-tight">
                    {option.name}
                  </span>
                  <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                    {option.description}
                  </p>
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                    className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-xs"
                  >
                    <Check className="h-3 w-3 stroke-[3]" />
                  </motion.div>
                )}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
