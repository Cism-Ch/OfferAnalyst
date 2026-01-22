'use client';

/**
 * Premium Loading Skeleton Component
 * 
 * Animated loading skeletons with smooth transitions
 * Provides better loading UX with premium animations
 */

import React from 'react';
import { motion } from 'framer-motion';
import { skeletonVariants } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Width of the skeleton
   */
  width?: string | number;
  /**
   * Height of the skeleton
   */
  height?: string | number;
  /**
   * Border radius variant
   */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /**
   * Enable gradient animation
   */
  gradient?: boolean;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, width, height, rounded = 'md', gradient = false, ...props }, ref) => {
    const style: React.CSSProperties = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
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
      <motion.div
        ref={ref}
        className={cn(
          'bg-muted',
          roundedClasses[rounded],
          gradient && 'animate-pulse bg-gradient-to-r from-muted via-muted-foreground/20 to-muted',
          className
        )}
        style={style}
        variants={skeletonVariants}
        initial="initial"
        animate="animate"
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

/**
 * Skeleton Card - Common loading state for cards
 */
export const SkeletonCard = () => {
  return (
    <div className="card-premium space-y-4 p-6">
      <Skeleton height={24} width="60%" />
      <Skeleton height={16} width="90%" />
      <Skeleton height={16} width="75%" />
      <div className="flex gap-2 pt-2">
        <Skeleton height={32} width={80} rounded="lg" />
        <Skeleton height={32} width={80} rounded="lg" />
      </div>
    </div>
  );
};

/**
 * Skeleton Table Row - Loading state for table rows
 */
export const SkeletonTableRow = () => {
  return (
    <div className="flex items-center gap-4 py-3">
      <Skeleton height={40} width={40} rounded="full" />
      <div className="flex-1 space-y-2">
        <Skeleton height={16} width="70%" />
        <Skeleton height={12} width="40%" />
      </div>
      <Skeleton height={32} width={80} rounded="lg" />
    </div>
  );
};

/**
 * Skeleton List - Multiple loading items
 */
interface SkeletonListProps {
  count?: number;
  variant?: 'card' | 'row';
}

export const SkeletonList = ({ count = 3, variant = 'card' }: SkeletonListProps) => {
  const Component = variant === 'card' ? SkeletonCard : SkeletonTableRow;

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
};

/**
 * Skeleton Text - Loading state for text content
 */
interface SkeletonTextProps {
  lines?: number;
  lastLineWidth?: string;
}

export const SkeletonText = ({ lines = 3, lastLineWidth = '60%' }: SkeletonTextProps) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          width={i === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  );
};

/**
 * Skeleton Avatar - Loading state for avatars
 */
interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const SkeletonAvatar = ({ size = 'md' }: SkeletonAvatarProps) => {
  const sizes = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  };

  return <Skeleton height={sizes[size]} width={sizes[size]} rounded="full" />;
};

/**
 * Skeleton Dashboard - Complete dashboard loading state
 */
export const SkeletonDashboard = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton height={32} width={200} />
          <Skeleton height={16} width={300} />
        </div>
        <Skeleton height={40} width={120} rounded="lg" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card-premium p-6">
            <Skeleton height={16} width="50%" className="mb-2" />
            <Skeleton height={32} width="70%" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
};
