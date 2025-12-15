"use client"

import { useState, useEffect } from "react"
import { SearchHistoryItem, AnalysisResponse } from "@/types"

const HISTORY_KEY = "offeranalyst_search_history"
const MAX_HISTORY = 5

export function useSearchHistory() {
    const [history, setHistory] = useState<SearchHistoryItem[]>([])

    // Load from local storage on mount
    useEffect(() => {
        if (typeof window === 'undefined') return

        try {
            const stored = window.localStorage.getItem(HISTORY_KEY)
            if (stored) {
                const parsed = JSON.parse(stored)
                console.log("[useSearchHistory] Loaded:", parsed.length, "items")
                setHistory(parsed)
            }
        } catch (e) {
            console.error("[useSearchHistory] Failed to load history", e)
        }
    }, [])



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
    }
}
