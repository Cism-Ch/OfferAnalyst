"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnalysisResponse } from "@/types";

/**
 * Custom hook for restoring search from history via URL parameters
 *
 * This hook checks URL search parameters for a search to restore and applies it
 * to the dashboard state. It cleans up the URL after itself.
 *
 * @param setters - Object containing setter functions for dashboard state
 */
export function useRestoreSearch(setters: {
  setDomain: (domain: string) => void;
  setExplicitCriteria: (criteria: string) => void;
  setImplicitContext: (context: string) => void;
  setOffersInput: (input: string) => void;
  setResults: (results: AnalysisResponse | null) => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const settersRef = useRef(setters);

  // Update ref when setters change
  useEffect(() => {
    settersRef.current = setters;
  }, [setters]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isRestore = searchParams.get("restore") === "true";
    if (!isRestore) return;

    try {
      const domain = searchParams.get("domain");
      const criteria = searchParams.get("criteria");
      const context = searchParams.get("context");

      if (!domain || !criteria || !context) {
        console.error("[useRestoreSearch] Missing restore parameters");
        return;
      }

      // Restore all inputs
      settersRef.current.setDomain(domain);
      settersRef.current.setExplicitCriteria(criteria);
      settersRef.current.setImplicitContext(context);

      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete("restore");
      url.searchParams.delete("domain");
      url.searchParams.delete("criteria");
      url.searchParams.delete("context");

      router.replace(`${url.pathname}${url.search}`);

      console.log("[useRestoreSearch] Search restored successfully from URL");
    } catch (e) {
      console.error("[useRestoreSearch] Failed to restore search", e);
    }
  }, [searchParams, router]); // Re-run when searchParams change
}
