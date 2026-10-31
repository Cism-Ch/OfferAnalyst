/**
 * Framer Motion Animation Library
 * Premium animation presets for consistent, smooth animations across the app
 */

import { useSyncExternalStore } from 'react';
import { Variants, Variant, Transition } from 'framer-motion';

function subscribeReducedMotion(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', callback);
    return () => mediaQuery.removeEventListener('change', callback);
  } else {
    mediaQuery.addListener(callback);
    return () => mediaQuery.removeListener(callback);
  }
}

function getReducedMotionSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

/**
 * SSR-safe React hook detecting user preference for reduced motion
 */
export function useReducedMotionPreference(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
}

/**
 * Accessible Fade-Only Variants (for prefers-reduced-motion: reduce)
 */
export const accessibleFadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

/**
 * Motion variants adapter generating accessible motion when reduced motion is preferred
 */
export function createMotionVariants(
  standard: Variants,
  reduced?: Variants
): (shouldReduceMotion: boolean) => Variants {
  return (shouldReduceMotion: boolean) => {
    if (!shouldReduceMotion) return standard;
    if (reduced) return reduced;
    // Auto-strip transforms (x, y, scale) to keep clean opacity fades
    const accessible: Record<string, Variant> = {};
    for (const [key, val] of Object.entries(standard)) {
      if (typeof val === 'object' && val !== null) {
        const valObj = val as { opacity?: number | number[] };
        accessible[key] = {
          opacity: valObj.opacity !== undefined ? valObj.opacity : 1,
          transition: { duration: 0.15 },
        };
      }
    }
    return accessible;
  };
}

/**
 * Calibrated Transition Presets (TASK-MOT-02: 150-250ms hardware-accelerated curves)
 */
export const transitions = {
  // Smooth and natural transition (200ms)
  smooth: {
    type: 'tween',
    ease: [0.4, 0, 0.2, 1],
    duration: 0.2,
  } as Transition,

  // Snappy fast micro-interaction (150ms)
  snappy: {
    type: 'tween',
    ease: [0.4, 0, 0.2, 1],
    duration: 0.15,
  } as Transition,

  // Bouncy spring transition
  bounce: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
  } as Transition,

  // Gentle spring transition
  spring: {
    type: 'spring',
    stiffness: 350,
    damping: 30,
  } as Transition,

  // Quick snap transition
  snap: {
    type: 'spring',
    stiffness: 500,
    damping: 40,
  } as Transition,

  // Calibrated luxury transition (250ms)
  luxury: {
    type: 'tween',
    ease: [0.25, 0.1, 0.25, 1],
    duration: 0.25,
  } as Transition,

  // Instant fallback for prefers-reduced-motion
  reducedMotion: {
    duration: 0.01,
  } as Transition,
} as const;

/**
 * Page Transition Variants
 */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: transitions.smooth,
  },
};

export const pageSlideVariants: Variants = {
  initial: {
    opacity: 0,
    x: -100,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: transitions.spring,
  },
};

export const pageZoomVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 1.1,
    transition: transitions.smooth,
  },
};

/**
 * Card Animation Variants
 */
export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
  hover: {
    y: -8,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    transition: transitions.spring,
  },
  tap: {
    scale: 0.98,
    transition: transitions.snap,
  },
};

/**
 * List Item Animation Variants (for staggered children)
 */
export const listItemVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth,
  },
};

export const listContainerVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/**
 * Modal/Dialog Animation Variants
 */
export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: transitions.smooth,
  },
};

export const overlayVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    transition: transitions.smooth,
  },
};

/**
 * Button Animation Variants
 */
export const buttonVariants: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: transitions.snap,
  },
  tap: {
    scale: 0.95,
    transition: transitions.snap,
  },
};

export const buttonGlowVariants: Variants = {
  initial: {
    boxShadow: '0 0 0 0 rgba(212, 175, 55, 0)',
  },
  hover: {
    boxShadow: '0 0 20px 5px rgba(212, 175, 55, 0.3)',
    transition: transitions.smooth,
  },
};

/**
 * Loading Animation Variants
 */
export const skeletonVariants: Variants = {
  initial: {
    opacity: 0.6,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  },
};

export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/**
 * Slide-in Notification Variants
 */
export const notificationVariants: Variants = {
  initial: {
    opacity: 0,
    x: 100,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: transitions.smooth,
  },
};

/**
 * Collapse/Expand Animation Variants
 */
export const collapseVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: transitions.smooth,
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: transitions.smooth,
  },
};

/**
 * Parallax Scroll Animation Presets
 */
export const parallaxPresets = {
  slow: (scrollYProgress: number) => scrollYProgress * 30,
  medium: (scrollYProgress: number) => scrollYProgress * 50,
  fast: (scrollYProgress: number) => scrollYProgress * 100,
} as const;

/**
 * Hover Lift Preset (for interactive cards)
 */
export const hoverLiftProps = {
  whileHover: {
    y: -4,
    transition: transitions.spring,
  },
  whileTap: {
    scale: 0.98,
    transition: transitions.snap,
  },
};

/**
 * Fade In Up Preset (common pattern)
 */
export const fadeInUpProps = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: transitions.smooth,
};

/**
 * Stagger Container Props
 */
export const staggerContainerProps = {
  initial: 'hidden',
  animate: 'visible',
  variants: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  },
};

/**
 * Stagger Item Props
 */
export const staggerItemProps = {
  variants: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: transitions.smooth,
    },
  },
};

/**
 * Scale On Hover Preset (for buttons)
 */
export const scaleOnHoverProps = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: transitions.snap,
};
