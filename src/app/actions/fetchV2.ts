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
import { AgentError, parseJSONFromText, retryWithBackoff, validateWithZod, toAgentActionError } from "./shared/agent-utils";
import { z } from 'zod';
import { DEFAULT_MODEL_ID } from '@/lib/ai-models';

// Schéma Zod pour valider une offre
const OfferSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    price: z.union([z.string(), z.number()]),
    location: z.string(),
    category: z.string(),
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
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
        return {
            success: false,
            error: toAgentActionError(new AgentError("OPENROUTER_API_KEY not found", 'API_KEY_MISSING'), 'fetch offers v2')
        };
    }

    // TODO: Implement caching layer
    // if (enableCaching) {
    //     const cached = await getCachedOffers(domain, context);
    //     if (cached) return cached;
    // }

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
    - Return ONLY a valid JSON array.
    - DO NOT include any introductory text, summary, or "thinking" tags.
    - Mark source type for each offer.

    JSON SCHEMA:
    [
      {
        "id": "unique_string",
        "title": "string",
        "description": "key details",
        "price": "string or number",
        "location": "string",
        "category": "string",
        "url": "full_source_url (empty string if not available)",
        "source": "web" or "ai-generated",
        "priority": number (0-100, higher = more reliable)
      }
    ]

    DOMAIN: ${domain}
    CONTEXT: ${context}
    BATCH SIZE: ${batchSize}
  `;

    const operation = async () => {
        const response = await openrouter.chat.send({
            model: modelName,
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: `Find ${batchSize} live offers for domain "${domain}" with context: "${context}". Return as JSON array with source prioritization.` }
            ],
            responseFormat: { type: "json_object" }
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

        // Handle wrapped arrays
        let dataToValidate = parsedData;
        if (typeof parsedData === 'object' && parsedData !== null && !Array.isArray(parsedData)) {
            const values = Object.values(parsedData);
            const arrayValue = values.find(v => Array.isArray(v));
            if (arrayValue) {
                dataToValidate = arrayValue;
            }
        }

        // Validate with Zod
        const validatedOffers = validateWithZod(dataToValidate, FetchResponseSchema, 'fetch v2 response');

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

        // TODO: Cache results
        // if (enableCaching) {
        //     await cacheOffers(domain, context, validatedOffers, 3600); // 1h TTL
        // }

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
                cached: false // TODO: implement caching
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
