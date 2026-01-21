import type { Variants } from "framer-motion";

/**
 * Reusable Framer Motion animation variants for consistent animations
 * across the application
 */

/**
 * Fade in from bottom with subtle scale
 */
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.95 },
};

/**
 * Fade in from top
 */
export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

/**
 * Simple fade in/out
 */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Scale in animation
 */
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

/**
 * Slide in from left
 */
export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

/**
 * Slide in from right
 */
export const slideInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

/**
 * Stagger children animation
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/**
 * Card hover effect
 */
export const cardHover = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98 },
};

/**
 * Default transition config for smooth animations
 */
export const defaultTransition = {
  type: "spring" as const,
  damping: 20,
  stiffness: 100,
};

/**
 * Smooth easing function
 */
export const smoothEase = [0.23, 1, 0.32, 1] as const;

/**
 * Create a staggered animation for list items
 */
export function createStaggeredAnimation(delay = 0.1) {
  return {
    container: {
      initial: {},
      animate: {
        transition: {
          staggerChildren: delay,
        },
      },
    },
    item: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    },
  };
}
