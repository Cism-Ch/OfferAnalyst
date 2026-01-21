'use client';

/**
 * Page Transition Component
 * 
 * Provides smooth page transitions using Framer Motion
 * Wraps page content with enter/exit animations
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, pageSlideVariants, pageZoomVariants } from '@/lib/motion';

interface PageTransitionProps {
  children: React.ReactNode;
  /**
   * Animation variant for page transitions
   */
  variant?: 'fade' | 'slide' | 'zoom';
  /**
   * Unique key for AnimatePresence (typically the route)
   */
  pageKey?: string;
  /**
   * Custom className
   */
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  variant = 'fade',
  pageKey,
  className,
}) => {
  const getVariants = () => {
    switch (variant) {
      case 'slide':
        return pageSlideVariants;
      case 'zoom':
        return pageZoomVariants;
      case 'fade':
      default:
        return pageVariants;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        variants={getVariants()}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Section Transition - For animating sections within a page
 */
interface SectionTransitionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const SectionTransition: React.FC<SectionTransitionProps> = ({
  children,
  delay = 0,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Stagger Container - For animating lists with stagger effect
 */
interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.1,
  className,
}) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Stagger Item - Individual items within StaggerContainer
 */
interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({ children, className }) => {
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
