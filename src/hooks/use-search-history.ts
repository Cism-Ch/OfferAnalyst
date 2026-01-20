"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SearchHistoryItem, AnalysisResponse } from "@/types";
import { ApiResponse } from "@/types/api";
import { useEffect } from "react";
import { useQuerySync } from "./use-query-sync";
import { toast } from "sonner";

const HISTORY_KEY = "offeranalyst_search_history";
const HISTORY_QUERY_KEY = ["history"];

export function useSearchHistory() {
  const queryClient = useQueryClient();
  const { notifySync } = useQuerySync();

  const { data: historyResponse, isLoading } = useQuery<
    ApiResponse<SearchHistoryItem[]>
  >({
    queryKey: HISTORY_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch("/api/history");
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error?.message || "Failed to fetch history");
      return data;
    },
  });

  const history = historyResponse?.data || [];

  const addMutation = useMutation({
    mutationFn: async (item: SearchHistoryItem) => {
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error?.message || "Failed to save history");
      return data;
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: HISTORY_QUERY_KEY });
      const previousHistory =
        queryClient.getQueryData<ApiResponse<SearchHistoryItem[]>>(
          HISTORY_QUERY_KEY,
        );

      if (previousHistory?.data) {
        queryClient.setQueryData<ApiResponse<SearchHistoryItem[]>>(
          HISTORY_QUERY_KEY,
          {
            ...previousHistory,
            data: [newItem, ...previousHistory.data],
          },
        );
      }

      return { previousHistory };
    },
    onError: (err, newItem, context) => {
      if (context?.previousHistory) {
        queryClient.setQueryData(HISTORY_QUERY_KEY, context.previousHistory);
      }
      toast.error(err.message || "Failed to save history");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/history?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error?.message || "Failed to delete history item");
      return data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: HISTORY_QUERY_KEY });
      const previousHistory =
        queryClient.getQueryData<ApiResponse<SearchHistoryItem[]>>(
          HISTORY_QUERY_KEY,
        );

      if (previousHistory?.data) {
        queryClient.setQueryData<ApiResponse<SearchHistoryItem[]>>(
          HISTORY_QUERY_KEY,
          {
            ...previousHistory,
            data: previousHistory.data.filter((h) => h.id !== id),
          },
        );
      }

      return { previousHistory };
    },
    onError: (err, id, context) => {
      if (context?.previousHistory) {
        queryClient.setQueryData(HISTORY_QUERY_KEY, context.previousHistory);
      }
      toast.error(err.message || "Failed to delete history item");
    },
    onSuccess: () => {
      toast.success("History item deleted");
      notifySync(HISTORY_QUERY_KEY);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY });
    },
  });

  const pinMutation = useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const res = await fetch("/api/history", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pinned }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error?.message || "Failed to update pin state");
      return data;
    },
    onMutate: async ({ id, pinned }) => {
      await queryClient.cancelQueries({ queryKey: HISTORY_QUERY_KEY });
      const previousHistory =
        queryClient.getQueryData<ApiResponse<SearchHistoryItem[]>>(
          HISTORY_QUERY_KEY,
        );

      if (previousHistory?.data) {
        queryClient.setQueryData<ApiResponse<SearchHistoryItem[]>>(
          HISTORY_QUERY_KEY,
          {
            ...previousHistory,
            data: previousHistory.data.map((h) =>
              h.id === id ? { ...h, pinned } : h,
            ),
          },
        );
      }

      return { previousHistory };
    },
    onError: (err, variables, context) => {
      if (context?.previousHistory) {
        queryClient.setQueryData(HISTORY_QUERY_KEY, context.previousHistory);
      }
      toast.error(err.message || "Failed to pin/unpin history");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY });
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/history?clear=true", {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error?.message || "Failed to clear history");
      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: HISTORY_QUERY_KEY });
      const previousHistory =
        queryClient.getQueryData<ApiResponse<SearchHistoryItem[]>>(
          HISTORY_QUERY_KEY,
        );

      if (previousHistory) {
        queryClient.setQueryData<ApiResponse<SearchHistoryItem[]>>(
          HISTORY_QUERY_KEY,
          {
            ...previousHistory,
            data: [],
          },
        );
      }

      return { previousHistory };
    },
    onError: (err, variables, context) => {
      if (context?.previousHistory) {
        queryClient.setQueryData(HISTORY_QUERY_KEY, context.previousHistory);
      }
      toast.error(err.message || "Failed to clear history");
    },
    onSuccess: () => {
      toast.success("History cleared");
      notifySync(HISTORY_QUERY_KEY);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY });
    },
  });

  const addToHistory = (
    inputs: { domain: string; criteria: string; context: string },
    results: AnalysisResponse,
  ) => {
    const newItem: Partial<SearchHistoryItem> = {
      timestamp: Date.now(),
      inputs,
      results,
      pinned: false,
    };
    addMutation.mutate(newItem as SearchHistoryItem);
  };

  // Migration logic
  useEffect(() => {
    if (typeof window === "undefined") return;

    const localData = window.localStorage.getItem(HISTORY_KEY);
    if (localData) {
      try {
        const parsed: SearchHistoryItem[] = JSON.parse(localData);
        if (parsed.length > 0) {
          console.log(
            `[useSearchHistory] Migrating ${parsed.length} history items...`,
          );
          Promise.all(parsed.map((item) => addMutation.mutateAsync(item))).then(
            () => {
              window.localStorage.removeItem(HISTORY_KEY);
            },
          );
        } else {
          window.localStorage.removeItem(HISTORY_KEY);
        }
      } catch (e) {
        console.error("Failed to parse history from localStorage", e);
        window.localStorage.removeItem(HISTORY_KEY);
      }
    }
  }, [addMutation]);

  const togglePin = (id: string) => {
    const item = history.find((h) => h.id === id);
    if (item) {
      pinMutation.mutate({ id, pinned: !item.pinned });
    }
  };

  const deleteItem = (id: string) => {
    deleteMutation.mutate(id);
  };

  const clearHistory = () => {
    clearMutation.mutate();
  };

  return {
    history,
    addToHistory,
    togglePin,
    deleteItem,
    clearHistory,
    isLoading,
  };
}
