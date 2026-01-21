/**
 * Framer Motion Animation Library
 * Premium animation presets for consistent, smooth animations across the app
 */

import { Variants, Transition } from 'framer-motion';

/**
 * Transition Presets
 */
export const transitions = {
  // Smooth and natural transition
  smooth: {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.3,
  } as Transition,

  // Bouncy spring transition
  bounce: {
    type: 'spring',
    stiffness: 400,
    damping: 10,
  } as Transition,

  // Gentle spring transition
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  } as Transition,

  // Quick snap transition
  snap: {
    type: 'spring',
    stiffness: 500,
    damping: 40,
  } as Transition,

  // Slow and luxurious
  luxury: {
    type: 'tween',
    ease: [0.25, 0.1, 0.25, 1],
    duration: 0.6,
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
        staggerChildren: 0.1,
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
