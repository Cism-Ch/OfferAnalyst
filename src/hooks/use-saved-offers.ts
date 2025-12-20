"use client"

import { useState, useEffect, useRef } from "react"
import { Offer } from "@/types"

const STORAGE_KEY = "offeranalyst_saved_offers"

export function useSavedOffers() {
    // Track if localStorage has been loaded to avoid saving during initial load
    const isInitialLoad = useRef(true);

    // Initialize with empty array to ensure server/client consistency
    const [savedOffers, setSavedOffers] = useState<Offer[]>([]);

    // Load from localStorage after mount (client-side only) to avoid hydration mismatch
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setSavedOffers(parsed);
                console.log("[useSavedOffers] Loaded:", parsed.length, "saved offers");
            }
        } catch (e) {
            console.error("[useSavedOffers] Failed to load saved offers", e);
        }

        // Mark initial load as complete
        isInitialLoad.current = false;
    }, []);

    // Save to localStorage whenever savedOffers changes (skip initial load)
    useEffect(() => {
        // Don't save during the initial load phase
        if (isInitialLoad.current) {
            return;
        }

        if (typeof window === 'undefined') return;

        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedOffers));
            console.log("[useSavedOffers] Saved:", savedOffers.length, "offers");
        } catch (e) {
            console.error("[useSavedOffers] Failed to save offers", e);
        }
    }, [savedOffers]);

    const saveOffer = (offer: Offer) => {
        setSavedOffers((prev) => {
            if (prev.some((o) => o.id === offer.id)) return prev
            return [...prev, { ...offer, savedAt: new Date().toISOString() }]
        })
    }

    const removeOffer = (id: string) => {
        setSavedOffers((prev) => prev.filter((o) => o.id !== id))
    }

    const isSaved = (id: string) => {
        return savedOffers.some((o) => o.id === id)
    }

    return {
        savedOffers,
        saveOffer,
        removeOffer,
        isSaved
    }
}
