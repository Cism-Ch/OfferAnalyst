"use client"

import { useState, useEffect, useRef } from 'react';
import { AnalysisResponse, ProviderErrorState } from '@/types';
import { DUMMY_OFFERS } from '@/lib/data/dummy-offers';
import { DEFAULT_MODEL_ID } from '@/lib/ai-models';

const DASHBOARD_STATE_KEY = "offeranalyst_dashboard_state";

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
    model: DEFAULT_MODEL_ID
};

/**
 * Custom hook for managing dashboard state with localStorage persistence
 * 
 * This hook centralizes all state management for the dashboard,
 * including user inputs, loading states, and analysis results.
 * All user inputs are persisted to localStorage to maintain state across page reloads.
 * 
 * @returns {Object} Dashboard state and state setters
 */
export function useDashboardState() {
    // Track if localStorage has been loaded to avoid saving during initial load
    const isInitialLoad = useRef(true);

    // Loading states (not persisted)
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [results, setResults] = useState<AnalysisResponse | null>(null);

    // Input states - initialize with default values to ensure server/client consistency
    const [domain, setDomain] = useState(DEFAULT_STATE.domain);
    const [explicitCriteria, setExplicitCriteria] = useState(DEFAULT_STATE.explicitCriteria);
    const [implicitContext, setImplicitContext] = useState(DEFAULT_STATE.implicitContext);
    const [offersInput, setOffersInput] = useState(DEFAULT_STATE.offersInput);
    const [autoFetch, setAutoFetch] = useState(DEFAULT_STATE.autoFetch);
    const [limit, setLimit] = useState(DEFAULT_STATE.limit);
    const [model, setModel] = useState(DEFAULT_STATE.model);

    const [providerError, setProviderError] = useState<ProviderErrorState | null>(null);

    // Load state from localStorage after mount (client-side only) to avoid hydration mismatch
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        try {
            const stored = window.localStorage.getItem(DASHBOARD_STATE_KEY);
            if (stored) {
                const parsed: PersistedDashboardState = JSON.parse(stored);
                
                // Update states with stored values
                if (parsed.domain) setDomain(parsed.domain);
                if (parsed.explicitCriteria) setExplicitCriteria(parsed.explicitCriteria);
                if (parsed.implicitContext) setImplicitContext(parsed.implicitContext);
                if (parsed.offersInput) setOffersInput(parsed.offersInput);
                if (parsed.autoFetch !== undefined) setAutoFetch(parsed.autoFetch);
                if (parsed.limit) setLimit(parsed.limit);
                if (parsed.model) setModel(parsed.model);
                
                console.log("[useDashboardState] State loaded from localStorage");
            }
        } catch (e) {
            console.error("[useDashboardState] Failed to load state from localStorage", e);
        }
        
        // Mark initial load as complete
        isInitialLoad.current = false;
    }, []); // Run only once on mount

    // Save all persisted state to localStorage whenever any value changes
    // Skip saving during initial load from localStorage
    useEffect(() => {
        // Don't save during the initial load phase
        if (isInitialLoad.current) {
            return;
        }

        if (typeof window === 'undefined') return;

        try {
            const state: PersistedDashboardState = {
                domain,
                explicitCriteria,
                implicitContext,
                offersInput,
                autoFetch,
                limit,
                model
            };
            window.localStorage.setItem(DASHBOARD_STATE_KEY, JSON.stringify(state));
            console.log("[useDashboardState] State saved to localStorage");
        } catch (e) {
            console.error("[useDashboardState] Failed to save state", e);
        }
    }, [domain, explicitCriteria, implicitContext, offersInput, autoFetch, limit, model]);

    return {
        // Loading states
        loading,
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
        setProviderError
    };
}
