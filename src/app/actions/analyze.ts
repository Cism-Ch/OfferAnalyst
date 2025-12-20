'use server';

import { OpenRouter } from "@openrouter/sdk";
import { Offer, UserProfile, AnalysisResponse } from "@/types";
import { AgentError, parseJSONFromText, retryWithBackoff, validateWithZod } from "./shared/agent-utils";
import { z } from 'zod';

const MODEL_NAME = "google/gemini-2.0-flash-exp:free";

const ScoredOfferSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    price: z.union([z.string(), z.number()]),
    location: z.string(),
    category: z.string(),
    finalScore: z.number(),
    rank: z.number(),
    justification: z.string(),
    webInsights: z.array(z.string()),
    breakdown: z.object({
        relevance: z.number(),
        quality: z.number(),
        trend: z.number()
    })
});

const AnalysisResponseSchema = z.object({
    topOffers: z.array(ScoredOfferSchema),
    marketSummary: z.string()
});

export async function analyzeOffersAction(
    offers: Offer[],
    profile: UserProfile,
    limit: number = 3
): Promise<AnalysisResponse & { searchSources: { title: string; uri: string }[] }> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new AgentError("OPENROUTER_API_KEY not found", 'API_KEY_MISSING');
    }

    const openrouter = new OpenRouter({
        apiKey: apiKey,
    });

    // Optimize payload: Simplify offers to reduce token usage
    const simplifiedOffers = offers.map(offer => ({
        id: offer.id,
        title: offer.title,
        price: offer.price,
        location: offer.location,
        category: offer.category,
        // Truncate description to avoid token overflow while keeping context
        description: offer.description.length > 500 
            ? offer.description.substring(0, 500) + "..." 
            : offer.description
    }));

    const systemInstruction = `
    You are an expert Market Analyst AI.
    
    TASK: Rank the provided offers and return the top ${limit} based on the user profile and current market context.
    
    PROCESS:
    1. Analyze the provided offers against the User Profile.
    2. Use your reasoning and internal market data (and simulated web search if available) to provide context.
    3. Calculate scores for each offer based on Relevance (50%), Quality (30%), and Trend (20%).
    
    OUTPUT REQUIREMENTS:
    - Return ONLY a valid JSON object.
    - DO NOT include summary text or "thinking" tags in the final JSON.

    JSON SCHEMA:
    {
      "topOffers": [
        {
          "id": "string (original id)",
          "title": "string",
          "description": "string",
          "price": "string or number",
          "location": "string",
          "category": "string",
          "finalScore": number (0-100),
          "rank": number (1 to ${limit}),
          "justification": "Detailed explanation of the rank",
          "webInsights": ["specific market insight", "another insight"],
          "breakdown": {
            "relevance": number (0-100),
            "quality": number (0-100),
            "trend": number (0-100)
          }
        }
      ],
      "marketSummary": "2-sentence overview of the current market context"
    }

    USER PROFILE: ${JSON.stringify(profile)}
    DOMAIN: ${profile.domain}
    LIMIT: Top ${limit} offers
  `;

    const operation = async () => {
        const response = await openrouter.chat.send({
            model: MODEL_NAME,
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: `Analyze these ${simplifiedOffers.length} offers and rank top ${limit}: ${JSON.stringify(simplifiedOffers)}` }
            ],
            responseFormat: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new AgentError("No response text from OpenRouter", 'NO_RESPONSE');
        }

        const text = typeof content === 'string' ? content : '';
        console.log(`Analyze (Gemini): AI response received (${text.length} chars)`);

        // Clean thinking tags
        const cleanedText = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

        const parsedData = parseJSONFromText(cleanedText, 'analyze response');

        // Validation avec Zod
        const validatedResponse = validateWithZod(parsedData, AnalysisResponseSchema, 'analyze response');

        // Merge back with original offers to ensure no data loss (like full description or extra fields)
        const mergedTopOffers = validatedResponse.topOffers.map(scoredOffer => {
            const originalOffer = offers.find(o => o.id === scoredOffer.id);
            if (!originalOffer) return scoredOffer;
            
            return {
                ...originalOffer, // Keep original data (full description, url, etc.)
                ...scoredOffer,   // Apply scores and analysis
                description: originalOffer.description // Ensure full description is kept
            };
        });

        // OpenRouter doesn't provide grounding sources directly like Gemini.
        const searchSources: { title: string; uri: string }[] = [];

        console.log(`Analyze: Successfully analyzed ${mergedTopOffers.length} offers`);

        return {
            topOffers: mergedTopOffers,
            marketSummary: validatedResponse.marketSummary,
            searchSources
        };
    };

    return retryWithBackoff(operation, 3, 'analyze offers');
}
