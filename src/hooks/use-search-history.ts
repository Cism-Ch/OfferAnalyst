"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SearchHistoryItem, AnalysisResponse } from "@/types";
import { useSession } from "@/lib/auth-client";
import {
  saveSearchHistoryAction,
  getUserSearchHistoryAction,
  togglePinSearchAction,
  deleteSearchHistoryAction,
  clearSearchHistoryAction,
  migrateGuestSearchesAction,
} from "@/app/actions/db/history";

export const GUEST_HISTORY_KEY = "offeranalyst_guest_search_history";
export const LEGACY_HISTORY_KEY = "offeranalyst_search_history";
export const GUEST_RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days TTL
const MAX_HISTORY = 50;

/**
 * Filter out guest history items that have exceeded their 7-day TTL.
 */
export function purgeExpiredGuestItems(items: SearchHistoryItem[]): SearchHistoryItem[] {
  const now = Date.now();
  return items.filter((item) => {
    // If expiresAt is set, ensure it is in the future.
    if (typeof item.expiresAt === "number") {
      return item.expiresAt > now;
    }
    // If expiresAt was not set, infer from timestamp + 7 days
    if (typeof item.timestamp === "number") {
      return item.timestamp + GUEST_RETENTION_MS > now;
    }
    return true;
  });
}

/**
 * Read guest items from localStorage, migrating from legacy key if needed and purging expired entries.
 */
function readGuestHistory(): SearchHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const guestStored = window.localStorage.getItem(GUEST_HISTORY_KEY);
    const legacyStored = window.localStorage.getItem(LEGACY_HISTORY_KEY);

    let parsed: SearchHistoryItem[] = [];
    if (guestStored) {
      parsed = JSON.parse(guestStored);
    } else if (legacyStored) {
      parsed = JSON.parse(legacyStored);
    }

    if (!Array.isArray(parsed)) return [];

    // Attach expiresAt if missing
    const enriched = parsed.map((item) => ({
      ...item,
      expiresAt: item.expiresAt || item.timestamp + GUEST_RETENTION_MS,
    }));

    // Purge expired entries
    const valid = purgeExpiredGuestItems(enriched);

    // Save cleaned list to current guest storage key
    window.localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(valid));
    return valid;
  } catch (error) {
    console.error("[useSearchHistory] Error reading guest history:", error);
    return [];
  }
}

/**
 * Save guest items to localStorage.
 */
function writeGuestHistory(items: SearchHistoryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    const valid = purgeExpiredGuestItems(items);
    window.localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(valid));
  } catch (error) {
    console.error("[useSearchHistory] Error writing guest history:", error);
  }
}

