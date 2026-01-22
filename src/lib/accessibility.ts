/**
 * Accessibility Utilities
 * 
 * Helper functions and utilities to improve WCAG 2.1 AA compliance
 */

/**
 * Check if color contrast meets WCAG AA standard (4.5:1 for normal text)
 * 
 * @param foreground - Foreground color (hex format)
 * @param background - Background color (hex format)
 * @returns true if contrast meets WCAG AA standard
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= 4.5;
}

/**
 * Calculate contrast ratio between two colors
 * 
 * @param color1 - First color (hex format)
 * @param color2 - Second color (hex format)
 * @returns Contrast ratio
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculate relative luminance of a color
 * 
 * @param color - Color in hex format
 * @returns Relative luminance (0-1)
 */
function getLuminance(color: string): number {
  // Remove # if present
  color = color.replace('#', '');
  
  // Validate hex format
  if (color.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(color)) {
    throw new Error('Invalid hex color format. Expected 6-digit hex code.');
  }
  
  // Convert to RGB
  const r = parseInt(color.slice(0, 2), 16) / 255;
  const g = parseInt(color.slice(2, 4), 16) / 255;
  const b = parseInt(color.slice(4, 6), 16) / 255;
  
  // Apply gamma correction
  const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  // Calculate luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Generate accessible keyboard event handler
 * Supports Enter and Space keys for activation
 * 
 * @param handler - Click handler function
 * @returns Keyboard event handler
 */
export function createKeyboardHandler(
  handler: (event: React.MouseEvent | React.KeyboardEvent) => void
) {
  return (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handler(event);
    }
  };
}

/**
 * Generate unique ID for aria-describedby and aria-labelledby
 */
let idCounter = 0;
export function generateAriaId(prefix: string = 'aria'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Screen reader only text (visually hidden but accessible)
 */
export const srOnlyClasses = 'absolute w-[1px] h-[1px] p-0 -m-[1px] overflow-hidden whitespace-nowrap border-0';

/**
 * Focus visible styles (keyboard navigation indicator)
 */
export const focusVisibleClasses = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

/**
 * Get props for skip to main content link (for keyboard navigation)
 * Component should be created in a .tsx file
 */
export function getSkipToMainContentProps() {
  return {
    href: '#main-content',
    className: `${srOnlyClasses} focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md`,
    children: 'Skip to main content',
  };
}

/**
 * Announce to screen readers (live region)
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = srOnlyClasses;
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement with safety check
  setTimeout(() => {
    if (announcement.parentNode) {
      document.body.removeChild(announcement);
    }
  }, 1000);
}

/**
 * Create accessible button props
 */
export interface AccessibleButtonProps {
  label: string;
  description?: string;
  disabled?: boolean;
  pressed?: boolean;
  expanded?: boolean;
}

export function getAccessibleButtonProps(props: AccessibleButtonProps) {
  const ariaProps: Record<string, string | boolean> = {
    'aria-label': props.label,
  };
  
  if (props.description) {
    const descId = generateAriaId('desc');
    ariaProps['aria-describedby'] = descId;
  }
  
  if (props.disabled) {
    ariaProps['aria-disabled'] = true;
  }
  
  if (props.pressed !== undefined) {
    ariaProps['aria-pressed'] = props.pressed;
  }
  
  if (props.expanded !== undefined) {
    ariaProps['aria-expanded'] = props.expanded;
  }
  
  return ariaProps;
}

/**
 * Accessible form field props
 */
export interface AccessibleFieldProps {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
}

export function getAccessibleFieldProps(props: AccessibleFieldProps) {
  const labelId = `${props.id}-label`;
  const descId = props.description ? `${props.id}-desc` : undefined;
  const errorId = props.error ? `${props.id}-error` : undefined;
  
  const describedBy = [descId, errorId].filter(Boolean).join(' ');
  
  return {
    field: {
      id: props.id,
      'aria-labelledby': labelId,
      'aria-describedby': describedBy || undefined,
      'aria-invalid': props.error ? true : undefined,
      'aria-required': props.required,
    },
    label: {
      id: labelId,
      htmlFor: props.id,
    },
    description: descId ? {
      id: descId,
    } : undefined,
    error: errorId ? {
      id: errorId,
      role: 'alert',
    } : undefined,
  };
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation duration based on user preference
 */
export function getAnimationDuration(defaultMs: number): number {
  return prefersReducedMotion() ? 0 : defaultMs;
}

/**
 * Trap focus within a container (for modals)
 */
export function trapFocus(container: HTMLElement) {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };
  
  container.addEventListener('keydown', handleKeyDown);
  
  // Focus first element
  firstElement?.focus();
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}
