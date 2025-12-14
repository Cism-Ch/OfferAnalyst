'use server';

import { GoogleGenAI } from "@google/genai";
import { Offer, UserProfile, AnalysisResponse } from "@/types";

// Using gemini-2.5-flash for speed and search capabilities
const MODEL_NAME = "gemini-2.5-flash";

export async function analyzeOffersAction(
    offers: Offer[],
    profile: UserProfile,
    limit: number = 3
): Promise<AnalysisResponse> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY not found in environment variables");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Schema description for the prompt since we cannot use responseSchema with tools
    const schemaDescription = {
        topOffers: [
            {
                id: "string",
                title: "string",
                description: "string",
                price: "string",
                location: "string",
                category: "string",
                finalScore: "number (0-100)",
                rank: "number",
                justification: "string (one line explanation)",
                webInsights: ["string (specific fact found via search)"],
                breakdown: {
                    relevance: "number",
                    quality: "number",
                    trend: "number"
                }
            }
        ],
        marketSummary: "string (2-sentence overview)"
    };

    const systemInstruction = `
    You are a high-performance Offer Analyst and Contextual Recommendation Engine.
    
    YOUR GOAL:
    Rank the provided list of offers based on a User Profile using a 3-Phase algorithm.
    RETURN ONLY THE TOP ${limit} OFFERS after ranking.

    1. **Internal Analysis**: Match specific criteria (Price, Location, Specs) against the User Profile.
    2. **Web Enrichment**: You MUST use the 'googleSearch' tool to find real-time context.
       - Check reputation (reviews, neighborhood safety, company rating).
       - Check market trends (is the price competitive locally?).
    3. **Weighted Ranking**: Calculate a Final Score (0-100) based on:
       - Relevance (50%): Adherence to filters + Intuitiveness (tolerance for slight deviations if quality is high).
       - Quality (30%): Value for money, rarity, uniqueness.
       - Context/Trend (20%): Derived from Web Search (reputation, market alignment).

    INPUT DATA:
    - User Profile: ${JSON.stringify(profile)}
    - Domain: ${profile.domain}
    - Offers List: (Provided in user prompt)

    OUTPUT FORMAT:
    Return a strict JSON object adhering to the structure below. 
    ${JSON.stringify(schemaDescription, null, 2)}
    
    Do not use Markdown formatting (no \`\`\`json blocks). Return raw JSON only.
  `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: JSON.stringify(offers),
            config: {
                systemInstruction: systemInstruction,
                tools: [{ googleSearch: {} }], // Enable Google Search for Phase 2
            },
        });

        const text = response.text;
        if (!text) {
            throw new Error("No response text generated");
        }

        // Clean potential markdown just in case the model is chatty
        const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();

        let data: AnalysisResponse;
        try {
            data = JSON.parse(cleanedText);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            throw new Error("Failed to parse AI response. The model might have returned invalid JSON: " + cleanedText.substring(0, 100));
        }

        // Extract Grounding Metadata (Sources)
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const searchSources = groundingChunks
            ?.map((chunk: any) => ({
                title: chunk.web?.title || "Source",
                uri: chunk.web?.uri
            }))
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((s: any) => s.uri) || [];

        return {
            ...data,
            searchSources
        };
    } catch (error) {
        console.error("Analysis failed:", error);
        throw error;
    }
}
