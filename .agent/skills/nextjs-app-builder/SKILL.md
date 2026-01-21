---
name: Next.js App Builder
description: Specialized skill for scalable Next.js App Router patterns, component architecture, and high-performance frontend implementation.
---

# Next.js App Builder

This skill provides the architectural foundation for building robust, scalable, and high-performance applications using the Next.js App Router.

## Architectural Patterns

### 1. App Router Excellence
- **File System Routing**: Organize routes logically within the `src/app` directory. Use route groups `(groupname)` to clean up the URL structure.
- **Server vs. Client components**: Enforce the "Server by Default" principle. Only use Client Components at the leaves of the component tree or when browser interactivity is strictly required.
- **Streaming & Suspense**: Use `loading.tsx` and React Suspense boundaries to improve perceived performance by streaming page content.

### 2. Component Design System
- **Atomic/Feature Design**: Organise components either by "Atomic" units (UI primitives) or "Feature" units (domain-specific logic).
- **Composition**: Prioritize component composition (`children` prop) over complex prop drilling.
- **Next Image & Fonts**: Always use `next/image` for optimized assets and `next/font` for zero-layout-shift typography.

### 3. Data Fetching & Caching
- **Server-side Fetching**: Fetch data directly in Server Components using `async/await`.
- **Request Memoization**: Lean on Next.js automatic request memoization to avoid redundant database/API calls.
- **Caching Strategies**: Use `revalidatePath` and `revalidateTag` for fine-grained cache invalidation.

## Performance Optimization
- **Layout Shift Prevention**: Use aspect ratios for images and reserved spaces for dynamic content.
- **Bundle Size**: Monitor the size of Client Components. Use dynamic imports (`next/dynamic`) for heavy libraries.
- **SEO**: Use the Metadata API (`generateMetadata`) to define titles, descriptions, and OpenGraph tags dynamically.

## Best Practices
- **Strict Linting**: Adhere to the project's ESLint and Prettier configurations.
- **Type Safety**: Propagate TypeScript types from the database (Prisma) through the API layer to the UI components.
- **Error Boundaries**: Implement `error.tsx` at strategic route segments to gracefully handle runtime failures.
