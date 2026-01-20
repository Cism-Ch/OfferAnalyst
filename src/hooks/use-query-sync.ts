"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook to synchronize React Query cache across browser tabs using BroadcastChannel.
 * When a mutation happens in one tab, it notifies other tabs to invalidate the relevant queries.
 */
export function useQuerySync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = new BroadcastChannel("offer_analyst_sync");

    channel.onmessage = (event) => {
      const { type, queryKeys } = event.data;

      if (type === "INVALIDATE_QUERIES" && queryKeys) {
        console.log(`[useQuerySync] Syncing invalidation for keys:`, queryKeys);
        queryClient.invalidateQueries({ queryKey: queryKeys });
      }
    };

    return () => {
      channel.close();
    };
  }, [queryClient]);

  /**
   * Notify other tabs to invalidate specific query keys.
   */
  const notifySync = (queryKeys: string[]) => {
    const channel = new BroadcastChannel("offer_analyst_sync");
    channel.postMessage({
      type: "INVALIDATE_QUERIES",
      queryKeys,
    });
    channel.close();
  };

  return { notifySync };
}
