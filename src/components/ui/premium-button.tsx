'use client';

/**
 * Premium Button Component
 * 
 * Enhanced button with Framer Motion animations and premium styling
 * Extends the base shadcn/ui button with luxury interactions
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { buttonGlowVariants, scaleOnHoverProps } from '@/lib/motion';
import { cn } from '@/lib/utils';

// Infer button props from the component
type ButtonProps = React.ComponentProps<typeof Button>;

interface PremiumButtonProps extends ButtonProps {
  /**
   * Enable glow effect on hover
   */
  glow?: boolean;
  /**
   * Animation variant
   */
  animation?: 'scale' | 'glow' | 'lift' | 'none';
  /**
   * Premium variant (adds gradient backgrounds)
   */
  premiumVariant?: 'gold' | 'ocean' | 'forest' | 'neon' | 'silver';
}

export const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      className,
      children,
      glow = false,
      animation = 'scale',
      premiumVariant,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    // Get animation props based on variant
    const getAnimationProps = () => {
      switch (animation) {
        case 'scale':
          return scaleOnHoverProps;
        case 'glow':
          return {
            ...scaleOnHoverProps,
            variants: buttonGlowVariants,
            initial: 'initial',
            whileHover: 'hover',
          };
        case 'lift':
          return {
            whileHover: { y: -2 },
            whileTap: { scale: 0.98 },
          };
        case 'none':
          return {};
        default:
          return scaleOnHoverProps;
      }
    };

    // Get premium styling classes
    const getPremiumClasses = () => {
      if (!premiumVariant) return '';

      const baseClasses = 'font-semibold transition-all duration-600 ease-[cubic-bezier(0.25,0.1,0.25,1)]';
      
      switch (premiumVariant) {
        case 'gold':
          return cn(baseClasses, 'gradient-gold text-white', glow && 'glow-gold');
        case 'ocean':
          return cn(baseClasses, 'gradient-ocean text-white', glow && 'glow-ocean');
        case 'forest':
          return cn(baseClasses, 'gradient-forest text-white', glow && 'glow-forest');
        case 'neon':
          return cn(baseClasses, 'gradient-neon text-white', glow && 'glow-neon');
        case 'silver':
          return cn(baseClasses, 'gradient-silver text-white');
        default:
          return baseClasses;
      }
    };

    const buttonClasses = cn(getPremiumClasses(), className);
    const animProps = animation !== 'none' ? getAnimationProps() : {};

    return (
      <motion.div {...animProps} className="inline-block">
        <Button
          ref={ref}
          variant={premiumVariant ? 'default' : variant}
          className={buttonClasses}
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    );
  }
);

PremiumButton.displayName = 'PremiumButton';
