"use client";

import { useAnalysis } from '@/contexts/AnalysisContext';

/**
 * Custom hook for managing dashboard state
 * Bridges seamlessly to the global AnalysisContext singleton to maintain
 * cross-page real-time progress, error diagnostics, and persistence.
 */
export function useDashboardState() {
    return useAnalysis();
}

