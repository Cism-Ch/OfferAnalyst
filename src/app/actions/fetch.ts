'use server';

import { OpenRouter } from "@openrouter/sdk";
import { Offer, AgentActionResult } from "@/types";
import { AgentError, parseJSONFromText, retryWithBackoff, validateWithZod, toAgentActionError, extractOffersArray } from "./shared/agent-utils";
import { z } from 'zod';
import { DEFAULT_MODEL_ID } from '@/lib/ai-models';

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
    url: z.string().optional().default("")
});

const FetchResponseSchema = z.array(OfferSchema);

const FetchInputSchema = z.object({
    domain: z.string().trim().min(1, "Domain is required").max(500, "Domain exceeds 500 characters"),
    context: z.string().max(10000, "Context exceeds 10000 characters").default(""),
    modelName: z.string().max(200).optional().default(DEFAULT_MODEL_ID),
    clientApiKey: z.string().max(500).optional(),
});

export async function fetchOffersAction(
    domain: string,
    context: string,
    modelName: string = DEFAULT_MODEL_ID,
    clientApiKey?: string // Optional BYOK key for temporary/authenticated users
): Promise<AgentActionResult<Offer[]>> {
    const inputValidation = FetchInputSchema.safeParse({ domain, context, modelName, clientApiKey });
    if (!inputValidation.success) {
        return {
            success: false,
            error: {
                code: 'VALIDATION_FAILED',
                message: inputValidation.error.issues[0]?.message || 'Paramètres de recherche invalides',
            }
        };
    }

    const startTime = Date.now();
    let userId: string | undefined;
    
    // Try to get API key with BYOK support
    const { getAPIKey, trackBYOKUsage, recordAITelemetry } = await import('./shared/api-key-provider');
    const { checkForSuspiciousActivity } = await import('./db/api-key-analytics');
    const { auth } = await import('@/lib/auth');
    const { headers } = await import('next/headers');
    
    // Get session for logging
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        userId = session?.user?.id;
    } catch {
        // Continue without user ID
    }
    
    const apiKeyResult = await getAPIKey('openrouter', clientApiKey);
    
    if (!apiKeyResult) {
        return {
            success: false,
            error: toAgentActionError(
                new AgentError("No API key available. Please add an API key in Settings or set OPENROUTER_API_KEY.", 'API_KEY_MISSING'),
                'fetch offers'
            )
        };
    }

    // Quota Enforcement: Check 10 searches/day limit for free tier
    const isByok = apiKeyResult.source === 'byok' || apiKeyResult.source === 'guest_cookie' || Boolean(clientApiKey);
    const { checkDailyQuota, incrementDailyQuota } = await import('./shared/quota-limiter');
    const quotaCheck = await checkDailyQuota(isByok);
    if (!quotaCheck.allowed) {
        return {
            success: false,
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Quota quotidien de 10 recherches atteint. Réinitialisation à minuit UTC ou utilisez votre propre clé API.'
            }
        };
    }

    // Only log in development mode
    if (process.env.NODE_ENV === 'development') {
        console.log(`[fetchOffersAction] Using ${apiKeyResult.source} API key`);
    }

    const openrouter = new OpenRouter({
        apiKey: apiKeyResult.key,
    });

    const systemInstruction = `
    You are a professional AI Retrieval Agent specializing in market data.
    
    GOAL: Find real-world current offers (jobs, products, real estate, etc.) based on the provided Domain and Context.
    
    PROCESS:
    1. Reason about the best sources for "${domain}" in the context of "${context}".
    2. Retrieve or generate a list of at least 5-10 realistic, current listings.
    3. Ensure each listing includes a title, price, location, and a valid source URL if possible.
    
    OUTPUT REQUIREMENTS:
    - You MUST return ONLY a valid JSON object matching the JSON SCHEMA below.
    - DO NOT include any introductory text, summary, or "thinking" tags in the final JSON output.
    - If you use research, ensure the data is as up-to-date as possible.

    JSON SCHEMA:
    {
      "offers": [
        {
          "id": "1",
          "title": "string",
          "description": "key details",
          "price": "string or number",
          "location": "string",
          "category": "string",
          "url": "full_source_url"
        }
      ]
    }

    DOMAIN: ${domain}
    CONTEXT: ${context}
  `;

    let capturedUsage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | undefined;

    const operation = async () => {
        const response = await openrouter.chat.send({
            chatRequest: {
                model: modelName,
                messages: [
                    { role: "system", content: systemInstruction },
                    { role: "user", content: `Find live offers for domain "${domain}" with this context: "${context}". Return a JSON object with an "offers" array.` }
                ],
                responseFormat: { type: "json_object" }
            }
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
        console.log(`Fetch (DeepSeek): AI response received (${text.length} chars)`);

        // Extraire le JSON (DeepSeek-R1 inclut souvent des balises <think>)
        const cleanedText = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

        // On utilise l'utilitaire de parsing robuste
        const parsedData = parseJSONFromText(cleanedText, 'fetch response');

        // Extraire le tableau d'offres de manière ultra-résiliente (gère { offers: [] }, direct [], dicts, offre unique)
        const offersArray = extractOffersArray(parsedData);

        // Validation avec Zod
        const validatedOffers = validateWithZod(offersArray, FetchResponseSchema, 'fetch response');

        console.log(`Fetch: Successfully retrieved ${validatedOffers.length} offers`);
        return validatedOffers;
    };

    try {
        const offers = await retryWithBackoff(operation, 3, 'fetch offers');
        
        // Track BYOK usage if using a user's key
        if (apiKeyResult.source === 'byok' && apiKeyResult.keyId) {
            await trackBYOKUsage(apiKeyResult.keyId).catch(err => 
                console.error('Failed to track BYOK usage:', err)
            );
        }
        
        const responseTime = Date.now() - startTime;
        // Log telemetry and FinOps accounting
        await recordAITelemetry({
            apiKeyResult,
            model: modelName,
            action: 'fetch_offers',
            promptTokens: capturedUsage?.prompt_tokens,
            completionTokens: capturedUsage?.completion_tokens,
            tokensUsed: capturedUsage?.total_tokens,
            responseTimeMs: responseTime,
            success: true
        }).catch(err => console.error('Failed to record AI telemetry:', err));

        // Check for suspicious activity
        if (userId && apiKeyResult.keyId) {
            await checkForSuspiciousActivity(userId, apiKeyResult.keyId).catch(err =>
                console.error('Failed to check suspicious activity:', err)
            );
        }

        // Increment daily quota on search success
        await incrementDailyQuota(isByok).catch(err =>
            console.error('Failed to increment daily quota:', err)
        );
        
        return {
            success: true,
            data: offers,
            meta: {
                model: modelName,
                latencyMs: responseTime
            }
        };
    } catch (error) {
        console.error('Fetch offers failed', error);
        const responseTime = Date.now() - startTime;
        
        await recordAITelemetry({
            apiKeyResult,
            model: modelName,
            action: 'fetch_offers',
            responseTimeMs: responseTime,
            success: false,
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }).catch(() => {});
        
        return {
            success: false,
            error: toAgentActionError(error, 'fetch offers')
        };
    }
}