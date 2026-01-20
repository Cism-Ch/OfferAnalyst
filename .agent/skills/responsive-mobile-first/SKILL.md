---
name: Responsive & Mobile First Design
description: Specialized skill for building fully responsive, mobile-first web applications with a focus on premium component adaptivity and touch interactions.
---

# Responsive & Mobile First Design

This skill ensures that every pixel of the application adapts elegantly to any screen size, providing a premium experience from smartphones to ultra-wide monitors.

## Core Strategies

### 1. Mobile-First Architecture
- **Inverted Workflow**: Start designing and coding for the smallest screens first. Scale up using `min-width` breakpoints.
- **Critical Path**: Prioritize essential features on mobile; avoid clutter by hiding non-critical decorative elements on smaller viewports.
- **Performance**: Optimize images and assets for mobile data speeds and lower processing power.

### 2. Fluid Layouts & Typography
- **Relative Units**: Favor `rem`, `em`, `vh/vw`, and percentages over fixed `px` values.
- **Clamp Function**: Use `clamp()` for fluid typography and spacing that scales smoothly between a minimum and maximum value.
- **CSS Grid & Flexbox**: Leverage modern CSS layouts for dynamic alignment and wrapping without excessive media queries.

## Responsive Component Design

### 1. UI Elements Adaptivity
- **Buttons & Inputs**: Ensure touch targets are at least 44x44px on mobile. Expand inputs to full-width on small screens.
- **Cards & Grids**: Transition from 1-column stacks on mobile to multi-column grids on desktop. Use `aspect-ratio` to maintain visual consistency.
- **Navigation**: Implement mobile-optimized navigation (e.g., hamburger menus, bottom bars) and transition to full headers on desktop.

### 2. Touch & Interaction
- **Gestures**: Support intuitive gestures (swiping, long-press) where appropriate, ensuring they don't conflict with system actions.
- **Hover States**: Disable or adapt hover-dependent states for touch devices. Use active/focus states as fallbacks.
- **Safe Areas**: Account for device-specific safe areas (e.g., iPhone notches, home indicators) using `env(safe-area-inset-*)`.

## Breakpoints & Hierarchy
- **Standard Breakpoints**:
    - `sm`: 640px (Small tablets/Landscape phones)
    - `md`: 768px (Tablets)
    - `lg`: 1024px (Laptops)
    - `xl`: 1280px (Desktops)
    - `2xl`: 1536px (Large Desktops)
- **Container Queries**: Use `@container` for components that need to adapt based on their parent size rather than the viewport.

## Best Practices
- **Tailwind Canonical Ordering**: Always order Tailwind classes logically: Layout → Spacing → Typography → Colors → Effects → Interactivity → Transitions.
- **Testing**: Regularly test on physical devices or high-fidelity simulators, not just browser resize.
- **A11y**: Ensure that responsive changes (like hiding text for icons) don't break accessibility or SEO.
