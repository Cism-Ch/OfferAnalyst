"use client"

import { useState, useEffect, useRef } from "react"
import { Offer } from "@/types"

const STORAGE_KEY = "offeranalyst_saved_offers"

export function useSavedOffers() {
    // Track if this is the first render to avoid saving initial loaded state
    const isFirstRender = useRef(true);

    // Use lazy initialization to load from localStorage without useEffect setState
    const [savedOffers, setSavedOffers] = useState<Offer[]>(() => {
        if (typeof window === 'undefined') return [];

        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                console.log("[useSavedOffers] Loaded:", parsed.length, "saved offers");
                return parsed;
            }
        } catch (e) {
            console.error("[useSavedOffers] Failed to load saved offers", e);
        }

        return [];
    });

    // Save to localStorage whenever savedOffers changes (skip first render)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
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
