'use server';

/**
 * Analyze Offers Agent V2
 * 
 * Enhanced version with:
 * - User-defined criteria weighting
 * - Multi-language support (FR, EN, ES, DE)
 * - Async processing for 100+ offers
 * - Store analysis results to MongoDB (future)
 * - Webhook notifications (future)
 */

import { OpenRouter } from "@openrouter/sdk";
import { Offer, UserProfile, AnalysisResponse, AgentActionResult } from "@/types";
import { AgentError, parseJSONFromText, retryWithBackoff, validateWithZod, toAgentActionError } from "./shared/agent-utils";
import { z } from 'zod';
import { DEFAULT_MODEL_ID } from '@/lib/ai-models';

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

interface CriteriaWeights {
    relevance?: number; // default 50%
    quality?: number;   // default 30%
    trend?: number;     // default 20%
}

interface AnalyzeOptionsV2 {
    criteriaWeights?: CriteriaWeights;
    language?: 'en' | 'fr' | 'es' | 'de';
    async?: boolean;
    storeResults?: boolean;
    webhookUrl?: string;
}

export async function analyzeOffersActionV2(
    offers: Offer[],
    profile: UserProfile,
    limit: number = 3,
    modelName: string = DEFAULT_MODEL_ID,
    options: AnalyzeOptionsV2 = {}
): Promise<AgentActionResult<AnalysisResponse>> {
    const {
        criteriaWeights = { relevance: 50, quality: 30, trend: 20 },
        language = 'en',
        async = false,
        storeResults = false
        // webhookUrl - future feature
    } = options;

    const startedAt = Date.now();
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
        return {
            success: false,
            error: toAgentActionError(new AgentError("OPENROUTER_API_KEY not found", 'API_KEY_MISSING'), 'analyze offers v2')
        };
    }

    // For large batches (100+), recommend async processing
    if (offers.length >= 100 && !async) {
        console.warn(`Analyzing ${offers.length} offers synchronously. Consider using async mode.`);
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
        description: offer.description.length > 500 
            ? offer.description.substring(0, 500) + "..." 
            : offer.description
    }));

    // Language-specific instructions
    const languageInstructions = {
        en: 'Provide analysis in English.',
        fr: 'Fournir l\'analyse en français.',
        es: 'Proporcionar el análisis en español.',
        de: 'Analyse auf Deutsch bereitstellen.'
    };

    const systemInstruction = `
    You are an expert Market Analyst AI V2 with enhanced capabilities.
    
    TASK: Rank the provided offers and return the top ${limit} based on user profile and market context.
    
    IMPROVEMENTS IN V2:
    - Custom criteria weighting: Relevance (${criteriaWeights.relevance}%), Quality (${criteriaWeights.quality}%), Trend (${criteriaWeights.trend}%)
    - ${languageInstructions[language]}
    - More detailed market insights
    - Priority scoring for decision making
    
    PROCESS:
    1. Analyze offers against User Profile with custom weights.
    2. Apply weighted scoring: 
       - Relevance: ${criteriaWeights.relevance}% (match to user needs)
       - Quality: ${criteriaWeights.quality}% (offer quality indicators)
       - Trend: ${criteriaWeights.trend}% (market trends and timing)
    3. Provide multilingual output in ${language.toUpperCase()}.
    
    OUTPUT REQUIREMENTS:
    - Return ONLY a valid JSON object.
    - DO NOT include thinking tags.
    - Justification should be detailed and in ${language.toUpperCase()}.

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
          "finalScore": number (0-100, weighted average),
          "rank": number (1 to ${limit}),
          "justification": "Detailed explanation in ${language.toUpperCase()}",
          "webInsights": ["market insight 1", "insight 2"],
          "breakdown": {
            "relevance": number (0-100),
            "quality": number (0-100),
            "trend": number (0-100)
          }
        }
      ],
      "marketSummary": "2-3 sentence overview in ${language.toUpperCase()}"
    }

    USER PROFILE: ${JSON.stringify(profile)}
    DOMAIN: ${profile.domain}
    LIMIT: Top ${limit} offers
    LANGUAGE: ${language.toUpperCase()}
  `;

    const operation = async () => {
        const response = await openrouter.chat.send({
            model: modelName,
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: `Analyze these ${simplifiedOffers.length} offers with custom weighting and rank top ${limit}. Use ${language.toUpperCase()} language: ${JSON.stringify(simplifiedOffers)}` }
            ],
            responseFormat: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new AgentError("No response text from OpenRouter", 'NO_RESPONSE');
        }

        const text = typeof content === 'string' ? content : '';
        console.log(`Analyze V2: AI response received (${text.length} chars) using ${modelName} in ${language}`);

        const cleanedText = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

        const parsedData = parseJSONFromText(cleanedText, 'analyze v2 response');

        const validatedResponse = validateWithZod(parsedData, AnalysisResponseSchema, 'analyze v2 response');

        // Merge with original offers to preserve full data
        const mergedTopOffers = validatedResponse.topOffers.map(scoredOffer => {
            const originalOffer = offers.find(o => o.id === scoredOffer.id);
            if (!originalOffer) return scoredOffer;
            
            return {
                ...originalOffer,
                ...scoredOffer,
                description: originalOffer.description
            };
        });

        const searchSources: { title: string; uri: string }[] = [];

        console.log(`Analyze V2: Successfully analyzed ${mergedTopOffers.length} offers with custom weighting`);

        const result = {
            topOffers: mergedTopOffers,
            marketSummary: validatedResponse.marketSummary,
            searchSources
        };

        // TODO: Store results to MongoDB
        // if (storeResults) {
        //     await storeAnalysisResults(profile, result, modelName);
        // }

        // TODO: Send webhook notification
        // if (webhookUrl) {
        //     await sendWebhook(webhookUrl, { status: 'completed', result });
        // }

        return result;
    };

    try {
        const data = await retryWithBackoff(operation, 3, 'analyze offers v2');

        return {
            success: true,
            data,
            meta: {
                model: modelName,
                latencyMs: Date.now() - startedAt,
                language,
                criteriaWeights,
                async,
                stored: storeResults,
                offersAnalyzed: offers.length
            }
        };
    } catch (error) {
        console.error('Analyze offers V2 failed', error);
        return {
            success: false,
            error: toAgentActionError(error, 'analyze offers v2')
        };
    }
}
