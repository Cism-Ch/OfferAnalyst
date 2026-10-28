'use server';

/**
 * Fetch Offers Agent V2
 * 
 * Enhanced version with:
 * - Source prioritization (web URLs over AI-generated)
 * - Caching support (1h TTL)
 * - Background job support for large batches
 * - Better error handling and logging
 */

import { OpenRouter } from "@openrouter/sdk";
import { Offer, AgentActionResult } from "@/types";
import { AgentError, parseJSONFromText, retryWithBackoff, validateWithZod, toAgentActionError, extractOffersArray } from "./shared/agent-utils";
import { z } from 'zod';
import { DEFAULT_MODEL_ID } from '@/lib/ai-models';
import { getCache, setCache, generateCacheKey } from '@/lib/cache';

// Schéma Zod résilient pour valider une offre
const OfferSchema = z.object({
    id: z.union([z.string(), z.number()]).transform(val => String(val)),
    title: z.string().default("Offre sans titre"),
    description: z.string().optional().default(""),
    price: z.union([
        z.string(),
        z.number(),
        z.record(z.string(), z.any())
    ]).transform(val => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') return val;
        if (typeof val === 'object' && val !== null) {
            if ('amount' in val) return `${val.amount} ${val.currency || '€'}`.trim();
            return JSON.stringify(val);
        }
        return "N/A";
    }),
    location: z.string().optional().default("Non spécifié"),
    category: z.string().optional().default("Général"),
    url: z.string().optional().default(""),
    source: z.enum(['web', 'ai-generated']).optional().default('ai-generated'),
    priority: z.number().optional().default(0)
});

const FetchResponseSchema = z.array(OfferSchema);

interface FetchOptions {
    preferWebSources?: boolean;
    enableCaching?: boolean;
    async?: boolean;
    batchSize?: number;
}

export async function fetchOffersActionV2(
    domain: string,
    context: string,
    modelName: string = DEFAULT_MODEL_ID,
    options: FetchOptions = {}
): Promise<AgentActionResult<Offer[]>> {
    const {
        preferWebSources = true,
        enableCaching = true,
        async = false,
        batchSize = 10
    } = options;

    const startedAt = Date.now();
    const cacheKey = generateCacheKey('offers:v2', domain, context, modelName, preferWebSources, batchSize);

    // Caching layer check (1 hour TTL)
    if (enableCaching) {
        const cachedOffers = await getCache<Offer[]>(cacheKey);
        if (cachedOffers && cachedOffers.length > 0) {
            console.log(`Fetch V2: Serving ${cachedOffers.length} offers from cache for domain "${domain}"`);
            return {
                success: true,
                data: cachedOffers,
                meta: {
                    model: modelName,
                    latencyMs: Date.now() - startedAt,
                    webSources: cachedOffers.filter(o => o.source === 'web').length,
                    totalOffers: cachedOffers.length,
                    async,
                    cached: true
                }
            };
        }
    }

    const { getAPIKey } = await import('./shared/api-key-provider');
    const apiKeyResult = await getAPIKey('openrouter');
    const apiKey = apiKeyResult?.key || process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
        return {
            success: false,
            error: toAgentActionError(new AgentError("OPENROUTER_API_KEY not found", 'API_KEY_MISSING'), 'fetch offers v2')
        };
    }

    const openrouter = new OpenRouter({
        apiKey: apiKey,
    });

    const systemInstruction = `
    You are a professional AI Retrieval Agent v2 specializing in market data.
    
    GOAL: Find real-world current offers (jobs, products, real estate, etc.) based on the provided Domain and Context.
    
    IMPROVEMENTS IN V2:
    - Prioritize real web sources with valid URLs when possible
    - Mark each offer with source type ('web' or 'ai-generated')
    - Add priority score (0-100) where higher = more reliable/recent
    - Focus on recent, actively listed offers
    
    PROCESS:
    1. Reason about the best sources for "${domain}" in the context of "${context}".
    2. ${preferWebSources ? 'PREFER real web sources with valid URLs over generated data.' : 'Generate realistic listings.'}
    3. Retrieve at least ${batchSize} listings.
    4. Ensure each listing includes title, price, location, category, and URL (if available).
    
    OUTPUT REQUIREMENTS:
    - Return ONLY a valid JSON object matching the JSON SCHEMA below.
    - DO NOT include any introductory text, summary, or "thinking" tags.
    - Mark source type for each offer.

    JSON SCHEMA:
    {
      "offers": [
        {
          "id": "unique_string",
          "title": "string",
          "description": "key details",
          "price": "string or number",
          "location": "string",
          "category": "string",
          "url": "full_source_url (empty string if not available)",
          "source": "web" or "ai-generated",
          "priority": 0
        }
      ]
    }

    DOMAIN: ${domain}
    CONTEXT: ${context}
    BATCH SIZE: ${batchSize}
  `;

    const operation = async () => {
        const response = await openrouter.chat.send({
            chatRequest: {
                model: modelName,
                messages: [
                    { role: "system", content: systemInstruction },
                    { role: "user", content: `Find ${batchSize} live offers for domain "${domain}" with context: "${context}". Return a JSON object with an "offers" array with source prioritization.` }
                ],
                responseFormat: { type: "json_object" }
            }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new AgentError("No response text from OpenRouter", 'NO_RESPONSE');
        }

        const text = typeof content === 'string' ? content : '';
        console.log(`Fetch V2: AI response received (${text.length} chars) using ${modelName}`);

        // Clean thinking tags
        const cleanedText = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

        const parsedData = parseJSONFromText(cleanedText, 'fetch v2 response');

        // Extraire le tableau d'offres de manière ultra-résiliente
        const offersArray = extractOffersArray(parsedData);

        // Validate with Zod
        const validatedOffers = validateWithZod(offersArray, FetchResponseSchema, 'fetch v2 response');

        // Sort by priority and source type if preferWebSources is true
        if (preferWebSources) {
            validatedOffers.sort((a, b) => {
                // Web sources first
                if (a.source === 'web' && b.source !== 'web') return -1;
                if (b.source === 'web' && a.source !== 'web') return 1;
                // Then by priority
                return (b.priority || 0) - (a.priority || 0);
            });
        }

        console.log(`Fetch V2: Retrieved ${validatedOffers.length} offers (${validatedOffers.filter(o => o.source === 'web').length} from web)`);

        // Cache results if enabled (1 hour TTL)
        if (enableCaching) {
            await setCache(cacheKey, validatedOffers, 3600);
        }

        return validatedOffers;
    };

    try {
        const offers = await retryWithBackoff(operation, 3, 'fetch offers v2');
        
        return {
            success: true,
            data: offers,
            meta: {
                model: modelName,
                latencyMs: Date.now() - startedAt,
                webSources: offers.filter(o => o.source === 'web').length,
                totalOffers: offers.length,
                async,
                cached: false
            }
        };
    } catch (error) {
        console.error('Fetch offers V2 failed', error);
        return {
            success: false,
            error: toAgentActionError(error, 'fetch offers v2')
        };
    }
}
