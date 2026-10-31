'use client';

/**
 * Global Motion Configuration Provider (TASK-MOT-02)
 * 
 * Enforces reducedMotion="user" across the entire application so that all Framer Motion
 * animations (transforms, spring physics, layout animations) automatically respect
 * the user's OS preference (prefers-reduced-motion: reduce).
 */

import React from 'react';
import { MotionConfig } from 'framer-motion';

export interface MotionProviderProps {
  children: React.ReactNode;
}

export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}
