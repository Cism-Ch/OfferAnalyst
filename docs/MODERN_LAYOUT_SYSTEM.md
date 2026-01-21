# Modern Premium Layout System

## Overview

The new layout system provides a modern, professional SaaS experience with collapsible navigation, better organization, and smooth animations. Inspired by contemporary design patterns, it offers both functionality and visual appeal.

## Components

### 1. ModernSidebar

A feature-rich collapsible sidebar with smooth animations.

**Features:**
- **Collapsible Design**: Toggle between full (256px) and icon-only (80px) modes
- **Organized Navigation**: Sections for main items and secondary/settings items
- **Smooth Animations**: Framer Motion powered transitions
- **Mobile Responsive**: Overlay menu with backdrop for mobile devices
- **Visual Indicators**: Active states, badges ("Soon"), and status indicators
- **User Profile**: At bottom with avatar, name, and plan status

**Usage:**
```tsx
import { ModernSidebar } from '@/components/layout/ModernSidebar';

<ModernSidebar
  isCollapsed={false}
  onToggle={() => setCollapsed(!collapsed)}
/>
```

**Navigation Structure:**
```
Main Section:
├── Dashboard
├── Projects
├── History
└── Saved Offers

More Section:
├── Analytics (with "Soon" badge)
└── Settings
```

### 2. ModernHeader

Enhanced header with breadcrumb navigation and improved controls.

**Features:**
- **Breadcrumb Navigation**: Shows current location hierarchy
- **Quick Search**: Animated search bar with focus expansion
- **Theme Selector**: Premium theme picker integration
- **Model Switcher**: AI model selection dialog
- **Glassmorphism**: Backdrop blur effect for modern feel
- **Sticky Positioning**: Always visible on scroll

**Usage:**
```tsx
import { ModernHeader } from '@/components/layout/ModernHeader';

<ModernHeader
  selectedModel={modelId}
  onModelChange={setModelId}
  title="Dashboard"
  description="AI-powered offer analysis"
/>
```

**Breadcrumb Examples:**
- Dashboard: `Home > Dashboard`
- Projects: `Home > Projects`
- Saved Offers: `Home > Saved Offers`

### 3. ModernLayout

Complete layout wrapper for dashboard and main pages.

**Features:**
- **Integrated Sidebar**: Includes ModernSidebar with state management
- **Header Integration**: ModernHeader with all controls
- **Content Container**: Max-width container with responsive padding
- **Flexible Width**: Configurable max-width (full, 7xl, 6xl, 5xl)

**Usage:**
```tsx
import { ModernLayout } from '@/components/layout/ModernLayout';

<ModernLayout
  selectedModel={modelId}
  onModelChange={setModelId}
  maxWidth="7xl"
>
  {/* Page content */}
</ModernLayout>
```

### 4. SimpleLayout

Simplified layout for non-dashboard pages (history, saved, etc.).

**Features:**
- **No Model Selector**: Cleaner header for pages that don't need AI controls
- **Breadcrumbs Only**: Simple navigation context
- **Same Sidebar**: Consistent navigation across all pages
- **Lightweight**: Fewer components and props

**Usage:**
```tsx
import { SimpleLayout } from '@/components/layout/SimpleLayout';

<SimpleLayout
  title="Saved Offers"
  description="Your bookmarked offers"
  maxWidth="6xl"
>
  {/* Page content */}
</SimpleLayout>
```

## Layout Anatomy

```
┌─────────────────────────────────────────────────────────┐
│                     ModernHeader                        │
│  Breadcrumbs | Search | Theme | Model                   │
│  Page Title & Description                               │
├──────────┬──────────────────────────────────────────────┤
│          │                                               │
│  Modern  │          Content Container                   │
│  Sidebar │         (max-width: 7xl)                     │
│          │                                               │
│  [Nav]   │  ┌──────────────────────────────────────┐   │
│  [Items] │  │                                        │   │
│          │  │        Page Content                    │   │
│  ───────  │  │                                        │   │
│          │  │                                        │   │
│  [More]  │  └──────────────────────────────────────┘   │
│          │                                               │
│  [User]  │                                               │
└──────────┴──────────────────────────────────────────────┘
```

### Collapsed State

