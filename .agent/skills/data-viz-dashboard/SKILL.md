---
name: Data Viz Dashboard
description: Specialized skill for the conceptualization and implementation of premium data visualization dashboards following the "Neon" design system.
---

# Data Viz Dashboard

This skill focuses on creating visually stunning, highly functional, and responsive dashboards for data analysis and visualization.

## Design Philosophy (Neon Premium)

### 1. Visual Aesthetics
- **Color Palette**: Use deep zinc/slate backgrounds with vibrant neon accents (#00f2ff, #bc13fe, etc.).
- **Glassmorphism**: Leverage backdrop blurs, subtle borders, and low-opacity fills for a premium feel.
- **Gradients**: Use smooth, dynamic gradients (e.g., Aurora backgrounds) to add depth without clutter.
- **Typography**: Prioritize high-readability sans-serif fonts with clear hierarchy.

### 2. Component Standards
- **WidgetCard**: Use the standardized `WidgetCard` (3xl rounded) for all main dashboard modules.
- **Consistent Rounding**: `rounded-3xl` for main containers, `rounded-2xl` for inner elements (inputs, buttons, sub-cards).
- **Micro-animations**: Use Framer Motion for entry animations, hover effects, and state transitions.

## Conceptualization Strategy

### 1. Chart Selection
- **Quantitative Data**: Bar charts, line graphs (for trends), area charts.
- **Categorical Data**: Pie/donut charts (use sparingly), treemaps, radar charts.
- **Status/Metrics**: Large numerical displays, progress bars, neon gauges.

### 2. Layout & Responsiveness
- **Grid System**: Use CSS Grid or Flexbox for adaptable layouts. Prioritize a multi-column desktop view that stacks logically on mobile.
- **Information Density**: Balance high-level metrics with drill-down capabilities. Use collapsible sections or tabs to hide advanced data.

## Implementation Guide
- **Library**: Use specialized libraries like `recharts` or `visx` within React components.
- **Theme Sync**: Ensure all visualization colors are derived from the project's CSS variables or `next-themes` configuration.
- **Empty States**: Always design "no-data" or "loading" states that maintain the dashboard's layout.
