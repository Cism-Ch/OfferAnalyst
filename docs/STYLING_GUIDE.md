# Component Styling Guide

## Overview

This document outlines the styling patterns and best practices used in the OfferAnalyst application after the 2026 styling refactoring. All components follow a consistent approach using shadcn/ui primitives, semantic design tokens, and Framer Motion animations.

## Design System Principles

### 1. Semantic Design Tokens

We use semantic color tokens that automatically adapt to light/dark mode:

```tsx
// ✅ Good - Uses semantic tokens
<div className="bg-card border border-border text-foreground">
  <p className="text-muted-foreground">Secondary text</p>
</div>

// ❌ Bad - Hardcoded colors
<div className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
  <p className="text-zinc-600 dark:text-zinc-400">Secondary text</p>
</div>
```

**Available semantic tokens:**
- `background` / `foreground` - Base page colors
- `card` / `card-foreground` - Card backgrounds
- `muted` / `muted-foreground` - Subdued elements
- `border` - Border colors
- `accent` / `accent-foreground` - Accent colors
- `neon` / `neon-foreground` - Brand highlight color (supports theme switching)

### 2. Consistent Spacing & Sizing

Use standard Tailwind spacing scale rather than arbitrary values:

```tsx
// ✅ Good
<div className="space-y-4 p-6">
  <input className="h-11" />
</div>

// ❌ Bad
<div className="space-y-[24px] p-[32px]">
  <input className="h-[52px]" />
</div>
```

### 3. Component Size Variants

Use shadcn size variants instead of custom heights:

```tsx
// ✅ Good
<Button size="lg">Submit</Button>

// ❌ Bad
<Button className="h-14 px-8">Submit</Button>
```

## Animation Patterns

### Using Reusable Animation Variants

Import from `/src/lib/animations.ts`:

```tsx
import { fadeInUp, smoothEase, createStaggeredAnimation } from "@/lib/animations";

// Simple fade-in animation
<motion.div variants={fadeInUp} initial="initial" animate="animate">
  Content
</motion.div>

// Custom animation with standard easing
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: smoothEase }}
>
  Content
</motion.div>

// Staggered list animation
const stagger = createStaggeredAnimation(0.1);
<motion.ul variants={stagger.container}>
  {items.map(item => (
    <motion.li key={item.id} variants={stagger.item}>
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

### WidgetCard Component

The `WidgetCard` wrapper provides consistent animations and optional neon effects:

```tsx
import { WidgetCard } from "@/components/premium/WidgetCard";
import { fadeInUp } from "@/lib/animations";

<WidgetCard
  glass              // Enables glassmorphism effect
  neonHover          // Adds neon border on hover
  delay={0.2}        // Animation delay in seconds
  variants={fadeInUp} // Custom animation variants
>
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
</WidgetCard>
```

### AnimatePresence for Conditionals

Use `AnimatePresence` for smooth enter/exit animations:

```tsx
import { AnimatePresence, motion } from "framer-motion";

<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      Collapsible content
    </motion.div>
  )}
</AnimatePresence>
```

## Component Patterns

### Cards

```tsx
<WidgetCard neonHover delay={0.1}>
  <CardHeader className="space-y-4">
    <div className="flex items-center justify-between">
      <CardTitle className="text-xl font-bold">
        Title
      </CardTitle>
      <Badge variant="outline" className="text-xs">
        Status
      </Badge>
    </div>
    <CardDescription className="text-sm text-muted-foreground">
      Description text
    </CardDescription>
  </CardHeader>
  
  <CardContent className="space-y-4">
    {/* Content */}
  </CardContent>
</WidgetCard>
```

### Forms

```tsx
<div className="space-y-4">
  <div className="space-y-2">
    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      Field Label
    </Label>
    <Input
      placeholder="Enter value..."
      className="h-11 transition-colors focus:border-neon/50 focus:ring-neon/20"
    />
  </div>
</div>
```

### Buttons

```tsx
// Primary action with neon color
<Button
  className="bg-neon text-neon-foreground hover:bg-neon/90"
>
  Primary Action
</Button>

// Icon button
<Button
  variant="outline"
  size="icon"
  className="hover:border-neon/50 hover:bg-neon/5 hover:text-neon"
>
  <Icon className="size-5" />
</Button>
```

## Neon Theme System

The application supports dynamic neon color themes (yellow, green, cyan, purple) through the `NeonProvider`:

```tsx
import { useNeon } from "@/components/providers/NeonProvider";

function MyComponent() {
  const { neonColor, setNeonColor } = useNeon();
  
  return (
    <button onClick={() => setNeonColor('cyan')}>
      Switch to Cyan
    </button>
  );
}
```

The neon color automatically updates CSS custom properties:
- `--neon`: The main neon color
- `--neon-rgb`: RGB values for opacity variants

Use via Tailwind classes:
- `text-neon` / `bg-neon` / `border-neon`
- `text-neon-foreground` (contrasting text)
- `shadow-neon` (neon glow effect)
- Opacity modifiers work automatically: `bg-neon/10`, `border-neon/50`

## Typography

### Headings
```tsx
<h1 className="text-2xl font-bold">Main Heading</h1>
<h2 className="text-xl font-bold">Section Heading</h2>
<h3 className="text-lg font-semibold">Subsection</h3>
```

### Body Text
```tsx
<p className="text-sm text-muted-foreground">
  Secondary information
</p>
<p className="text-base">
  Primary content
</p>
```

### Small/Meta Text
```tsx
<span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
  Label
</span>
<span className="text-[10px] font-semibold uppercase tracking-wider">
  Micro Label
</span>
```

## Migration Checklist

When updating legacy components:

- [ ] Replace hardcoded colors with semantic tokens
- [ ] Replace `rounded-3xl`, `rounded-2xl` with standard `rounded-lg` or variants
- [ ] Replace custom spacing with standard scale (`px-8` → `p-6`, `space-y-8` → `space-y-4`)
- [ ] Replace custom animations with variants from `@/lib/animations`
- [ ] Use `WidgetCard` wrapper for consistent card animations
- [ ] Replace `size={14}` on icons with `className="size-3.5"` (Tailwind classes)
- [ ] Remove `tracking-widest` and `tracking-tight`, use default or `tracking-wide`
- [ ] Use `font-semibold` instead of `font-bold` for most text
- [ ] Replace `opacity-50` with semantic tokens like `text-muted-foreground`

## Best Practices

1. **Always use `cn()` utility** for conditional classes
2. **Prefer semantic tokens** over arbitrary color values
3. **Use standard Tailwind scale** for spacing, sizing, and radii
4. **Import animation variants** rather than defining inline
5. **Wrap cards in WidgetCard** for consistent behavior
6. **Use size variants** from shadcn components
7. **Test in both light and dark modes** to verify token usage
8. **Keep animations subtle** - prefer 0.3-0.5s durations
9. **Use AnimatePresence** for conditional rendering with animations
10. **Document custom variants** in `/src/lib/animations.ts`

## Package Versions

All packages are up to date as of January 2026:
- React 19.2.3
- Next.js 16.1.4
- Framer Motion 12.27.5
- Tailwind CSS 4
- 0 security vulnerabilities

Run `npm outdated` periodically to check for updates.
