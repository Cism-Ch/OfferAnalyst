'use server';

import { OpenRouter } from "@openrouter/sdk";
import { Offer, AgentActionResult } from "@/types";
import { AgentError, parseJSONFromText, retryWithBackoff, validateWithZod, toAgentActionError, extractOffersArray } from "./shared/agent-utils";
import { z } from 'zod';
import { DEFAULT_MODEL_ID } from '@/lib/ai-models';
import { searchWebOffers, extractUrlsContent } from '@/lib/tavily';
import { getCountryOption, normalizeCountryCode } from '@/lib/geo';
import {
    classifyOfferIntent,
    detectQueryLanguage,
    buildTavilyFetchQuery,
    getIntentExtractionGuidance,
} from '@/lib/search-intent';

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
    country: z.string().max(10).optional().default('INTL'),
    clientTavilyKey: z.string().max(500).optional(),
});

export async function fetchOffersAction(
    domain: string,
    context: string,
    modelName: string = DEFAULT_MODEL_ID,
    clientApiKey?: string, // Optional OpenRouter BYOK key
    country: string = 'INTL',
    clientTavilyKey?: string // Optional Tavily BYOK key
): Promise<AgentActionResult<Offer[]>> {
    const normalizedCountry = normalizeCountryCode(country);
    const inputValidation = FetchInputSchema.safeParse({
        domain,
        context,
        modelName,
        clientApiKey,
        country: normalizedCountry,
        clientTavilyKey
    });
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

    // Check Multi-Tier Cache (Upstash Redis + in-memory) to save Tavily & LLM credits
    const { getCache, setCache, generateCacheKey } = await import('@/lib/cache');
    const cacheKey = generateCacheKey('fetch_offers_v2', domain, context, normalizedCountry, modelName);
    const cachedOffers = await getCache<Offer[]>(cacheKey);
    if (cachedOffers && Array.isArray(cachedOffers) && cachedOffers.length > 0) {
        return {
            success: true,
            data: cachedOffers,
            meta: {
                model: modelName,
                latencyMs: Date.now() - startTime,
                cached: true,
                country: normalizedCountry
            }
        };
    }

    let userId: string | undefined;

    const { getAPIKey, trackBYOKUsage, recordAITelemetry } = await import('./shared/api-key-provider');
    const { checkForSuspiciousActivity } = await import('./db/api-key-analytics');
    const { auth } = await import('@/lib/auth');
    const { headers } = await import('next/headers');

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
                new AgentError("No OpenRouter API key available. Please add an API key in Settings or set OPENROUTER_API_KEY.", 'API_KEY_MISSING'),
                'fetch offers'
            )
        };
    }

    // Check daily quota (single deduction happens in analyzeOffersAction to avoid double counting)
    const isByok =
        apiKeyResult.source === 'byok' ||
        apiKeyResult.source === 'guest_cookie' ||
        Boolean(clientApiKey) ||
        Boolean(clientTavilyKey);

    const { checkDailyQuota } = await import('./shared/quota-limiter');
    const quotaCheck = await checkDailyQuota(isByok);
    if (!quotaCheck.allowed) {
        return {
            success: false,
            error: {
                code: 'RATE_LIMITED',
                message: `Quota quotidien Free Tier (${quotaCheck.total}/jour) atteint. Créez un compte gratuit sur tavily.com pour obtenir 1 000 crédits/mois avec votre propre clé API.`,
                remedy: {
                    type: 'configure_api_key',
                    label: 'Ajouter une clé Tavily gratuite (1 000 crédits)',
                    targetUrl: 'https://app.tavily.com'
                }
            }
        };
    }

    // Step 1: Real-time grounded web search via Tavily (intent & single-language localized)
    const countryMeta = getCountryOption(normalizedCountry);
    const intent = classifyOfferIntent(domain, context);
    const queryLang = detectQueryLanguage(`${domain} ${context}`, countryMeta.tavilyLanguage);
    const searchQuery = buildTavilyFetchQuery({
        domain,
        context,
        countryCode: normalizedCountry,
        intent,
        queryLang,
    });
    const excludeSocialNoise = !/\b(linkedin|facebook|instagram|tiktok)\b/i.test(context);

    let tavilyResults;
    let tavilyMeta = { creditsUsed: 0, keySource: 'none' as string };
    try {
        const searchOut = await searchWebOffers(searchQuery, {
            country: normalizedCountry,
            language: normalizedCountry === 'INTL' ? queryLang : queryLang,
            searchDepth: 'advanced',
            maxResults: 10,
            excludeSocialNoise,
            clientTavilyKey,
            userId,
            actionName: 'fetch_offers_tavily',
        });
        tavilyResults = searchOut.results;
        tavilyMeta = { creditsUsed: searchOut.creditsUsed, keySource: searchOut.keySource };
    } catch (tavilyErr) {
        const msg = tavilyErr instanceof Error ? tavilyErr.message : String(tavilyErr);
        if (msg.includes('TAVILY_API_KEY_MISSING')) {
            return {
                success: false,
                error: {
                    code: 'API_KEY_MISSING',
                    message: "Clé API Tavily manquante pour la recherche web réelle. Créez un compte gratuit sur tavily.com pour obtenir 1 000 crédits offerts et ajoutez votre clé dans Paramètres -> Clés API.",
                    remedy: {
                        type: 'configure_api_key',
                        label: 'Obtenir 1 000 crédits gratuits sur Tavily',
                        targetUrl: 'https://app.tavily.com'
                    }
                }
            };
        }
        return {
            success: false,
            error: {
                code: 'SEARCH_FAILED',
                message: `La collecte web Tavily a échoué : ${msg}`,
                remedy: {
                    type: 'retry',
                    label: 'Réessayer la recherche'
                }
            }
        };
    }

    if (!tavilyResults || tavilyResults.length === 0) {
        return {
            success: true,
            data: [],
            meta: {
                model: modelName,
                latencyMs: Date.now() - startTime,
                cached: false,
                country: normalizedCountry,
                tavilyCredits: tavilyMeta.creditsUsed
            }
        };
    }

    // Selective enrichment: if >= 50% of top 4 results have short snippets (<220 chars) without prices/numbers, extract up to 3 URLs
    const topSlice = tavilyResults.slice(0, 4);
    const thinResults = topSlice.filter(
        (r) => r.content.trim().length < 220 && !/\d/.test(r.content)
    );
    if (thinResults.length >= Math.max(2, Math.ceil(topSlice.length / 2))) {
        try {
            const extracted = await extractUrlsContent(
                thinResults.slice(0, 3).map((r) => r.url),
                { clientTavilyKey, userId }
            );
            tavilyMeta.creditsUsed += extracted.creditsUsed;
            const extractedMap = new Map(extracted.items.map((e) => [e.url, e.rawContent]));
            tavilyResults = tavilyResults.map((r) => {
                const raw = extractedMap.get(r.url);
                if (!raw || raw.trim().length <= r.content.trim().length) return r;
                return { ...r, content: raw.slice(0, 1800) };
            });
        } catch {
            // Best-effort enrichment; keep original snippets if extraction fails
        }
    }

    // Step 2: Structure & deduplicate ONLY from verified Tavily web results (zero hallucinated URLs)
    const openrouter = new OpenRouter({
        apiKey: apiKeyResult.key,
    });

    const intentGuidance = getIntentExtractionGuidance(intent);

    const systemInstruction = `
    You are a strict Web Data Extraction & Deduplication Agent.

    GOAL: Convert the verified Tavily live web search results below into structured, deduplicated Offer objects.

    ${intentGuidance}

    CRITICAL GROUNDING RULES:
    1. NEVER invent, fabricate, or alter URLs. Every "url" in the output MUST be copied verbatim from the provided TAVILY_WEB_RESULTS.
    2. Extract real details from the snippet/title: exact price/salary/rent/MOQ if stated (otherwise "À vérifier sur l'annonce"), location (anchored to ${countryMeta.labelFr} if applicable), and a clear factual description.
    3. Deduplicate identical listings pointing to the same offer.
    4. Ignore pure generic homepages/blog posts if better direct listings exist; otherwise synthesize the real offering accurately with its exact source URL.
    5. Return ONLY a valid JSON object matching the schema below.

    JSON SCHEMA:
    {
      "offers": [
        {
          "id": "1",
          "title": "string",
          "description": "factual summary extracted from web result",
          "price": "string or number",
          "location": "string",
          "category": "string",
          "url": "exact_tavily_url"
        }
      ]
    }
  `;

    const webContextPayload = tavilyResults.map((r, idx) => ({
        index: idx + 1,
        title: r.title,
        url: r.url,
        snippet: r.content.slice(0, 1200),
        publishedDate: r.publishedDate || undefined,
    }));

    let capturedUsage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | undefined;

    const operation = async () => {
        const response = await openrouter.chat.send({
            chatRequest: {
                model: modelName,
                messages: [
                    { role: "system", content: systemInstruction },
                    {
                        role: "user",
                        content: `DOMAIN: "${domain}"\nCOUNTRY TARGET: ${countryMeta.labelFr} (${normalizedCountry})\nCRITERIA: "${context}"\n\nTAVILY_WEB_RESULTS:\n${JSON.stringify(webContextPayload)}`
                    }
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
        const cleanedText = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
        const parsedData = parseJSONFromText(cleanedText, 'fetch response');
        const offersArray = extractOffersArray(parsedData);
        const validatedOffers = validateWithZod(offersArray, FetchResponseSchema, 'fetch response');

        // Enforce strict URL integrity against Tavily returned URLs
        const allowedUrls = new Set(tavilyResults.map((r) => r.url));
        const groundedOffers = validatedOffers.map((offer, i) => ({
            ...offer,
            url: offer.url && allowedUrls.has(offer.url)
                ? offer.url
                : tavilyResults[i % tavilyResults.length]?.url || '',
        }));

        return groundedOffers;
    };

    try {
        const offers = await retryWithBackoff(operation, 3, 'fetch offers');

        await setCache(cacheKey, offers, 7200).catch(() => {});

        if (apiKeyResult.source === 'byok' && apiKeyResult.keyId) {
            await trackBYOKUsage(apiKeyResult.keyId).catch(() => {});
        }

        const responseTime = Date.now() - startTime;
        await recordAITelemetry({
            apiKeyResult,
            model: modelName,
            action: 'fetch_offers',
            promptTokens: capturedUsage?.prompt_tokens,
            completionTokens: capturedUsage?.completion_tokens,
            tokensUsed: capturedUsage?.total_tokens,
            responseTimeMs: responseTime,
            success: true
        }).catch(() => {});

        if (userId && apiKeyResult.keyId) {
            await checkForSuspiciousActivity(userId, apiKeyResult.keyId).catch(() => {});
        }

        return {
            success: true,
            data: offers,
            meta: {
                model: modelName,
                latencyMs: responseTime,
                cached: false,
                country: normalizedCountry,
                tavilyCredits: tavilyMeta.creditsUsed,
                tavilySource: tavilyMeta.keySource
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
