"use client"

import { useState, useEffect, useRef } from "react"
import { SearchHistoryItem, AnalysisResponse } from "@/types"

const HISTORY_KEY = "offeranalyst_search_history"
const MAX_HISTORY = 50 // Increased from 5 to allow more search history

export function useSearchHistory() {
    // Track if localStorage has been loaded to avoid saving during initial load
    const isInitialLoad = useRef(true);
    const [isLoading, setIsLoading] = useState(true);
    
    // Initialize with empty array to ensure server/client consistency
    const [history, setHistory] = useState<SearchHistoryItem[]>([]);

    // Load from localStorage after mount (client-side only) to avoid hydration mismatch
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        try {
            const stored = window.localStorage.getItem(HISTORY_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // This is intentional to prevent hydration errors - we load from localStorage after mount
                setHistory(parsed);
                console.log("[useSearchHistory] Loaded:", parsed.length, "items");
            }
        } catch (e) {
            console.error("[useSearchHistory] Failed to load history", e);
        } finally {
            setIsLoading(false);
        }
        
        // Mark initial load as complete
        isInitialLoad.current = false;
    }, []);

    // Save to localStorage whenever history changes (skip initial load)
    useEffect(() => {
        // Don't save during the initial load phase
        if (isInitialLoad.current) {
            return;
        }
        
        if (typeof window === 'undefined') return;
        
        try {
            window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        } catch (e) {
            console.error("[useSearchHistory] Failed to save history", e);
        }
    }, [history]);



    const addToHistory = (
        inputs: { domain: string; criteria: string; context: string },
        results: AnalysisResponse
    ) => {
        setHistory((prev) => {
            const newItem: SearchHistoryItem = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                inputs,
                results,
                pinned: false,
            }

            // Separate pinned and unpinned
            const pinnedItems = prev.filter((item) => item.pinned)
            let unpinnedItems = prev.filter((item) => !item.pinned)

            // Add new item to unpinned
            unpinnedItems = [newItem, ...unpinnedItems]

            // Enforce limit on unpinned items
            if (unpinnedItems.length > MAX_HISTORY) {
                unpinnedItems = unpinnedItems.slice(0, MAX_HISTORY)
            }

            // Recombine
            return [...pinnedItems, ...unpinnedItems].sort((a, b) => b.timestamp - a.timestamp)
        })
    }

    const togglePin = (id: string) => {
        setHistory((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, pinned: !item.pinned } : item
            )
        )
    }

    const deleteItem = (id: string) => {
        setHistory((prev) => prev.filter((item) => item.id !== id))
    }

    const clearHistory = () => {
        // Only clear unpinned items
        setHistory((prev) => prev.filter((item) => item.pinned))
    }

    return {
        history,
        addToHistory,
        togglePin,
        deleteItem,
        clearHistory,
        isLoading,
    }
}
