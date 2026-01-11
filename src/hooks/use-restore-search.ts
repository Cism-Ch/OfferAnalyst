"use client"

import { useEffect, useRef } from 'react';
import { SearchHistoryItem, AnalysisResponse } from '@/types';

/**
 * Custom hook for restoring search from history
 * 
 * This hook checks sessionStorage for a search to restore and applies it
 * to the dashboard state. It cleans up after itself to prevent re-applying
 * the same search on subsequent renders.
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
    const settersRef = useRef(setters);
    
    // Update ref when setters change
    useEffect(() => {
        settersRef.current = setters;
    }, [setters]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const restoreData = sessionStorage.getItem('restore_search');
            if (restoreData) {
                const item: SearchHistoryItem = JSON.parse(restoreData);
                
                // Validate item structure
                if (!item.inputs || !item.inputs.domain || !item.inputs.criteria || !item.inputs.context) {
                    console.error('[useRestoreSearch] Invalid search item structure');
                    sessionStorage.removeItem('restore_search');
                    return;
                }
                
                // Restore all inputs
                settersRef.current.setDomain(item.inputs.domain);
                settersRef.current.setExplicitCriteria(item.inputs.criteria);
                settersRef.current.setImplicitContext(item.inputs.context);
                
                // Restore results if available and valid
                if (item.results && item.results.topOffers && item.results.topOffers.length > 0) {
                    settersRef.current.setResults(item.results);
                    
                    // Also set the offers input from the results
                    const offersFromResults = item.results.topOffers.map(offer => ({
                        id: offer.id,
                        title: offer.title,
                        description: offer.description,
                        price: offer.price,
                        location: offer.location,
                        category: offer.category
                    }));
                    settersRef.current.setOffersInput(JSON.stringify(offersFromResults, null, 2));
                }
                
                // Clear the restore flag so it doesn't keep restoring
                sessionStorage.removeItem('restore_search');
                
                console.log('[useRestoreSearch] Search restored successfully');
            }
        } catch (e) {
            console.error('[useRestoreSearch] Failed to restore search', e);
            // Clean up corrupted data
            sessionStorage.removeItem('restore_search');
        }
    }, []); // Empty deps - only run once on mount
}