```
┌─────────────────────────────────────────────────────────┐
│                     ModernHeader                        │
├───┬─────────────────────────────────────────────────────┤
│   │                                                      │
│ 🏠 │          Content Container (wider)                 │
│ 📁 │                                                     │
│ 🕐 │  ┌──────────────────────────────────────────────┐ │
│ 📖 │  │                                              │ │
│    │  │        Page Content (more space)             │ │
│ ── │  │                                              │ │
│    │  └──────────────────────────────────────────────┘ │
│ 📊 │                                                     │
│ ⚙️  │                                                     │
│    │                                                      │
│ 👤 │                                                     │
└───┴─────────────────────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (≥768px)
- **Sidebar**: Visible with toggle button
- **Collapsed Width**: 80px
- **Expanded Width**: 256px
- **Content**: Adjusts automatically

### Mobile (<768px)
- **Sidebar**: Hidden by default
- **Menu Button**: Top-left floating button
- **Overlay**: Full-screen backdrop
- **Animation**: Slide-in from left

## Spacing & Dimensions

### Sidebar
- **Expanded**: 256px (16rem)
- **Collapsed**: 80px (5rem)
- **Padding**: 16px (1rem)
- **Item Height**: 40px (2.5rem)

### Header
- **Height**: Auto (responsive)
- **Padding**: 24px horizontal, 16px vertical
- **Sticky**: top: 0, z-index: 30

### Content
- **Max Width**: 7xl (80rem) default
- **Padding**: 24px (1.5rem)
- **Margin**: Auto-centered

## Color Tokens

Uses theme-aware color tokens:
- `background` - Main background
- `foreground` - Primary text
- `muted` - Secondary text
- `primary` - Accent color
- `accent` - Hover states
- `border` - Dividers

## Animations

### Sidebar Collapse
```ts
duration: 0.3s
easing: ease-in-out
properties: width
```

### Mobile Menu
```ts
type: spring
stiffness: 200
damping: 25
properties: x (translate)
```

### Header Elements
```ts
stagger: 0.1s delay between items
fade-in: opacity 0 → 1
slide-up: y: 20 → 0
```

## Accessibility

- **Keyboard Navigation**: Full support
- **ARIA Labels**: All interactive elements
- **Focus Indicators**: Visible focus rings
- **Screen Reader**: Descriptive labels
- **Skip Links**: Can be added if needed

## Migration Guide

### From Old Layout

**Before:**
```tsx
<div className="flex min-h-screen">
  <Sidebar />
  <main className="flex-1">
    <Header ... />
    <div className="p-6">
      {content}
    </div>
  </main>
</div>
```

**After:**
```tsx
<ModernLayout
  selectedModel={model}
  onModelChange={setModel}
>
  {content}
</ModernLayout>
```

### For Non-Dashboard Pages

**Before:**
```tsx
<div className="min-h-screen p-6">
  <header>
    <h1>Page Title</h1>
  </header>
  {content}
</div>
```

**After:**
```tsx
<SimpleLayout
  title="Page Title"
  description="Page description"
>
  {content}
</SimpleLayout>
```

## Best Practices

1. **Use Consistent Layouts**: ModernLayout for dashboard, SimpleLayout for other pages
2. **Max Width**: Use appropriate max-width for content type
3. **Spacing**: Let the layout handle spacing, focus on content
4. **Navigation**: Add new routes to ModernSidebar navigation arrays
5. **Breadcrumbs**: Update getPageInfo() in ModernHeader for new pages
6. **Mobile**: Test both overlay and desktop modes
7. **Animations**: Respect user's motion preferences (handled automatically)

## Performance

- **Bundle Size**: ~35KB (gzipped with Framer Motion)
- **First Paint**: Minimal layout shift
- **Animations**: GPU-accelerated
- **Re-renders**: Optimized with React.memo where needed

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (including backdrop-filter)
- Mobile: Touch-optimized

## Future Enhancements

- [ ] Customizable sidebar width
- [ ] Persistent collapse state
- [ ] Keyboard shortcuts (Cmd+B to toggle)
- [ ] Sidebar search
- [ ] Recent pages in navigation
- [ ] Custom navigation sections per user role

## Examples

### Dashboard Page
```tsx
export default function DashboardPage() {
  const [model, setModel] = useState('default');
  
  return (
    <ModernLayout
      selectedModel={model}
      onModelChange={setModel}
    >
      <div className="space-y-6">
        {/* Dashboard content */}
      </div>
    </ModernLayout>
  );
}
```

### Settings Page
```tsx
export default function SettingsPage() {
  return (
    <SimpleLayout
      title="Settings"
      description="Manage your preferences"
      maxWidth="5xl"
    >
      <div className="space-y-6">
        {/* Settings content */}
      </div>
    </SimpleLayout>
  );
}
```

## Support

For issues or questions:
1. Check this documentation
2. Review component props in TypeScript definitions
3. See `/docs/PREMIUM_DESIGN_SYSTEM.md` for design tokens
4. Test in different viewport sizes

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Related**: Premium Roadmap Phase 0-1
