# Dashboard Module

This directory contains the modular components and logic for the OfferAnalyst dashboard.

## Overview

The dashboard has been refactored from a single 443-line file into a modular, maintainable structure. Each component has a single responsibility and is properly documented.

## Directory Structure

```
dashboard/
├── dashboard-page.tsx          # Main orchestration component
├── hooks/                      # Custom hooks for business logic
│   ├── useDashboardState.ts   # State management hook
│   └── useOfferAnalysis.ts    # Analysis workflow logic
├── ui/                         # UI components
│   ├── ConfigurationCard.tsx  # User input form
│   ├── DashboardHeader.tsx    # Top navigation bar
│   ├── DashboardSidebar.tsx   # Side navigation menu
│   ├── OfferCard.tsx          # Individual offer display
│   ├── ResultsSection.tsx     # Results display container
│   └── ScoreChart.tsx         # Score visualization chart
├── utils/                      # Utility components
│   └── ClientOnlySelect.tsx   # Client-side rendering wrapper
└── constants/                  # Constants and configuration
    └── dummy-offers.ts        # Sample data for testing
```

## Component Responsibilities

### Main Component
- **dashboard-page.tsx**: Orchestrates the entire dashboard by composing smaller components and managing state flow.

### Hooks
- **useDashboardState.ts**: Centralizes all state management including inputs, loading states, and results.
- **useOfferAnalysis.ts**: Encapsulates the business logic for the two-phase analysis workflow (fetch + analyze).

### UI Components
- **DashboardSidebar.tsx**: Navigation sidebar with links and user profile.
- **DashboardHeader.tsx**: Top header with search, theme toggle, and settings.
- **ConfigurationCard.tsx**: Main input form for user preferences and analysis parameters.
- **ResultsSection.tsx**: Container for displaying analysis results or empty state.
- **OfferCard.tsx**: Individual offer card with score, justification, and save functionality.
- **ScoreChart.tsx**: Bar chart visualization of offer scores using Recharts.

### Utilities
- **ClientOnlySelect.tsx**: Wrapper to prevent hydration issues with Select components in Next.js.

### Constants
- **dummy-offers.ts**: Sample offers for demonstration and testing.

## Architecture Principles

### Separation of Concerns
- **UI Layer**: Pure presentational components in `/ui`
- **Logic Layer**: Business logic in `/hooks`
- **Data Layer**: Constants and utilities in `/constants` and `/utils`

### Component Design
- Single Responsibility Principle (SRP)
- Props interface documentation with TypeScript
- Comprehensive JSDoc comments
- Responsive design considerations

### State Management
- Custom hooks for state encapsulation
- Props drilling minimized through logical grouping
- Clear data flow from parent to children

## Usage Example

```tsx
import { Dashboard } from '@/components/dashboard/dashboard-page';

export default function DashboardPage() {
  return <Dashboard />;
}
```

## Key Features

1. **AI-Powered Analysis**: Integrates with AI agents for offer scoring and ranking
2. **Auto-Fetch**: Optional web scraping for live offer data
3. **Interactive Visualizations**: Real-time chart updates with Recharts
4. **State Persistence**: Saves analysis history and favorite offers
5. **Responsive Design**: Works on mobile, tablet, and desktop
6. **Theme Support**: Dark/light mode with next-themes

## Development Guidelines

### Adding New Components
1. Create component in appropriate subdirectory (`ui/`, `hooks/`, etc.)
2. Add comprehensive JSDoc documentation
3. Define TypeScript interfaces for props
4. Export from component file
5. Import in main dashboard component

### Modifying Existing Components
1. Keep changes minimal and focused
2. Update documentation if behavior changes
3. Maintain existing prop interfaces for compatibility
4. Test responsive behavior on multiple screen sizes

### State Management
- Add new state to `useDashboardState` hook
- Keep state updates pure and predictable
- Document state purpose and lifecycle

## Testing Considerations

When testing the dashboard:
1. Verify all components render without errors
2. Test the complete analysis workflow (auto-fetch + analyze)
3. Check responsive behavior at different breakpoints
4. Validate dark/light theme switching
5. Test offer save/unsave functionality
6. Verify chart renders correctly with data

## Future Improvements

Potential enhancements for consideration:
- Extract more reusable components from ConfigurationCard
- Add unit tests for hooks
- Implement error boundaries
- Add loading skeletons for better UX
- Optimize re-renders with React.memo where needed
- Add keyboard navigation support
- Implement analytics tracking
