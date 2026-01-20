---
name: App Routing Setup
description: Specialized skill for advanced routing strategies including Middleware, Parallel Routes, Intercepting Routes, and clean API/Auth route management.
---

# App Routing Setup

This skill focuses on the advanced configuration and optimization of the Next.js routing system to enable complex user flows and secure data access.

## Strategic Routing Patterns

### 1. Advanced Layouts
- **Parallel Routes**: Use `@folder` segments to render multiple pages in the same layout (e.g., dashboards with independent sections).
- **Intercepting Routes**: Use `(.)folder` or `(..)folder` to load a route within the current layout (e.g., opening a photo in a modal without losing context).
- **Conditional Layouts**: Leverage route groups and the `useSelectedLayoutSegment` hook to adjust UI based on the active path.

### 2. Middleware & Security
- **Edge Middleware**: Use `src/middleware.ts` for global concerns like authentication checks, redirects, and A/B testing.
- **Path Matchers**: Use efficient config matchers to avoid running middleware on static assets.
- **Session Protection**: Verify session cookies securely before allowing access to protected route segments.

### 3. API & Auth Routes
- **Route Handlers**: Implement clean API logic in `route.ts` files. 
- **Dynamic Segments**: Use `[slug]` or `[[...catchAll]]` segments for dynamic resource fetching.
- **Shared logic**: Centralize common API logic (validation, error responses) in `@/lib` to avoid duplication across route handlers.

## Routing Optimization
- **Prefetching**: Leverage the `<Link>` component's automatic prefetching to ensure near-instant navigation.
- **Shallow Routing**: Use the `scroll: false` option or client-side context to update parts of the URL without a full page refresh.
- **Metadata Sync**: Ensure that `generateMetadata` correctly reflects the current route segment and its dynamic parameters.

## Best Practices
- **Readable Pathnames**: Keep URLs semantic and descriptive.
- **Canonical URLs**: Use middleware or logic to enforce a single canonical URL structure (e.g., trailing slash handling).
- **Graceful Redirects**: Use `redirect()` or `permanentRedirect()` in Server Components/Actions for predictable navigation.