/**
 * Transform MongoDB Prisma SearchHistory model to frontend SearchHistoryItem
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbRecordToItem(dbRecord: any): SearchHistoryItem {
  return {
    id: dbRecord.id,
    timestamp: new Date(dbRecord.timestamp).getTime(),
    inputs: {
      domain: dbRecord.domain,
      criteria: dbRecord.criteria,
      context: dbRecord.implicitContext || "",
    },
    results: {
      marketSummary: "",
      topOffers: [],
      searchSources: [],
      totalAnalyzed: dbRecord.resultCount || 0,
      modelUsed: dbRecord.model || "default",
    },
    pinned: !!dbRecord.isPinned,
    model: dbRecord.model || "default",
    resultCount: dbRecord.resultCount || 0,
  };
}

export function useSearchHistory() {
  const { data: session, isPending: isSessionPending } = useSession();
  const isAuthenticated = !!session?.user?.id;

  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const migrationTriggeredRef = useRef(false);
  const isInitialLoadRef = useRef(true);

  // Load history from appropriate source (Guest vs Cloud)
  const refreshHistory = useCallback(async () => {
    try {
      if (isAuthenticated) {
        // Authenticated: fetch from MongoDB Atlas
        const res = await getUserSearchHistoryAction({ limit: MAX_HISTORY });
        if (res.success && Array.isArray(res.data)) {
          const mapped = res.data.map(mapDbRecordToItem);
          setHistory(mapped);
        } else if (!res.success) {
          console.error("[useSearchHistory] Cloud history fetch failed:", res.error);
        }
      } else {
        // Guest: fetch from localStorage and auto-purge expired entries
        const guestItems = readGuestHistory();
        setHistory(guestItems);
      }
    } catch (e) {
      console.error("[useSearchHistory] Failed to load history:", e);
    } finally {
      setIsLoading(false);
      isInitialLoadRef.current = false;
    }
  }, [isAuthenticated]);

  // Initial load once session status is resolved (deferred to avoid hydration mismatch and cascading renders)
  useEffect(() => {
    if (isSessionPending) return;
    const timer = setTimeout(() => {
      void refreshHistory();
    }, 0);
    return () => clearTimeout(timer);
  }, [isSessionPending, refreshHistory]);

  // Session transition: Automatically migrate guest history to cloud upon login / registration
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isAuthenticated && !migrationTriggeredRef.current) {
      try {
        const guestStored = window.localStorage.getItem(GUEST_HISTORY_KEY) || window.localStorage.getItem(LEGACY_HISTORY_KEY);
        if (guestStored) {
          const rawItems: SearchHistoryItem[] = JSON.parse(guestStored);
          const validItems = purgeExpiredGuestItems(rawItems);

          if (validItems.length > 0) {
            migrationTriggeredRef.current = true;
            const payload = validItems.map((item) => ({
              domain: item.inputs.domain,
              criteria: item.inputs.criteria,
              implicitContext: item.inputs.context,
              model: item.results?.modelUsed || "default",
              resultCount: item.results?.topOffers?.length || item.results?.totalAnalyzed || 0,
              timestamp: item.timestamp,
              isPinned: !!item.pinned,
              expiresAt: item.expiresAt,
            }));

            migrateGuestSearchesAction(payload)
              .then((result) => {
                if (result.success) {
                  // Clean up local guest storage now that cloud holds the source of truth
                  window.localStorage.removeItem(GUEST_HISTORY_KEY);
                  window.localStorage.removeItem(LEGACY_HISTORY_KEY);
                  // Refresh history to include merged cloud records
                  refreshHistory();
                }
              })
              .catch((err) => {
                console.error("[useSearchHistory] Auto-migration error:", err);
              });
          }
        }
      } catch (err) {
        console.error("[useSearchHistory] Failed to check guest items for migration:", err);
      }
    }
  }, [isAuthenticated, refreshHistory]);

  // Save guest history to localStorage when state changes (for guest users only)
  useEffect(() => {
    if (isInitialLoadRef.current || isAuthenticated || typeof window === "undefined") {
      return;
    }
    writeGuestHistory(history);
  }, [history, isAuthenticated]);

  /**
   * Add a new completed search to history (Guest: localStorage with 7d TTL; Auth: MongoDB Atlas)
   */
  const addToHistory = useCallback(
    async (
      inputs: { domain: string; criteria: string; context: string },
      results: AnalysisResponse,
      model?: string
    ) => {
      const now = Date.now();
      const modelUsed = model || results.modelUsed || "default";
      const resultCount = results.topOffers?.length || results.totalAnalyzed || 0;

      const newItem: SearchHistoryItem = {
        id: crypto.randomUUID(),
        timestamp: now,
        inputs,
        results,
        pinned: false,
        expiresAt: now + GUEST_RETENTION_MS,
      };

      // Optimistic state update
      setHistory((prev) => {
        const pinnedItems = prev.filter((item) => item.pinned);
        let unpinnedItems = prev.filter((item) => !item.pinned);
        unpinnedItems = [newItem, ...unpinnedItems];
        if (unpinnedItems.length > MAX_HISTORY) {
          unpinnedItems = unpinnedItems.slice(0, MAX_HISTORY);
        }
        return [...pinnedItems, ...unpinnedItems].sort((a, b) => b.timestamp - a.timestamp);
      });

      if (isAuthenticated) {
        // Persist to MongoDB Atlas via Server Action
        try {
          const actionRes = await saveSearchHistoryAction({
            domain: inputs.domain,
            criteria: inputs.criteria,
            implicitContext: inputs.context,
            model: modelUsed,
            resultCount,
          });

          if (actionRes.success && actionRes.data?.id) {
            // Replace temporary UUID with real MongoDB ObjectID
            const dbId = actionRes.data.id;
            setHistory((prev) =>
              prev.map((item) => (item.id === newItem.id ? { ...item, id: dbId } : item))
            );
          }
        } catch (err) {
          console.error("[useSearchHistory] Failed to save search history to cloud DB:", err);
        }
      }
    },
    [isAuthenticated]
  );

  /**
   * Toggle pin status (Guest: localStorage; Auth: MongoDB Atlas)
   */
  const togglePin = useCallback(
    async (id: string) => {
      let targetPinned = false;
      setHistory((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            targetPinned = !item.pinned;
            return { ...item, pinned: targetPinned };
          }
          return item;
        })
      );

      if (isAuthenticated) {
        try {
          const res = await togglePinSearchAction(id, targetPinned);
          if (!res.success) {
            console.error("[useSearchHistory] Failed to toggle pin in cloud:", res.error);
            // Revert on error
            setHistory((prev) =>
              prev.map((item) => (item.id === id ? { ...item, pinned: !targetPinned } : item))
            );
          }
        } catch (err) {
          console.error("[useSearchHistory] Error in togglePin:", err);
        }
      }
    },
    [isAuthenticated]
  );

  /**
   * Delete an item from history (Guest: localStorage; Auth: MongoDB Atlas)
   */
  const deleteItem = useCallback(
    async (id: string) => {
      let removedItem: SearchHistoryItem | undefined;
      setHistory((prev) => {
        removedItem = prev.find((item) => item.id === id);
        return prev.filter((item) => item.id !== id);
      });

      if (isAuthenticated) {
        try {
          const res = await deleteSearchHistoryAction(id);
          if (!res.success) {
            console.error("[useSearchHistory] Failed to delete search in cloud:", res.error);
            // Restore removed item on error
            if (removedItem) {
              setHistory((prev) => [...prev, removedItem!]);
            }
          }
        } catch (err) {
          console.error("[useSearchHistory] Error in deleteItem:", err);
        }
      }
    },
    [isAuthenticated]
  );

  /**
   * Clear unpinned search history (Guest: localStorage; Auth: MongoDB Atlas)
   */
  const clearHistory = useCallback(async () => {
    let unpinnedBackup: SearchHistoryItem[] = [];
    setHistory((prev) => {
      unpinnedBackup = prev.filter((item) => !item.pinned);
      return prev.filter((item) => item.pinned);
    });

    if (isAuthenticated) {
      try {
        const res = await clearSearchHistoryAction();
        if (!res.success) {
          console.error("[useSearchHistory] Failed to clear cloud history:", res.error);
          // Restore unpinned items on error
          setHistory((prev) => [...prev, ...unpinnedBackup]);
        }
      } catch (err) {
        console.error("[useSearchHistory] Error in clearHistory:", err);
      }
    }
  }, [isAuthenticated]);

  return {
    history,
    addToHistory,
    togglePin,
    deleteItem,
    clearHistory,
    isLoading: isLoading || isSessionPending,
    isAuthenticated,
    isCloudSync: isAuthenticated,
    refreshHistory,
  };
}

export default useSearchHistory;
