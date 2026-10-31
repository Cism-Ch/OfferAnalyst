'use server';

/**
 * Server Action: Generate Post-Scoring Action Content
 * 
 * Transforms an analyzed, high-scoring offer into actionable deliverables:
 * 1. 'negotiation_pitch'  : Strategic leverage points, target compensation, and a ready-to-send counter-offer script.
 * 2. 'custom_application': A tailored, non-generic application pitch / letter matching the user's criteria.
 */

import { OpenRouter } from "@openrouter/sdk";
import { ScoredOffer, AgentActionResult } from "@/types";
import { AgentError, parseJSONFromText, retryWithBackoff, toAgentActionError } from "../shared/agent-utils";
import { z } from 'zod';
import { DEFAULT_MODEL_ID } from '@/lib/ai-models';
import { checkDailyQuota } from '../shared/quota-limiter';

export type PostScoreActionType = 'negotiation_pitch' | 'custom_application';

export interface ActionContentResult {
    headline: string;
    keyPoints: string[];
    suggestedTerms?: string;
    generatedText: string;
    actionType: PostScoreActionType;
}

const GenerateActionInputSchema = z.object({
    offer: z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().optional().default(""),
        price: z.union([z.string(), z.number()]).optional().default("N/A"),
        location: z.string().optional().default("Non spécifié"),
        finalScore: z.number().optional().default(85),
        breakdown: z.object({
            relevance: z.number().optional().default(85),
            quality: z.number().optional().default(80),
            trend: z.number().optional().default(80),
        }).optional(),
        justification: z.string().optional().default(""),
        webInsights: z.array(z.string()).optional().default([])
    }),
    domain: z.string().max(200).optional().default("Opportunités"),
    userContext: z.string().max(10000).optional().default(""),
    actionType: z.enum(['negotiation_pitch', 'custom_application']),
    modelName: z.string().max(200).optional().default(DEFAULT_MODEL_ID),
    clientApiKey: z.string().max(500).optional(),
});

export async function generateOfferActionContentAction(
    offer: ScoredOffer,
    domain: string = "Opportunités",
    userContext: string = "",
    actionType: PostScoreActionType = 'negotiation_pitch',
    modelName: string = DEFAULT_MODEL_ID,
    clientApiKey?: string
): Promise<AgentActionResult<ActionContentResult>> {
    const inputValidation = GenerateActionInputSchema.safeParse({
        offer,
        domain,
        userContext,
        actionType,
        modelName,
        clientApiKey
    });

    if (!inputValidation.success) {
        return {
            success: false,
            error: {
                code: 'VALIDATION_FAILED',
                message: inputValidation.error.issues[0]?.message || 'Données d offre invalides',
            }
        };
    }

    const startTime = Date.now();

    const { getAPIKey, trackBYOKUsage, recordAITelemetry } = await import('../shared/api-key-provider');

    const apiKeyResult = await getAPIKey('openrouter', clientApiKey);
    if (!apiKeyResult?.key) {
        return {
            success: false,
            error: {
                code: 'API_KEY_MISSING',
                message: 'Aucune clé API configurée pour générer les livrables post-analyse.',
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

    const isNegotiation = actionType === 'negotiation_pitch';

    const systemPrompt = isNegotiation
        ? `You are an elite Negotiation Strategist for high-stakes career and business opportunities.
Based on the offer details, the score breakdown (${offer.finalScore}%), web insights, and the user's must-haves, formulate an ultra-targeted negotiation strategy and counter-offer pitch script.

RULES:
1. Provide a concise, commanding headline.
2. Provide 3-4 specific leverage bullet points (e.g. market benchmarks, high cost of living compensation, unique match on strict tech stack).
3. Provide a concrete target term (e.g. "+15% compensation / 95k€ + 1 day additional remote").
4. Provide a full, polite, diplomatic and persuasive message/email script ready to copy and send.
5. Return ONLY a valid JSON object matching the JSON SCHEMA below.

JSON SCHEMA:
{
  "headline": "string",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "suggestedTerms": "string",
  "generatedText": "string"
}`
        : `You are an elite Executive Career Consultant and Ghostwriter.
Draft an authentic, high-converting, tailored application pitch / introductory letter for the given offer and user profile.

RULES:
1. Provide a sharp, non-generic headline.
2. Provide 3-4 key alignment arguments (connecting user strengths directly with the job's core challenges).
3. Provide a complete, ready-to-send application message / letter (hook, proof of impact, closing call to action).
4. Avoid corporate clichés and AI fluff; write with confidence, clarity, and authority.
5. Return ONLY a valid JSON object matching the JSON SCHEMA below.

JSON SCHEMA:
{
  "headline": "string",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "suggestedTerms": "N/A",
  "generatedText": "string"
}`;

    const userPrompt = `
OFFER TO ANALYZE:
- Title: ${offer.title}
- Organization: ${offer.organization || 'Entreprise'}
- Location: ${offer.location}
- Stated Price/Salary: ${offer.price}
- AI Match Score: ${offer.finalScore}%
- AI Justification: ${offer.justification}
- Verified Web Insights: ${offer.webInsights?.join(' | ') || 'N/A'}

USER SEARCH CONTEXT & PREFERENCES:
- Domain: ${domain}
- Criteria & Lifestyle Requirements: ${userContext || 'Profil exigeant, recherche d impact et d équilibre'}

Generate the ${actionType} deliverable now in French (or English if user context is predominantly English).
`;

    try {
        const responseText = await retryWithBackoff(async () => {
            const completion = await openrouter.chat.send({
                chatRequest: {
                    model: modelName,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.2,
                    maxTokens: 3500
                }
            });

            const choiceContent = completion?.choices?.[0]?.message?.content;
            const content = typeof choiceContent === 'string'
                ? choiceContent
                : (Array.isArray(choiceContent) ? JSON.stringify(choiceContent) : null);

            if (!content) {
                throw new AgentError("Réponse vide du modèle lors de la génération.", 'NO_RESPONSE');
            }
            return content;
        }, 3, 'generate_action_content');

        const parsedJson = parseJSONFromText(responseText) as {
            headline?: string;
            keyPoints?: string[];
            suggestedTerms?: string;
            generatedText?: string;
        };

        const result: ActionContentResult = {
            headline: parsedJson.headline || (isNegotiation ? "Stratégie de Négociation" : "Candidature Sur-Mesure"),
            keyPoints: Array.isArray(parsedJson.keyPoints) ? parsedJson.keyPoints : ["Point clé d alignement identifié"],
            suggestedTerms: parsedJson.suggestedTerms || undefined,
            generatedText: parsedJson.generatedText || "Contenu généré prêt pour révision.",
            actionType
        };

        const latencyMs = Date.now() - startTime;
        if (isByok && apiKeyResult.keyId) {
            trackBYOKUsage(apiKeyResult.keyId).catch(() => {});
        }
        await recordAITelemetry({
            apiKeyResult,
            model: modelName,
            action: 'generate_action_content',
            responseTimeMs: latencyMs,
            success: true
        }).catch(() => {});

        return {
            success: true,
            data: result,
            meta: {
                model: modelName,
                latencyMs
            }
        };
    } catch (err) {
        const latencyMs = Date.now() - startTime;
        if (apiKeyResult) {
            await recordAITelemetry({
                apiKeyResult,
                model: modelName,
                action: 'generate_action_content',
                responseTimeMs: latencyMs,
                success: false,
                errorMessage: err instanceof Error ? err.message : 'Unknown error'
            }).catch(() => {});
        }

        return {
            success: false,
            error: toAgentActionError(err, 'generate action content')
        };
    }
}
