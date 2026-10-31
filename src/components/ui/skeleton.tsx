'use client';

/**
 * Standard & Calibrated Loading Skeleton Components (TASK-MOT-03)
 * 
 * Provides base shadcn Skeleton plus calibrated geometry skeletons
 * matching real cards, score charts, and action toolbars to maintain CLS < 0.05.
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  gradient?: boolean;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, width, height, rounded = 'md', gradient = false, style: userStyle, ...props }, ref) => {
    const style: React.CSSProperties = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      ...userStyle,
    };

    const roundedClasses = {
      none: '',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
    };

    return (
      <div
        ref={ref}
        data-slot="skeleton"
        className={cn(
          'bg-muted animate-pulse',
          roundedClasses[rounded],
          gradient && 'bg-gradient-to-r from-muted via-muted-foreground/15 to-muted',
          className
        )}
        style={style}
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';

/**
 * SkeletonScoreChart — Geometrically calibrated preview for ScoreChart
 */
export function SkeletonScoreChart() {
  return (
    <div className="border border-border/80 bg-card shadow-xs rounded-xl overflow-hidden p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2 pb-2">
        <Skeleton height={16} width={16} rounded="sm" />
        <Skeleton height={16} width={140} rounded="md" />
      </div>
      <div className="w-full aspect-[16/10] max-h-64 min-h-[160px] flex items-end justify-between gap-2 p-2 pt-4 bg-muted/20 rounded-lg">
        <Skeleton className="w-[14%] h-[60%]" rounded="md" />
        <Skeleton className="w-[14%] h-[85%]" rounded="md" />
        <Skeleton className="w-[14%] h-[45%]" rounded="md" />
        <Skeleton className="w-[14%] h-[95%]" rounded="md" />
        <Skeleton className="w-[14%] h-[70%]" rounded="md" />
        <Skeleton className="w-[14%] h-[55%]" rounded="md" />
      </div>
    </div>
  );
}

/**
 * SkeletonActionCard — Geometrically calibrated preview for analysis action buttons
 */
export function SkeletonActionCard() {
  return (
    <div className="border border-border/80 bg-card shadow-xs rounded-xl overflow-hidden p-4 sm:p-5 space-y-2.5">
      <Skeleton height={40} className="w-full" rounded="md" />
      <Skeleton height={40} className="w-full" rounded="md" />
      <Skeleton height={40} className="w-full" rounded="md" />
    </div>
  );
}

/**
 * SkeletonResultsHeader — Calibrated toolbar header matching ResultsSection
 */
export function SkeletonResultsHeader() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 px-4 rounded-xl bg-card border border-border/80 shadow-2xs">
      <div className="flex items-center gap-2.5">
        <Skeleton height={24} width={160} rounded="md" />
        <Skeleton height={20} width={64} rounded="full" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton height={32} width={96} rounded="md" />
        <Skeleton height={32} width={96} rounded="md" />
        <Skeleton height={32} width={72} rounded="md" />
      </div>
    </div>
  );
}

/**
 * SkeletonOfferCard — Calibrated card matching real OfferCard (CLS < 0.05)
 */
export function SkeletonOfferCard() {
  return (
    <div className="border border-border/80 bg-card shadow-xs rounded-xl overflow-hidden p-3.5 sm:p-5 space-y-4">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Skeleton height={20} width={36} rounded="sm" />
          <Skeleton height={20} width={64} rounded="sm" />
          <Skeleton height={16} width={80} rounded="sm" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton height={22} width={70} rounded="full" />
          <Skeleton height={32} width={32} rounded="md" />
        </div>
      </div>

      {/* Title & Price */}
      <div className="space-y-2">
        <Skeleton height={20} className="w-4/5" rounded="md" />
        <Skeleton height={18} width={90} rounded="md" />
      </div>

      {/* Description Snippet */}
      <div className="space-y-1.5 pt-1">
        <Skeleton height={14} className="w-full" rounded="sm" />
        <Skeleton height={14} className="w-2/3" rounded="sm" />
      </div>

      {/* 3-Axis Score breakdown bars */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
        <div className="space-y-1">
          <Skeleton height={10} width="60%" rounded="sm" />
          <Skeleton height={6} className="w-full" rounded="full" />
        </div>
        <div className="space-y-1">
          <Skeleton height={10} width="60%" rounded="sm" />
          <Skeleton height={6} className="w-full" rounded="full" />
        </div>
        <div className="space-y-1">
          <Skeleton height={10} width="60%" rounded="sm" />
          <Skeleton height={6} className="w-full" rounded="full" />
        </div>
      </div>

      {/* Card Action footer */}
      <div className="pt-2">
        <Skeleton height={36} className="w-full" rounded="lg" />
      </div>
    </div>
  );
}
