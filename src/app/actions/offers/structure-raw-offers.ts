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
    let userId: string | undefined;

    // Try to get API key with BYOK support
    const { getAPIKey, trackBYOKUsage, recordAITelemetry } = await import('../shared/api-key-provider');
    const { auth } = await import('@/lib/auth');
    const { headers } = await import('next/headers');

    try {
        const session = await auth.api.getSession({ headers: await headers() });
        userId = session?.user?.id;
    } catch {
        // Guest user fallback
    }

    const apiKeyResult = await getAPIKey(modelName, clientApiKey, userId);
    if (!apiKeyResult.key) {
        return {
            success: false,
            error: {
                code: 'NO_API_KEY',
                message: apiKeyResult.error || 'Aucune clé API configurée pour extraire les offres.',
                remedy: {
                    type: 'configure_key',
                    label: 'Ajouter une clé API (BYOK)'
                }
            }
        };
    }

    const isByok = apiKeyResult.source === 'byok';
    const quotaCheck = await checkDailyQuota(isByok);
    if (!quotaCheck.allowed) {
        return {
            success: false,
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
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
                model: modelName,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Extract and structure the following text:\n\n${rawText}` }
                ],
                temperature: 0.1,
                max_tokens: 4000
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) {
                throw new AgentError('NO_CONTENT', 'Réponse vide du modèle lors de l extraction.', 'fetch');
            }
            return content;
        }, 3, 1000);

        const parsedJson = parseJSONFromText(responseText);
        const rawOffersList = extractOffersArray(parsedJson);

        if (!rawOffersList || rawOffersList.length === 0) {
            return {
                success: false,
                error: {
                    code: 'EXTRACTION_EMPTY',
                    message: "L'IA n'a pu identifier aucune offre distincte dans le texte collé. Veuillez vérifier le contenu.",
                    phase: 'fetch'
                }
            };
        }

        // Validate each offer with Zod
        const validatedOffers: Offer[] = [];
        for (let i = 0; i < rawOffersList.length; i++) {
            const rawItem = rawOffersList[i];
            const parsed = ExtractedOfferSchema.safeParse({
                ...rawItem,
                id: String(rawItem.id || i + 1)
            });
            if (parsed.success) {
                validatedOffers.push(parsed.data as Offer);
            }
        }

        if (validatedOffers.length === 0) {
            return {
                success: false,
                error: {
                    code: 'VALIDATION_FAILED',
                    message: "Le format extrait n'a pas pu être validé. Veuillez réessayer.",
                    phase: 'fetch'
                }
            };
        }

        // Track telemetry
        const latencyMs = Date.now() - startTime;
        if (isByok && apiKeyResult.keyId) {
            trackBYOKUsage(apiKeyResult.keyId, latencyMs, true).catch(() => {});
        }
        recordAITelemetry(modelName, 'fetch', true, latencyMs).catch(() => {});

        return {
            success: true,
            data: validatedOffers
        };
    } catch (err) {
        const latencyMs = Date.now() - startTime;
        recordAITelemetry(modelName, 'fetch', false, latencyMs).catch(() => {});

        return {
            success: false,
            error: {
                code: 'EXTRACTION_ERROR',
                message: err instanceof Error ? err.message : "Erreur inattendue lors de la structuration de vos offres.",
                phase: 'fetch'
            }
        };
    }
}
