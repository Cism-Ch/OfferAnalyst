'use client';

/**
 * Premium Theme Selector
 * 
 * Enhanced theme selector with all premium themes
 * Includes visual previews and smooth transitions
 */

import * as React from 'react';
import { Check, Palette } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
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

interface Theme {
  name: string;
  value: string;
  description: string;
  gradient: string;
}

const themes: Theme[] = [
  {
    name: 'Light',
    value: 'light',
    description: 'Clean and minimal',
    gradient: 'bg-gradient-to-br from-white to-gray-100',
  },
  {
    name: 'Dark',
    value: 'dark',
    description: 'Easy on the eyes',
    gradient: 'bg-gradient-to-br from-gray-900 to-black',
  },
  {
    name: 'Gold Luxury',
    value: 'gold',
    description: 'Premium and elegant',
    gradient: 'gradient-gold',
  },
  {
    name: 'Ocean Blue',
    value: 'ocean',
    description: 'Calm and focused',
    gradient: 'gradient-ocean',
  },
  {
    name: 'Forest Green',
    value: 'forest',
    description: 'Natural and eco-friendly',
    gradient: 'gradient-forest',
  },
  {
    name: 'Neon Dark',
    value: 'neon',
    description: 'Vibrant and modern',
    gradient: 'gradient-neon',
  },
  {
    name: 'Silver',
    value: 'silver',
    description: 'Sophisticated and sleek',
    gradient: 'gradient-silver',
  },
  {
    name: 'System',
    value: 'system',
    description: 'Follow system preference',
    gradient: 'bg-gradient-to-br from-gray-300 to-gray-600',
  },
];

export function PremiumThemeSelector() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon">
        <Palette className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Select theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Select theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Theme Selector</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <AnimatePresence>
          {themes.map((themeOption, index) => (
            <motion.div
              key={themeOption.value}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <DropdownMenuItem
                onClick={() => {
                  setTheme(themeOption.value);
                  setOpen(false);
                }}
                className="cursor-pointer"
              >
                <div className="flex w-full items-center gap-3">
                  {/* Theme preview */}
                  <div
                    className={cn(
                      'h-6 w-6 rounded-md border',
                      themeOption.gradient
                    )}
                  />
                  
                  {/* Theme info */}
                  <div className="flex-1">
                    <div className="font-medium">{themeOption.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {themeOption.description}
                    </div>
                  </div>

                  {/* Check mark */}
                  {theme === themeOption.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                      <Check className="h-4 w-4" />
                    </motion.div>
                  )}
                </div>
              </DropdownMenuItem>
            </motion.div>
          ))}
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
