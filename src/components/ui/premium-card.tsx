'use client';

/**
 * Premium Card Component
 * 
 * Enhanced card with Framer Motion animations and premium styling
 * Extends the base shadcn/ui card with luxury interactions
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cardVariants } from '@/lib/motion';
import { cn } from '@/lib/utils';

// Infer card props from the component
type CardProps = React.ComponentProps<typeof Card>;

interface PremiumCardProps extends CardProps {
  /**
   * Enable hover lift animation
   */
  hoverLift?: boolean;
  /**
   * Enable glass morphism effect
   */
  glass?: boolean;
  /**
   * Dark glass effect (for light backgrounds)
   */
  glassDark?: boolean;
  /**
   * Enable animated gradient border
   */
  gradientBorder?: boolean;
  /**
   * Animation variant
   */
  animation?: 'fade' | 'lift' | 'none';
  /**
   * Delay for staggered animations
   */
  delay?: number;
}

export const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  (
    {
      className,
      children,
      hoverLift = true,
      glass = false,
      glassDark = false,
      gradientBorder = false,
      animation = 'fade',
      delay = 0,
      ...props
    },
    ref
  ) => {
    // Get animation props based on variant
    const getMotionProps = () => {
      if (animation === 'none') return {};
      
      switch (animation) {
        case 'fade':
          return {
            variants: cardVariants,
            initial: 'initial' as const,
            animate: 'animate' as const,
            whileHover: hoverLift ? 'hover' as const : undefined,
            whileTap: hoverLift ? 'tap' as const : undefined,
            transition: { delay },
          };
        case 'lift':
          return {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0, transition: { delay } },
            whileHover: hoverLift ? { y: -4 } : undefined,
          };
        default:
          return {
            initial: { opacity: 0 },
            animate: { opacity: 1, transition: { delay } },
          };
      }
    };

    // Build className
    const cardClasses = cn(
      'transition-all duration-300 ease-in-out',
      glass && 'glass',
      glassDark && 'glass-dark',
      gradientBorder && 'border-2 border-transparent bg-gradient-to-br from-primary/20 to-accent/20',
      className
    );

    if (animation === 'none') {
      return (
        <Card ref={ref} className={cardClasses} {...props}>
          {children}
        </Card>
      );
    }

    return (
      <motion.div {...getMotionProps()} style={{ display: 'contents' }}>
        <Card ref={ref} className={cardClasses} {...props}>
          {children}
        </Card>
      </motion.div>
    );
  }
);

PremiumCard.displayName = 'PremiumCard';

/**
 * Premium Card with gradient background
 */
interface GradientCardProps extends PremiumCardProps {
  gradient?: 'gold' | 'ocean' | 'forest' | 'neon' | 'silver' | 'luxury';
  animated?: boolean;
}

export const GradientCard = React.forwardRef<HTMLDivElement, GradientCardProps>(
  ({ className, gradient = 'gold', animated = false, children, ...props }, ref) => {
    const gradientClasses = cn(
      'text-white',
      {
        'gradient-gold': gradient === 'gold',
        'gradient-ocean': gradient === 'ocean',
        'gradient-forest': gradient === 'forest',
        'gradient-neon': gradient === 'neon',
        'gradient-silver': gradient === 'silver',
        'gradient-luxury': gradient === 'luxury',
      },
      animated && 'gradient-animated',
      className
    );

    return (
      <PremiumCard ref={ref} className={gradientClasses} {...props}>
        {children}
      </PremiumCard>
    );
  }
);

GradientCard.displayName = 'GradientCard';
