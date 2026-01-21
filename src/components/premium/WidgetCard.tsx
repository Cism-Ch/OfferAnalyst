"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { fadeInUp, smoothEase } from "@/lib/animations";

interface WidgetCardProps extends React.ComponentProps<typeof Card> {
  /** Enable neon border on hover */
  neonHover?: boolean;
  /** Enable permanent neon effect */
  neonEffect?: boolean;
  /** Enable glassmorphism effect */
  glass?: boolean;
  /** Animation delay in seconds */
  delay?: number;
  /** Custom animation variants */
  variants?: Variants;
}

/**
 * Premium WidgetCard Component
 *
 * A card component with built-in Framer Motion animations, optional glassmorphism,
 * and neon highlight effects. Provides a consistent animated card experience
 * across the application.
 *
 * @example
 * ```tsx
 * <WidgetCard glass neonHover delay={0.2}>
 *   <CardHeader>...</CardHeader>
 * </WidgetCard>
 * ```
 */
export function WidgetCard({
  className,
  neonHover = false,
  neonEffect = false,
  glass = true,
  delay = 0,
  variants = fadeInUp,
  children,
  ...props
}: WidgetCardProps) {
  const showNeon = neonHover || neonEffect;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{
        duration: 0.5,
        delay,
        ease: smoothEase,
      }}
      className="h-full"
    >
      <Card
        className={cn(
          "relative h-full overflow-hidden transition-all duration-300",
          glass &&
            "backdrop-blur-sm bg-card/95 dark:bg-card/80 border-border/50",
          showNeon &&
            "hover:border-neon/50 hover:shadow-[0_0_15px_rgba(212,255,0,0.2)]",
          neonEffect && "border-neon/30 shadow-[0_0_10px_rgba(212,255,0,0.1)]",
          className,
        )}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  );
}
