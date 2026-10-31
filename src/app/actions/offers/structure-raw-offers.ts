'use server';

/**
 * Server Action: Structure Raw Text Offers
 * 
 * Uses an ultra-fast LLM (e.g. NVIDIA Nemotron or Google Gemini Flash) to parse,
 * extract, and normalize raw unformatted text (such as copy-pasted job listings,
 * email snippets, or property descriptions) into a validated Offer[] array.
 */

import { OpenRouter } from "@openrouter/sdk";
import { Offer, AgentActionResult } from "@/types";
import { AgentError, parseJSONFromText, retryWithBackoff } from "../shared/agent-utils";
import { z } from 'zod';
import { DEFAULT_MODEL_ID } from '@/lib/ai-models';
import { checkDailyQuota } from '../shared/quota-limiter';

const ExtractedOfferSchema = z.object({
    id: z.union([z.string(), z.number()]).transform(val => String(val)),
    title: z.string().min(1, "Titre manquant").default("Offre"),
    organization: z.string().optional().default("Non spécifié"),
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

const StructureInputSchema = z.object({
    rawText: z.string().min(5, "Le texte doit contenir au moins 5 caractères").max(50000, "Texte trop long"),
    domain: z.string().max(200).optional().default("Opportunités"),
    modelName: z.string().max(200).optional().default(DEFAULT_MODEL_ID),
    clientApiKey: z.string().max(500).optional(),
});

export async function structureRawOffersAction(
    rawText: string,
    domain: string = "Opportunités",
    modelName: string = DEFAULT_MODEL_ID,
    clientApiKey?: string
): Promise<AgentActionResult<Offer[]>> {
    const inputValidation = StructureInputSchema.safeParse({ rawText, domain, modelName, clientApiKey });
    if (!inputValidation.success) {
        return {
            success: false,
            error: {
                code: 'VALIDATION_FAILED',
                message: inputValidation.error.issues[0]?.message || 'Texte brut invalide',
            }
        };
    }

    const startTime = Date.now();

    // Check Multi-Tier Cache to eliminate redundant AI extraction and token costs
    const { getCache, setCache, generateCacheKey } = await import('@/lib/cache');
    const cacheKey = generateCacheKey('structure_offers', rawText, domain, modelName);
    const cachedOffers = await getCache<Offer[]>(cacheKey);
    if (cachedOffers && Array.isArray(cachedOffers) && cachedOffers.length > 0) {
        return {
            success: true,
            data: cachedOffers,
            meta: {
                model: modelName,
                latencyMs: Date.now() - startTime,
                cached: true
            }
        };
    }

    // Try to get API key with BYOK support
    const { getAPIKey, recordAITelemetry } = await import('../shared/api-key-provider');

    const apiKeyResult = await getAPIKey('openrouter', clientApiKey);
    if (!apiKeyResult?.key) {
        return {
            success: false,
            error: {
                code: 'API_KEY_MISSING',
                message: 'Aucune clé API configurée pour extraire les offres.',
                remedy: {
                    type: 'configure_api_key',
                    label: 'Ajouter une clé API (BYOK)'
                }
            }
        };
    }

    const isByok = apiKeyResult.source === 'byok' || apiKeyResult.source === 'guest_cookie' || Boolean(clientApiKey);
    const quotaCheck = await checkDailyQuota(isByok);
    if (!quotaCheck.allowed) {
        return {
            success: false,
            error: {
                code: 'RATE_LIMITED',
                message: 'Quota quotidien atteint. Réinitialisation à minuit UTC ou utilisez votre propre clé API.'
            }
        };
    }

    const openrouter = new OpenRouter({
        apiKey: apiKeyResult.key,
    });

    const systemPrompt = `You are a high-speed parsing agent specializing in data extraction.
Your task is to take unformatted, copied text (from websites, emails, boards, etc.) and extract all distinct offers/listings into a structured JSON array.

RULES:
1. Identify each distinct offer in the text (job post, apartment listing, RFP, product).
2. Extract or infer:
   - title: concise title
   - organization: company or poster name
   - description: 2-4 sentence summary of responsibilities, requirements, or features
   - price: salary, rate, rent, or price (e.g. "85 000 €", "650 €/j", "1 200 €/m") or "N/A"
   - location: city, region, or "Remote / Télétravail"
   - category: the best domain or industry tag
   - url: if an explicit URL is found, include it; otherwise leave empty string ""
3. Return ONLY a valid JSON object matching this schema:
{
  "offers": [
    {
      "id": "1",
      "title": "...",
      "organization": "...",
      "description": "...",
      "price": "...",
      "location": "...",
      "category": "...",
      "url": "..."
    }
  ]
}
`;

    try {
        const responseText = await retryWithBackoff(async () => {
            const completion = await openrouter.chat.send({
                chatRequest: {
                    model: modelName,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: `Extract and structure the following text:\n\n${rawText}` }
                    ],
                    temperature: 0.1,
                    maxTokens: 4000,
                    responseFormat: { type: 'json_object' }
                }
            });

            const choiceContent = completion?.choices?.[0]?.message?.content;
            const content = typeof choiceContent === 'string'
                ? choiceContent
                : (Array.isArray(choiceContent) ? JSON.stringify(choiceContent) : null);

            if (!content) {
                throw new AgentError("Réponse vide du modèle lors de l extraction.", 'NO_RESPONSE');
            }
            return content;
        }, 3, 'structure_raw_offers');

        const parsedJson = parseJSONFromText(responseText);
        
        let candidateArray: unknown[] = [];
        if (Array.isArray(parsedJson)) {
            candidateArray = parsedJson;
        } else if (parsedJson && typeof parsedJson === 'object') {
            const record = parsedJson as Record<string, unknown>;
            if (Array.isArray(record.offers)) {
                candidateArray = record.offers;
            } else if (Array.isArray(record.items)) {
                candidateArray = record.items;
            } else if (Array.isArray(record.data)) {
                candidateArray = record.data;
            } else {
                candidateArray = [parsedJson];
            }
        }

        const validatedOffers: Offer[] = [];
        for (let i = 0; i < candidateArray.length; i++) {
            const item = candidateArray[i];
            if (item && typeof item === 'object') {
                const itemObj = item as Record<string, unknown>;
                const parsed = ExtractedOfferSchema.safeParse({
                    ...itemObj,
                    id: String(itemObj.id || i + 1)
                });
                if (parsed.success) {
                    validatedOffers.push(parsed.data as Offer);
                }
            }
        }

        if (validatedOffers.length === 0) {
            return {
                success: false,
                error: {
                    code: 'VALIDATION_FAILED',
                    message: "Le format extrait n'a pas pu être validé. Veuillez réessayer.",
                }
            };
        }

        // Cache result for 2 hours (7200 seconds)
        await setCache(cacheKey, validatedOffers, 7200).catch(() => {});

        // Track telemetry
        const latencyMs = Date.now() - startTime;
        await recordAITelemetry({
            apiKeyResult,
            model: modelName,
            action: 'structure_raw_offers',
            responseTimeMs: latencyMs,
            success: true
        }).catch(() => {});

        return {
            success: true,
            data: validatedOffers,
            meta: {
                model: modelName,
                latencyMs,
                cached: false
            }
        };
    } catch (error) {
        console.error('Structure raw offers failed:', error);
        return {
            success: false,
            error: {
                code: 'AI_PROCESSING_ERROR',
                message: error instanceof Error ? error.message : "Erreur inattendue lors de l'extraction des offres."
            }
        };
    }
}
