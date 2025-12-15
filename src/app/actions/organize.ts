'use server';

import { GoogleGenAI } from "@google/genai";
import { Offer } from "@/types";

const MODEL_NAME = "gemma-2-27b-it";

export interface OrganizedOffers {
    categories: {
        name: string;
        offers: Offer[];
    }[];
    timeline: {
        date: string;
        offers: Offer[];
    }[];
}

export async function organizeOffersAction(
    offers: Offer[]
): Promise<OrganizedOffers> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY not found");
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
    You are an Intelligent Offer Organizer.
    
    GOAL:
    Take the provided list of Offers and organize them into two views:
    1. **Categories**: Group by logical themes (e.g., Tech Stack, Industry, Role Type, Price Tier). Limit to 4-5 major clusters.
    2. **Timeline**: Group by date. If no date is present in the offer description, estimate "Recent" or "Older", or use "Undated".

    INPUT:
    ${JSON.stringify(offers)}

    OUTPUT FORMAT:
    Strict JSON object matching this schema:
    {
        "categories": [
            { "name": "string (Category Title)", "offers": [ ...full offer objects... ] }
        ],
        "timeline": [
            { "date": "string (Month Year or 'Recent')", "offers": [ ...full offer objects... ] }
        ]
    }
    
    Do not modify the inner Offer objects, just regroup them.
  `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: "Organize these offers.",
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json"
            },
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");

        return JSON.parse(text) as OrganizedOffers;

    } catch (error) {
        console.error("Organize Offers Error:", error);
        throw new Error("Failed to organize offers.");
    }
}
