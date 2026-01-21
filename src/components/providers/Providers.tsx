"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { useQuerySync } from "@/hooks/use-query-sync";

/**
 * Component that listens for cross-tab sync messages and invalidates queries.
 */
function QuerySyncManager({ children }: { children: React.ReactNode }) {
  useQuerySync(); // Initialize the listener
  return <>{children}</>;
}

/**
 * Providers - Client-side context providers wrapper.
 *
 * Includes:
 * - TanStack Query Client for caching and server-state management.
 * - React Query Devtools for development monitoring.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <QuerySyncManager>{children}</QuerySyncManager>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
