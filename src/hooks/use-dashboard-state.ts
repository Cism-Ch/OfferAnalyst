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
    // Track if this is the first render to avoid saving initial loaded state
    const isFirstRender = useRef(true);

    // Loading states (not persisted)
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [results, setResults] = useState<AnalysisResponse | null>(null);

    // Input states with lazy initialization from localStorage
    const [domain, setDomain] = useState(() => {
        if (typeof window === 'undefined') return DEFAULT_STATE.domain;
        try {
            const stored = window.localStorage.getItem(DASHBOARD_STATE_KEY);
            if (stored) {
                const parsed: PersistedDashboardState = JSON.parse(stored);
                return parsed.domain || DEFAULT_STATE.domain;
            }
        } catch (e) {
            console.error("[useDashboardState] Failed to load domain", e);
        }
        return DEFAULT_STATE.domain;
    });

    const [explicitCriteria, setExplicitCriteria] = useState(() => {
        if (typeof window === 'undefined') return DEFAULT_STATE.explicitCriteria;
        try {
            const stored = window.localStorage.getItem(DASHBOARD_STATE_KEY);
            if (stored) {
                const parsed: PersistedDashboardState = JSON.parse(stored);
                return parsed.explicitCriteria || DEFAULT_STATE.explicitCriteria;
            }
        } catch (e) {
            console.error("[useDashboardState] Failed to load explicitCriteria", e);
        }
        return DEFAULT_STATE.explicitCriteria;
    });

    const [implicitContext, setImplicitContext] = useState(() => {
        if (typeof window === 'undefined') return DEFAULT_STATE.implicitContext;
        try {
            const stored = window.localStorage.getItem(DASHBOARD_STATE_KEY);
            if (stored) {
                const parsed: PersistedDashboardState = JSON.parse(stored);
                return parsed.implicitContext || DEFAULT_STATE.implicitContext;
            }
        } catch (e) {
            console.error("[useDashboardState] Failed to load implicitContext", e);
        }
        return DEFAULT_STATE.implicitContext;
    });

    const [offersInput, setOffersInput] = useState(() => {
        if (typeof window === 'undefined') return DEFAULT_STATE.offersInput;
        try {
            const stored = window.localStorage.getItem(DASHBOARD_STATE_KEY);
            if (stored) {
                const parsed: PersistedDashboardState = JSON.parse(stored);
                return parsed.offersInput || DEFAULT_STATE.offersInput;
            }
        } catch (e) {
            console.error("[useDashboardState] Failed to load offersInput", e);
        }
        return DEFAULT_STATE.offersInput;
    });

    const [autoFetch, setAutoFetch] = useState(() => {
        if (typeof window === 'undefined') return DEFAULT_STATE.autoFetch;
        try {
            const stored = window.localStorage.getItem(DASHBOARD_STATE_KEY);
            if (stored) {
                const parsed: PersistedDashboardState = JSON.parse(stored);
                return parsed.autoFetch ?? DEFAULT_STATE.autoFetch;
            }
        } catch (e) {
            console.error("[useDashboardState] Failed to load autoFetch", e);
        }
        return DEFAULT_STATE.autoFetch;
    });

    const [limit, setLimit] = useState(() => {
        if (typeof window === 'undefined') return DEFAULT_STATE.limit;
        try {
            const stored = window.localStorage.getItem(DASHBOARD_STATE_KEY);
            if (stored) {
                const parsed: PersistedDashboardState = JSON.parse(stored);
                return parsed.limit || DEFAULT_STATE.limit;
            }
        } catch (e) {
            console.error("[useDashboardState] Failed to load limit", e);
        }
        return DEFAULT_STATE.limit;
    });

    const [model, setModel] = useState(() => {
        if (typeof window === 'undefined') return DEFAULT_STATE.model;
        try {
            const stored = window.localStorage.getItem(DASHBOARD_STATE_KEY);
            if (stored) {
                const parsed: PersistedDashboardState = JSON.parse(stored);
                return parsed.model || DEFAULT_STATE.model;
            }
        } catch (e) {
            console.error("[useDashboardState] Failed to load model", e);
        }
        return DEFAULT_STATE.model;
    });

    const [providerError, setProviderError] = useState<ProviderErrorState | null>(null);

    // Save all persisted state to localStorage whenever any value changes (skip first render)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
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
