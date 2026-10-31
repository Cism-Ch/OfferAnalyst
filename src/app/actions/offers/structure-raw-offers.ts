'use server';

/**
 * Server Action: Structure Raw Text Offers
 * 
 * Takes messy raw text (copied & pasted from LinkedIn, job boards, emails, or listings)
 * and uses the fast LLM (NVIDIA Nemotron 3.5 Lightning by default) to extract
 * and normalize it into valid Offer[] objects.
 */

import { OpenRouter } from "@openrouter/sdk";
import { Offer, AgentActionResult } from "@/types";
import { AgentError, parseJSONFromText, retryWithBackoff, extractOffersArray } from "../shared/agent-utils";
import { z } from 'zod';
import { DEFAULT_MODEL_ID } from '@/lib/ai-models';
import { checkDailyQuota } from '../shared/quota-limiter';

// Resilient Offer schema for extracted data
const ExtractedOfferSchema = z.object({
    id: z.union([z.string(), z.number()]).transform(val => String(val)),
    title: z.string().default("Opportunité"),
    description: z.string().optional().default(""),
    price: z.union([
        z.string(),
        z.number(),
        z.record(z.string(), z.unknown())
    ]).transform(val => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') return val;
        if (typeof val === 'object' && val !== null) {
            const obj = val as Record<string, unknown>;
            if ('amount' in obj) return `${obj.amount} ${obj.currency || '€'}`.trim();
            return JSON.stringify(val);
        }
        return "N/A";
    }),
    location: z.string().optional().default("Non spécifié"),
    category: z.string().optional().default("Général"),
    url: z.string().optional().default(""),
    organization: z.string().optional().default(""),
    requirements: z.array(z.string()).optional().default([])
});

const StructureInputSchema = z.object({
    rawText: z.string().trim().min(10, "Le texte doit contenir au moins 10 caractères").max(50000, "Le texte ne doit pas dépasser 50 000 caractères"),
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

    const systemPrompt = `
You are an expert Data Ingestion & Extraction Agent.
Your task is to take raw unstructured text (copied from job listings, real estate posts, emails, or market opportunities) and extract all distinct offers into clean structured JSON.

DOMAIN CONTEXT: ${domain}

RULES:
1. Identify all distinct offers/listings in the text.
2. If only one offer is present, return an array of 1 offer. If multiple offers are present, extract each one separately.
3. For each offer, extract:
   - "id": unique string or sequential number ("1", "2", etc.)
   - "title": Job title, property name, or opportunity headline
   - "organization": Company, hiring agency, or vendor name
   - "description": Key responsibilities, perks, and context (concise 2-4 sentences)
   - "price": Compensation, salary range, or price (e.g. "85k€ - 95k€", "750€/j", 120000, or "N/A" if omitted)
   - "location": City, Remote status, or country (e.g. "Paris / Remote 2j", "100% Remote Global", "Lyon 6e")
   - "category": Industry or role type
   - "url": Source URL if detected in the text, otherwise empty string ""
   - "requirements": Key must-have skills or requirements as string array
4. You MUST respond with ONLY valid JSON conforming to the schema below.
5. Do not include markdown code block backticks if possible, or wrap strictly in \`\`\`json.

JSON OUTPUT SCHEMA:
{
  "offers": [
    {
      "id": "1",
      "title": "string",
      "organization": "string",
      "description": "string",
      "price": "string or number",
      "location": "string",
      "category": "string",
      "url": "string",
      "requirements": ["string"]
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
        const rawOffersList = extractOffersArray(parsedJson);

        if (!rawOffersList || rawOffersList.length === 0) {
            return {
                success: false,
                error: {
                    code: 'EXTRACTION_EMPTY',
                    message: "L'IA n'a pu identifier aucune offre distincte dans le texte collé. Veuillez vérifier le contenu.",
                }
            };
        }

        // Validate each offer with Zod
        const validatedOffers: Offer[] = [];
        for (let i = 0; i < rawOffersList.length; i++) {
            const rawItem = rawOffersList[i];
            if (typeof rawItem === 'object' && rawItem !== null) {
                const itemObj = rawItem as Record<string, unknown>;
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
                latencyMs
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
