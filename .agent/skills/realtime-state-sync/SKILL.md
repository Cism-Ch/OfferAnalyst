---
name: Realtime & State Sync
description: Specialized skill for TanStack Query synchronization, Optimistic UI updates with MongoDB, and handling serverless state consistency.
---

# Realtime & State Sync

This skill ensures that the application feels responsive and stay synchronized with the MongoDB backend by managing server state with TanStack Query and implementing fluid optimistic transitions.

## Data Synchronization (TanStack Query)

### 1. Unified Server State
- **Query Keys**: Use consistent, hierarchical query keys (e.g., `['offers']`, `['offers', id]`) to enable precise cache invalidation.
- **Auto-Refetching**: Configure `refetchOnWindowFocus` and `staleTime` based on the data's volatility.
- **Prefetching**: Prefetch critical data in Server Components or on hover to reduce perceived latency.

### 2. Pseudo-Realtime Strategies
Since MongoDB is used in a serverless environment (Next.js/Prisma) without persistent sockets:
- **Smart Polling**: Use `refetchInterval` for dashboard metrics that need to appear live.
- **Manual Invalidation**: Explicitly call `queryClient.invalidateQueries` after successful mutations in Server Actions or API routes.
- **Cross-Tab Sync**: Ensure state is synchronized across multiple tabs using TanStack Query's broadcast features if necessary.

## Optimistic UI Updates

### 1. Mutation Logic
- **onMutate**: Immediately update the local cache with the expected result of a mutation.
- **onError**: Implement robust rollback logic using the `context` returned from `onMutate` to restore the previous cache state if the DB update fails.
- **onSettled**: Always refetch or invalidate to ensure the client is in sync with the source of truth (MongoDB).

### 2. Loading & Sync Indicators
- **Nuanced Feedback**: Use opacity changes or "syncing" badges during optimistic updates instead of heavy blocking loaders.
- **Global Indicators**: Use a global `isFetching` or `isMutating` state for subtle background sync indicators.

## Best Practices
- **Persistence Layer**: Consider `persistQueryClient` for maintaining state across page reloads in a local storage/DB.
- **Error Boundaries**: Wrap data-intensive zones with Error Boundaries to handle sync failures gracefully.
- **Data Shape consistency**: Ensure the Zod schemas used for validation match the data returned by Prisma and expected by TanStack Query.
