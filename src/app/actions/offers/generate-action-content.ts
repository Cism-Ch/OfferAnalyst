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

    // Detect real offer nature to adapt strategy, vocabulary & email structure
    const natureSignal = `${domain} ${offer.category || ''} ${offer.title} ${offer.description}`.toLowerCase();
    let offerNature = 'Opportunité professionnelle / commerciale générale';
    let natureGuidance = isNegotiation
        ? 'Focus on realistic market value benchmarks, clear counter-offer terms, and win-win leverage.'
        : 'Focus on a sharp, value-first outreach email or inquiry directly tailored to this offer.';

    if (/(immobilier|real estate|appartement|maison|villa|studio|terrain|loyer|rent|m²|pièces|lease)/i.test(natureSignal)) {
        offerNature = 'Immobilier (Achat ou Location)';
        natureGuidance = isNegotiation
            ? 'Adapt specifically to real estate: cite price/m² comparables, renovation/DPE/charges leverage, financing solidity (apport/accord bancaire), and draft a polite written price or rent counter-offer to the owner/agency.'
            : 'Draft a standout buyer/tenant application dossier & visit request highlighting financial reliability, rapid decision readiness, and specific questions about the property.';
    } else if (/(freelance|tjm|mission|prestation|appel d'offre|rfp|b2b|consulting|consultant)/i.test(natureSignal)) {
        offerNature = 'Mission Freelance / Prestation B2B';
        natureGuidance = isNegotiation
            ? 'Adapt to B2B/freelance contracting: justify target TJM/forfait via ROI, scope delimitation, payment terms, or volume commitment.'
            : 'Draft a commercial proposal / pitch tailored to the client brief: problem understanding, concrete methodology, relevant deliverables, and call-to-action for a discovery call.';
    } else if (/(produit|product|e-commerce|achat|vendeur|gpu|macbook|iphone|voiture|équipement|saas|abonnement|pricing)/i.test(natureSignal)) {
        offerNature = 'Achat Produit / Équipement / SaaS';
        natureGuidance = isNegotiation
            ? 'Adapt to vendor/commercial negotiation: reference competitor pricing, bundle/warranty conditions, bulk discount or annual commitment terms.'
            : 'Draft a sharp buyer inquiry / vendor contact message asking for exact condition, warranty, stock availability, and final all-in price.';
    } else if (/(emploi|job|cdi|cdd|recrutement|salaire|salary|développeur|engineer|manager|lead|stage|alternance)/i.test(natureSignal)) {
        offerNature = 'Offre d\'Emploi / Recrutement';
        natureGuidance = isNegotiation
            ? 'Adapt to job compensation negotiation: cover base salary, variable/bonus, equity, remote days, and onboarding package.'
            : 'Draft a tailored recruiter/hiring-manager application email & pitch matching skills directly to the role responsibilities.';
    }

    const systemPrompt = isNegotiation
        ? `You are an elite Negotiation Strategist adapting strictly to the REAL nature of the offer (${offerNature}).
Based on the offer details, the score breakdown (${offer.finalScore}%), web insights, and the user's criteria, formulate a highly practical negotiation strategy and ready-to-send email/message.

OFFER NATURE ADAPTATION (${offerNature}):
${natureGuidance}

RULES:
1. Provide a concise, commanding headline adapted to ${offerNature}.
2. Provide 3-4 concrete, grounded leverage bullet points using the real offer price/terms and web insights.
3. Provide a concrete target term realistic for this offer type (e.g. target salary/TJM, offer price in €/$, or contract clause).
4. Provide a full, polite, persuasive email/message ready to copy and send to the exact recipient type (recruiter, landlord/agency, B2B client, or seller).
5. Return ONLY a valid JSON object matching the JSON SCHEMA below.

JSON SCHEMA:
{
  "headline": "string",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "suggestedTerms": "string",
  "generatedText": "string"
}`
        : `You are an elite Outreach & Application Strategist adapting strictly to the REAL nature of the offer (${offerNature}).
Draft an authentic, high-converting, ready-to-send message / application / dossier email adapted to the exact offer type and user profile.

OFFER NATURE ADAPTATION (${offerNature}):
${natureGuidance}

RULES:
1. Provide a sharp, non-generic headline adapted to ${offerNature}.
2. Provide 3-4 key alignment arguments connecting user needs/strengths directly to this specific listing.
3. Provide a complete, ready-to-send email/message (subject/hook, specific proof/criteria, clear closing call to action).
4. Avoid generic AI clichés; make it genuinely usable for the real recipient.
5. Return ONLY a valid JSON object matching the JSON SCHEMA below.

JSON SCHEMA:
{
  "headline": "string",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "suggestedTerms": "N/A",
  "generatedText": "string"
}`;

    const userPrompt = `
OFFER TO ANALYZE (DETECTED NATURE: ${offerNature}):
- Title: ${offer.title}
- Category: ${offer.category || domain}
- Organization: ${offer.organization || 'Destinataire'}
- Location: ${offer.location}
- Stated Price/Salary: ${offer.price}
- URL: ${offer.url || 'N/A'}
- Description Excerpt: ${(offer.description || '').slice(0, 1200)}
- AI Match Score: ${offer.finalScore}%
- AI Justification: ${offer.justification}
- Verified Web Insights: ${offer.webInsights?.join(' | ') || 'N/A'}

USER SEARCH CONTEXT & PREFERENCES:
- Domain: ${domain}
- Criteria & Requirements: ${userContext || 'Profil exigeant, recherche de qualité et juste valeur'}

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
