'use server';

import { OpenRouter } from "@openrouter/sdk";
import { Offer, UserProfile, AnalysisResponse, AgentActionResult } from "@/types";
import { AgentError, parseJSONFromText, retryWithBackoff, validateWithZod, toAgentActionError } from "./shared/agent-utils";
import { z } from 'zod';
import { headers } from 'next/headers';
import { DEFAULT_MODEL_ID } from '@/lib/ai-models';
import { evaluateDdosProtection } from '@/lib/ddos-defense';
import { searchWebOffers, hasTavilyAvailability } from '@/lib/tavily';
import { getCountryOption, normalizeCountryCode } from '@/lib/geo';
import {
    classifyOfferIntent,
    detectQueryLanguage,
    buildTavilyBenchmarkQuery,
    getIntentScoringGuidance,
} from '@/lib/search-intent';

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
    redFlags: z.array(z.string()).optional().default([]),
    breakdown: z.object({
        relevance: z.number(),
        quality: z.number(),
        trend: z.number()
    })
});

const AnalyzeInputSchema = z.object({
    offers: z.array(z.any()).min(1, "Au moins une offre est requise pour l'analyse").max(100, "Maximum 100 offres par analyse"),
    limit: z.number().int().min(1).max(20).default(3),
    modelName: z.string().max(200).optional().default(DEFAULT_MODEL_ID),
    clientApiKey: z.string().max(500).optional(),
    language: z.enum(['fr', 'en']).default('fr'),
    clientTavilyKey: z.string().max(500).optional(),
});

const AnalysisResponseSchema = z.object({
    topOffers: z.array(ScoredOfferSchema),
    marketSummary: z.string()
});

