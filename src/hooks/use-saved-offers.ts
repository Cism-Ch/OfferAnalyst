"use client"

import { useState, useEffect } from "react"
import { Offer } from "@/types"

const STORAGE_KEY = "offeranalyst_saved_offers"

export function useSavedOffers() {
    const [savedOffers, setSavedOffers] = useState<Offer[]>([])

    // Load from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            try {
                setSavedOffers(JSON.parse(stored))
            } catch (e) {
                console.error("Failed to parse saved offers", e)
            }
        }
    }, [])

    // Save to local storage whenever state changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedOffers))
    }, [savedOffers])

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
        isSaved,
    }
}
