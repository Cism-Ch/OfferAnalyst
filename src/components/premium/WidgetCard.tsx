"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface WidgetCardProps extends React.ComponentProps<typeof Card> {
  neonHover?: boolean;
  neonEffect?: boolean;
  glass?: boolean;
  delay?: number;
}

/**
 * Premium WidgetCard.
 * Incorporates Framer Motion animations, glassmorphism, and neon highlights.
 */
export function WidgetCard({
  className,
  neonHover = false,
  neonEffect = false,
  glass = true,
  delay = 0,
  children,
  ...props
}: WidgetCardProps) {
  const showNeon = neonHover || neonEffect;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.23, 1, 0.32, 1],
      }}
      className="h-full"
    >
      <Card
        className={cn(
          "relative h-full overflow-hidden transition-all duration-300",
          glass && "glass",
          showNeon && "hover:border-neon hover:shadow-neon",
          className,
        )}
        {...props}
      >
        {/* Subtle Glow Overlay */}
        <div className="from-neon/5 pointer-events-none absolute -inset-px bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        {children}
      </Card>
    </motion.div>
  );
}