export async function analyzeOffersAction(
    offers: Offer[],
    profile: UserProfile,
    limit: number = 3,
    modelName: string = DEFAULT_MODEL_ID,
    clientApiKey?: string, // Optional OpenRouter BYOK key
    language: 'fr' | 'en' = 'fr',
    clientTavilyKey?: string // Optional Tavily BYOK key
): Promise<AgentActionResult<AnalysisResponse>> {
    const startedAt = Date.now();
    const targetCountry = normalizeCountryCode(profile.country);
    const countryMeta = getCountryOption(targetCountry);
    
    const inputValidation = AnalyzeInputSchema.safeParse({ offers, limit, modelName, clientApiKey, language, clientTavilyKey });
    if (!inputValidation.success) {
        return {
            success: false,
            error: {
                code: 'VALIDATION_FAILED',
                message: inputValidation.error.issues[0]?.message || 'Paramètres d\'analyse invalides',
            }
        };
    }

    // Check Multi-Tier Cache (Upstash Redis + Memory) to eliminate redundant AI evaluation
    const { getCache, setCache, generateCacheKey } = await import('@/lib/cache');
    const cacheKey = generateCacheKey('analyze_offers_v2', offers, { ...profile, country: targetCountry }, limit, modelName, language);
    const cachedAnalysis = await getCache<AnalysisResponse>(cacheKey);
    if (cachedAnalysis && cachedAnalysis.topOffers && cachedAnalysis.topOffers.length > 0) {
        return {
            success: true,
            data: cachedAnalysis,
            meta: {
                model: modelName,
                latencyMs: Date.now() - startedAt,
                cached: true
            }
        };
    }
    
    // Try to get API key with BYOK support
    const { getAPIKey, trackBYOKUsage, recordAITelemetry } = await import('./shared/api-key-provider');
    const apiKeyResult = await getAPIKey('openrouter', clientApiKey);
    
    if (!apiKeyResult) {
        return {
            success: false,
            error: toAgentActionError(
                new AgentError("No API key available. Please add an API key in Settings or set OPENROUTER_API_KEY.", 'API_KEY_MISSING'),
                'analyze offers'
            )
        };
    }

    // 1. DDoS & Adaptive Rate Limiting Enforcement (Max 5 requests/min per IP)
    try {
        const headerList = await headers();
        const clientIp = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                         headerList.get('x-real-ip') || 
                         '127.0.0.1';

        const ddosCheck = await evaluateDdosProtection(clientIp, 'search_analysis');
        if (!ddosCheck.allowed) {
            return {
                success: false,
                error: {
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: ddosCheck.reason || 'Seuil d\'analyse dépassé (5 requêtes/min max). Protection anti-DDoS active.'
                }
            };
        }
    } catch {
        // Silently pass if headers() called outside request context (e.g. tests)
    }

    // Quota Enforcement: Check dynamic daily quota limit for free tier
    const isByok =
        apiKeyResult.source === 'byok' ||
        apiKeyResult.source === 'guest_cookie' ||
        Boolean(clientApiKey) ||
        Boolean(clientTavilyKey);
    const { checkDailyQuota, incrementDailyQuota } = await import('./shared/quota-limiter');
    const quotaCheck = await checkDailyQuota(isByok);
    if (!quotaCheck.allowed) {
        return {
            success: false,
            error: {
                code: 'RATE_LIMITED',
                message: `Quota quotidien Free Tier (${quotaCheck.total}/jour) atteint. Créez un compte gratuit sur tavily.com pour obtenir 1 000 crédits/mois avec votre propre clé API.`,
                remedy: {
                    type: 'configure_api_key',
                    label: 'Obtenir 1 000 crédits gratuits sur Tavily',
                    targetUrl: 'https://app.tavily.com'
                }
            }
        };
    }

    // Only log in development mode
    if (process.env.NODE_ENV === 'development') {
        console.log(`[analyzeOffersAction] Using ${apiKeyResult.source} API key (country: ${targetCountry}, language: ${language})`);
    }

    // Real-time Market Benchmark via Tavily (localized to user's target country & business intent)
    const intent = classifyOfferIntent(profile.domain, profile.explicitCriteria);
    const queryLang = detectQueryLanguage(
        `${profile.domain} ${profile.explicitCriteria}`,
        countryMeta.tavilyLanguage
    );
    let benchmarkSources: { title: string; uri: string }[] = [];
    let marketBenchmarkContext = 'No external web benchmark available.';
    try {
        const canUseTavily = await hasTavilyAvailability(clientTavilyKey);
        if (canUseTavily) {
            const benchmarkQuery = buildTavilyBenchmarkQuery({
                domain: profile.domain,
                criteria: profile.explicitCriteria,
                countryCode: targetCountry,
                intent,
                queryLang,
            });
            const benchRes = await searchWebOffers(benchmarkQuery, {
                country: targetCountry,
                language: queryLang,
                searchDepth: 'basic',
                maxResults: 5,
                clientTavilyKey,
                actionName: 'analyze_market_benchmark',
            });
            if (benchRes.results.length > 0) {
                benchmarkSources = benchRes.results.map((r) => ({
                    title: r.title,
                    uri: r.url,
                }));
                marketBenchmarkContext = benchRes.results
                    .map((r, i) => `[Source ${i + 1}] ${r.title} (${r.url}): ${r.content.slice(0, 400)}`)
                    .join('\n');
            }
        }
    } catch (benchErr) {
        console.warn('[analyzeOffersAction] Tavily market benchmark skipped:', benchErr instanceof Error ? benchErr.message : benchErr);
    }

    const openrouter = new OpenRouter({
        apiKey: apiKeyResult.key,
    });

    // Preserve up to 1500 chars per offer so critical conditions, salary bands & caveats aren't lost
    const simplifiedOffers = offers.map(offer => ({
        id: offer.id,
        title: offer.title,
        price: offer.price,
        location: offer.location,
        category: offer.category,
        url: offer.url || '',
        description: offer.description.length > 1500 
            ? offer.description.substring(0, 1500) + "..." 
            : offer.description
    }));

    const intentScoringGuidance = getIntentScoringGuidance(intent);

    const systemInstruction = `
    You are an expert Market Analyst AI specializing in grounded evaluation and risk detection.
    
    TASK: Rank the provided offers and return the top ${limit} based on the user profile, target country (${countryMeta.labelFr} / ${targetCountry}), and real-time web market benchmark.
    
    ${intentScoringGuidance}

    PROCESS:
    1. Analyze every offer rigorously against the User Profile explicit criteria and implicit context.
    2. Cross-reference prices, compensation, location, and terms with the LIVE_MARKET_BENCHMARK below (adapted to ${countryMeta.labelFr}).
    3. Calculate honest, differentiated scores: Relevance (50%), Quality (30%), and Trend (20%).
    4. Explicitly detect and list any red flags (missing price, vague terms, unrealistic compensation, location mismatch, expired/generic posting) in "redFlags".
    
    OUTPUT REQUIREMENTS:
    - Return ONLY a valid JSON object.
    - DO NOT include summary text or "thinking" tags in the final JSON.
    - LANGUAGE REQUIREMENT: All textual output ("justification", "webInsights", "redFlags", "marketSummary") MUST be generated in ${language === 'fr' ? 'FRENCH (Français)' : 'ENGLISH'}.

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
          "justification": "Detailed grounded explanation citing real criteria & market context in ${language === 'fr' ? 'French' : 'English'}",
          "webInsights": ["specific benchmark fact or insight", "another market insight"],
          "redFlags": ["potential risk or missing detail if any"],
          "breakdown": {
            "relevance": number (0-100),
            "quality": number (0-100),
            "trend": number (0-100)
          }
        }
      ],
      "marketSummary": "2-3 sentence overview of the real market context in ${countryMeta.labelFr} in ${language === 'fr' ? 'French' : 'English'}"
    }

    USER PROFILE: ${JSON.stringify({ ...profile, country: targetCountry })}
    DOMAIN: ${profile.domain}
    TARGET COUNTRY: ${countryMeta.labelFr} (${targetCountry})
    LIMIT: Top ${limit} offers
    TARGET LANGUAGE: ${language.toUpperCase()}
    
    LIVE_MARKET_BENCHMARK:
    ${marketBenchmarkContext}
  `;

    let capturedUsage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | undefined;

    const operation = async () => {
        const response = await openrouter.chat.send({
            chatRequest: {
                model: modelName,
                messages: [
                    { role: "system", content: systemInstruction },
                    { role: "user", content: `Analyze these ${simplifiedOffers.length} offers and rank top ${limit}. Language: ${language.toUpperCase()}: ${JSON.stringify(simplifiedOffers)}` }
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

        // Combine Tavily market benchmark sources + verified offer source URLs (deduplicated)
        const sourceMap = new Map<string, { title: string; uri: string }>();
        benchmarkSources.forEach((src) => {
            if (src.uri && src.uri.startsWith('http')) {
                sourceMap.set(src.uri, src);
            }
        });
        mergedTopOffers.forEach((o) => {
            const url = 'url' in o && typeof o.url === 'string' ? o.url.trim() : '';
            if (url && url.startsWith('http') && !sourceMap.has(url)) {
                sourceMap.set(url, { title: o.title, uri: url });
            }
        });
        const searchSources = Array.from(sourceMap.values());

        console.log(`Analyze: Successfully analyzed ${mergedTopOffers.length} offers (${searchSources.length} verified sources)`);

        return {
            topOffers: mergedTopOffers,
            marketSummary: validatedResponse.marketSummary,
            searchSources,
            modelUsed: modelName
        };
    };
    try {
        const data = await retryWithBackoff(operation, 3, 'analyze offers');
        const latencyMs = Date.now() - startedAt;

        // Cache result for 2 hours (7200 seconds)
        await setCache(cacheKey, data, 7200).catch(() => {});

        // Record granular telemetry and token FinOps
        await recordAITelemetry({
            apiKeyResult,
            model: modelName,
            action: 'analyze_offers',
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

        // Increment daily quota on search success
        await incrementDailyQuota(isByok).catch(err =>
            console.error('Failed to increment daily quota:', err)
        );

        return {
            success: true,
            data: {
                ...data,
                modelUsed: modelName
            },
            meta: {
                model: modelName,
                latencyMs,
                cached: false
            }
        };
    } catch (error) {
        console.error('Analyze offers failed', error);
        const latencyMs = Date.now() - startedAt;

        await recordAITelemetry({
            apiKeyResult,
            model: modelName,
            action: 'analyze_offers',
            responseTimeMs: latencyMs,
            success: false,
            errorMessage: error instanceof Error ? error.message : String(error)
        }).catch(() => {});

        return {
            success: false,
            error: toAgentActionError(error, 'analyze offers')
        };
    }
}
