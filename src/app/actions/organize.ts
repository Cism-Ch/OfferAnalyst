'use server';

import { OpenRouter } from "@openrouter/sdk";
import { Offer } from "@/types";
import { AgentError, parseJSONFromText, retryWithBackoff, validateWithZod } from "./shared/agent-utils";
import { z } from 'zod';

const MODEL_NAME = "google/gemini-2.0-flash-exp:free";

const CategorySchema = z.object({
    name: z.string(),
    offers: z.array(z.any())
});

const TimelineSchema = z.object({
    date: z.string(),
    offers: z.array(z.any())
});

const OrganizedOffersSchema = z.object({
    categories: z.array(CategorySchema),
    timeline: z.array(TimelineSchema)
});

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
    offers: Offer[],
    clientApiKey?: string // Optional BYOK key for temporary/authenticated users
): Promise<OrganizedOffers> {
    // Try to get API key with BYOK support
    const { getAPIKey, trackBYOKUsage, recordAITelemetry } = await import('./shared/api-key-provider');
    const apiKeyResult = await getAPIKey('openrouter', clientApiKey);
    
    if (!apiKeyResult) {
        throw new AgentError("No API key available. Please add an API key in Settings or set OPENROUTER_API_KEY.", 'API_KEY_MISSING');
    }

    // Only log in development mode
    if (process.env.NODE_ENV === 'development') {
        console.log(`[organizeOffersAction] Using ${apiKeyResult.source} API key`);
    }

    const openrouter = new OpenRouter({
        apiKey: apiKeyResult.key,
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
    You are an AI Librarian specializing in data organization.
    
    TASK: Organize the provided offers into logical categories and a chronological timeline.
    
    PROCESS:
    1. Group offers by logical themes (e.g., Job Type, Sector, etc.).
    2. Group offers by approximate date or relevance period.
    3. Preserve the original offer objects entirely.
    
    OUTPUT REQUIREMENTS:
    - Return ONLY a valid JSON object.
    - DO NOT include summary text or "thinking" tags in the final JSON.

    JSON SCHEMA:
    {
      "categories": [
        {
          "name": "Category Name",
          "offers": [ ...original offer objects... ]
        }
      ],
      "timeline": [
        {
          "date": "Date or Period",
          "offers": [ ...original offer objects... ]
        }
      ]
    }
    `;

    const startedAt = Date.now();
    let capturedUsage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | undefined;

    const operation = async () => {
        const response = await openrouter.chat.send({
            model: MODEL_NAME,
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: `Organize these ${simplifiedOffers.length} offers: ${JSON.stringify(simplifiedOffers)}` }
            ],
            responseFormat: { type: "json_object" }
        });

        if (response?.usage) {
            capturedUsage = {
                prompt_tokens: response.usage.promptTokens,
                completion_tokens: response.usage.completionTokens,
                total_tokens: response.usage.totalTokens
            };
        }

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new AgentError("No response text from OpenRouter", 'NO_RESPONSE');
        }

        const text = typeof content === 'string' ? content : '';
        console.log(`Organize (Gemini): AI response received (${text.length} chars)`);

        const cleanedText = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

        const parsedData = parseJSONFromText(cleanedText, 'organize response');

        const validatedResponse = validateWithZod(parsedData, OrganizedOffersSchema, 'organize response');

        // Re-hydrate offers with full data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rehydrateOffers = (items: any[]) => {
            return items.map(item => {
                const original = offers.find(o => o.id === item.id);
                return original || item;
            });
        };

        const hydratedCategories = validatedResponse.categories.map(cat => ({
            ...cat,
            offers: rehydrateOffers(cat.offers)
        }));

        const hydratedTimeline = validatedResponse.timeline.map(t => ({
            ...t,
            offers: rehydrateOffers(t.offers)
        }));

        console.log(`Organize: Successfully organized into ${hydratedCategories.length} categories`);

        const latencyMs = Date.now() - startedAt;

        // Record granular telemetry and token FinOps
        await recordAITelemetry({
            apiKeyResult,
            model: MODEL_NAME,
            action: 'organize_offers',
            promptTokens: capturedUsage?.prompt_tokens,
            completionTokens: capturedUsage?.completion_tokens,
            tokensUsed: capturedUsage?.total_tokens,
            responseTimeMs: latencyMs,
            success: true
        }).catch(err => console.error('Failed to record AI telemetry:', err));

        // Track BYOK usage if using a user's key
        if (apiKeyResult.source === 'byok' && apiKeyResult.keyId) {
            await trackBYOKUsage(apiKeyResult.keyId).catch(err => 
                console.error('Failed to track BYOK usage:', err)
            );
        }

        return {
            categories: hydratedCategories,
            timeline: hydratedTimeline
        } as OrganizedOffers;
    };

    try {
        return await retryWithBackoff(operation, 2, 'organize offers');
    } catch (error) {
        const latencyMs = Date.now() - startedAt;
        await recordAITelemetry({
            apiKeyResult,
            model: MODEL_NAME,
            action: 'organize_offers',
            responseTimeMs: latencyMs,
            success: false,
            errorMessage: error instanceof Error ? error.message : String(error)
        }).catch(() => {});
        throw error;
    }
}
