import { useState } from 'react';
import { AnalysisResponse } from '@/types';
import { DUMMY_OFFERS } from '../constants/dummy-offers';

/**
 * Custom hook for managing dashboard state
 * 
 * This hook centralizes all state management for the dashboard,
 * including user inputs, loading states, and analysis results.
 * 
 * @returns {Object} Dashboard state and state setters
 */
export function useDashboardState() {
    // Loading states
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [results, setResults] = useState<AnalysisResponse | null>(null);

    // Input states
    const [domain, setDomain] = useState("Jobs");
    const [explicitCriteria, setExplicitCriteria] = useState("Salary > 100k, Remote or Hybrid");
    const [implicitContext, setImplicitContext] = useState("Looking for good work-life balance, startup culture");
    const [offersInput, setOffersInput] = useState(JSON.stringify(DUMMY_OFFERS, null, 2));

    // Orchestration controls
    const [autoFetch, setAutoFetch] = useState(false);
    const [limit, setLimit] = useState("3");

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
        setLimit
    };
}
