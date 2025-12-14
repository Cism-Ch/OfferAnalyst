'use server';

import { GoogleGenAI } from "@google/genai";
import { Offer } from "@/types";

const MODEL_NAME = "gemini-2.5-flash";

export async function fetchOffersAction(
    domain: string,
    context: string
): Promise<Offer[]> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY not found");
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
    You are an AI Retrieval Agent.
    
    GOAL:
    Find real-world offers (jobs, products, real estate, etc.) based on the User's Domain and Context.
    You MUST use the 'googleSearch' tool to find actual, current listings.
    
    OUTPUT:
    Return a strictly valid JSON array of objects matching this schema:
    [{
      "id": "string (unique)",
      "title": "string",
      "description": "string (key details)",
      "price": "string or number",
      "location": "string",
      "category": "string",
      "url": "string (source link if available)"
    }]

    REQUIREMENTS:
    - Find at least 10 relevant items.
    - EXTRACT real data from search results.
    - Do NOT markdown format the output. Return RAW JSON.
    - If price is hidden, estimate or put "Contact for price".
  `;

    const prompt = `Domain: ${domain}\nContext: ${context}\nFind offers now.`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                tools: [{ googleSearch: {} }],
                // responseMimeType: "application/json" // Can sometimes conflict with tools, using text parsing instead
            },
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");

        const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
        const offers = JSON.parse(cleanedText);

        if (!Array.isArray(offers)) {
            throw new Error("AI did not return an array");
        }

        return offers;

    } catch (error) {
        console.error("Fetch Offers Error:", error);
        throw new Error("Failed to fetch offers. " + error);
    }
}
