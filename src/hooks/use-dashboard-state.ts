"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AnalysisResponse, ProviderErrorState } from "@/types";
import { ApiResponse } from "@/types/api";
import { DUMMY_OFFERS } from "@/lib/data/dummy-offers";
import { DEFAULT_MODEL_ID } from "@/lib/ai-models";
import { DashboardState } from "@/lib/db/schemas";
import { useQuerySync } from "./use-query-sync";

const DASHBOARD_STATE_KEY = "offeranalyst_dashboard_state";
const DASHBOARD_QUERY_KEY = ["dashboard_state"];

interface PersistedDashboardState {
  domain: string;
  explicitCriteria: string;
  implicitContext: string;
  offersInput: string;
  autoFetch: boolean;
  limit: string;
  model: string;
}

const DEFAULT_STATE: PersistedDashboardState = {
  domain: "Jobs",
  explicitCriteria: "Salary > 100k, Remote or Hybrid",
  implicitContext: "Looking for good work-life balance, startup culture",
  offersInput: JSON.stringify(DUMMY_OFFERS, null, 2),
  autoFetch: false,
  limit: "3",
  model: DEFAULT_MODEL_ID,
};

/**
 * Custom hook for managing dashboard state with MongoDB & localStorage persistence
 */
export function useDashboardState() {
  const { notifySync } = useQuerySync();
  const isInitialLoad = useRef(true);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Loading states (not persisted)
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [providerError, setProviderError] = useState<ProviderErrorState | null>(
    null,
  );

  // Input states (Local state for immediate UI feedback)
  const [domain, setDomain] = useState(DEFAULT_STATE.domain);
  const [explicitCriteria, setExplicitCriteria] = useState(
    DEFAULT_STATE.explicitCriteria,
  );
  const [implicitContext, setImplicitContext] = useState(
    DEFAULT_STATE.implicitContext,
  );
  const [offersInput, setOffersInput] = useState(DEFAULT_STATE.offersInput);
  const [autoFetch, setAutoFetch] = useState(DEFAULT_STATE.autoFetch);
  const [limit, setLimit] = useState(DEFAULT_STATE.limit);
  const [model, setModel] = useState(DEFAULT_STATE.model);

  // 1. Fetch cloud state
  const { data: cloudResponse, isLoading: isLoadingCloud } = useQuery<
    ApiResponse<DashboardState>
  >({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (!res.ok)
        throw new Error(
          json.error?.message || "Failed to fetch dashboard state",
        );
      return json;
    },
  });

  const cloudState = cloudResponse?.data;

  // 2. Save to cloud mutation
  const saveMutation = useMutation({
    mutationFn: async (state: PersistedDashboardState) => {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(
          json.error?.message || "Failed to save dashboard state",
        );
      return json;
    },
    onSuccess: () => {
      console.log("[useDashboardState] Cloud sync successful");
      notifySync(DASHBOARD_QUERY_KEY);
    },
  });

  // 3. Hydration & Migration Logic
  useEffect(() => {
    if (isLoadingCloud) return;

    if (cloudState) {
      // Priority 1: Use cloud state if available
      // We use functional updates or separate logic if needed, but here it's fine as long as dependencies are stable
      // However, to fix the specific "synchronous setState" warning if it persists, ensure this effect is purely for synchronization

      // To be safe and clean, we just set them. The warning might be due to render cycles.
      // Let's verify if we need to check values before setting to avoid loops.
      const s = cloudState;
      setDomain((prev) =>
        prev !== s.domain ? s.domain || DEFAULT_STATE.domain : prev,
      );
      setExplicitCriteria((prev) =>
        prev !== s.explicitCriteria ? s.explicitCriteria || "" : prev,
      );
      setImplicitContext((prev) =>
        prev !== s.implicitContext ? s.implicitContext || "" : prev,
      );
      setOffersInput((prev) =>
        prev !== s.offersInput ? s.offersInput || "" : prev,
      );
      setAutoFetch((prev) =>
        prev !== s.autoFetch ? (s.autoFetch ?? DEFAULT_STATE.autoFetch) : prev,
      );
      setLimit((prev) =>
        prev !== s.limit ? s.limit || DEFAULT_STATE.limit : prev,
      );
      setModel((prev) =>
        prev !== s.model ? s.model || DEFAULT_STATE.model : prev,
      );

      console.log("[useDashboardState] State hydrated from MongoDB");

      // Mark initial load as complete AFTER hydration to prevent immediate re-sync
      setTimeout(() => {
        isInitialLoad.current = false;
      }, 0);
    } else if (typeof window !== "undefined") {
      // Priority 2: Try localStorage migration
      try {
        const stored = window.localStorage.getItem(DASHBOARD_STATE_KEY);
        if (stored) {
          const parsed: PersistedDashboardState = JSON.parse(stored);
          setDomain(parsed.domain || DEFAULT_STATE.domain);
          setExplicitCriteria(parsed.explicitCriteria || "");
          setImplicitContext(parsed.implicitContext || "");
          setOffersInput(parsed.offersInput || "");
          setAutoFetch(parsed.autoFetch ?? DEFAULT_STATE.autoFetch);
          setLimit(parsed.limit || DEFAULT_STATE.limit);
          setModel(parsed.model || DEFAULT_STATE.model);

          console.log(
            "[useDashboardState] State migrated from localStorage to MongoDB",
          );
          // Trigger immediate save to cloud
          saveMutation.mutate(parsed);
        }
      } catch (e) {
        console.error("[useDashboardState] Fail to migrate localStorage", e);
      }
      isInitialLoad.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudState, isLoadingCloud]);

  // 4. Persistence Effect (Debounced Cloud Sync + LocalStorage backup)
  useEffect(() => {
    if (isInitialLoad.current || isLoadingCloud) return;

    const currentState: PersistedDashboardState = {
      domain,
      explicitCriteria,
      implicitContext,
      offersInput,
      autoFetch,
      limit,
      model,
    };

    // Update localStorage immediately (backup)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        DASHBOARD_STATE_KEY,
        JSON.stringify(currentState),
      );
    }

    // Debounce cloud sync (1 second)
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      saveMutation.mutate(currentState);
    }, 1000);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [
    domain,
    explicitCriteria,
    implicitContext,
    offersInput,
    autoFetch,
    limit,
    model,
    saveMutation,
    isLoadingCloud,
  ]);

  return {
    // Loading states
    loading: loading || isLoadingCloud,
    setLoading,
    fetching,
    setFetching,
    results,
    setResults,

    // Input states
    domain,
    setDomain,
    explicitCriteria,
    setExplicitCriteria,
    implicitContext,
    setImplicitContext,
    offersInput,
    setOffersInput,

    // Orchestration controls
    autoFetch,
    setAutoFetch,
    limit,
    setLimit,
    model,
    setModel,
    providerError,
    setProviderError,
  };
}
