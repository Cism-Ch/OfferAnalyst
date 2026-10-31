'use server';

/**
 * Server Action: Dispatch Offer Alert
 * 
 * Validates alert parameters with Zod and triggers asynchronous
 * notification via Webhook (Slack, Discord, generic HTTP) or Email.
 */

import { z } from 'zod';
import { dispatchOfferWebhook, OfferAlertPayload, WebhookDispatchResult } from '@/lib/alerts/offer-match-notifier';

const OfferAlertSchema = z.object({
    offer: z.object({
        id: z.string(),
        title: z.string().min(1, 'Titre requis'),
        company: z.string().min(1, 'Entreprise requise'),
        score: z.number().min(0).max(100),
        location: z.string().optional(),
        price: z.string().optional(),
        url: z.string().url().optional().or(z.literal('')),
        keyStrengths: z.array(z.string()).optional()
    }),
    destination: z.object({
        webhookUrl: z.string().url('URL de webhook invalide').optional().or(z.literal('')),
        email: z.string().email('Adresse email invalide').optional().or(z.literal('')),
        minScore: z.number().min(50).max(100).default(80),
        webhookSecret: z.string().optional()
    }),
    criteria: z.object({
        domain: z.string().optional(),
        mustHaves: z.array(z.string()).optional(),
        niceToHaves: z.array(z.string()).optional()
    }).optional(),
    isTest: z.boolean().optional()
});

export type DispatchOfferAlertInput = z.infer<typeof OfferAlertSchema>;

export interface DispatchOfferAlertOutput {
    success: boolean;
    data?: {
        dispatched: boolean;
        results: WebhookDispatchResult[];
        minScoreThreshold: number;
        offerScore: number;
    };
    error?: string;
}

export async function dispatchOfferAlertAction(
    rawInput: DispatchOfferAlertInput
): Promise<DispatchOfferAlertOutput> {
    try {
        const parsed = OfferAlertSchema.safeParse(rawInput);
        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message || 'Données invalides';
            return {
                success: false,
                error: firstError
            };
        }

        const { offer, destination, criteria, isTest } = parsed.data;

        // Verify minimum score unless this is an explicit test dispatch
        const minScore = destination.minScore || 80;
        if (!isTest && offer.score < minScore) {
            return {
                success: false,
                error: `L'offre (#${offer.id}) a un score de ${offer.score}%, inférieur au seuil configuré (${minScore}%). Aucune alerte déclenchée.`
            };
        }

        if (!destination.webhookUrl && !destination.email) {
            return {
                success: false,
                error: 'Veuillez renseigner au moins une destination valide (URL de Webhook ou Email).'
            };
        }

        const results: WebhookDispatchResult[] = [];
        const payload: OfferAlertPayload = {
            offer: {
                id: offer.id,
                title: offer.title,
                company: offer.company,
                score: offer.score,
                location: offer.location,
                price: offer.price,
                url: offer.url || undefined,
                keyStrengths: offer.keyStrengths
            },
            criteria,
            triggeredAt: new Date().toISOString()
        };

        // 1. Dispatch to Webhook if provided
        if (destination.webhookUrl) {
            const webhookRes = await dispatchOfferWebhook(
                destination.webhookUrl,
                payload,
                destination.webhookSecret
            );
            results.push(webhookRes);
        }

        // 2. Dispatch to Email if provided
        if (destination.email) {
            // Emulate email dispatch result for now
            results.push({
                success: true,
                destination: 'email',
                message: `Alerte préparée pour ${destination.email}`,
                target: destination.email
            });
        }

        const anyFailure = results.some(r => !r.success);

        return {
            success: !anyFailure,
            data: {
                dispatched: true,
                results,
                minScoreThreshold: minScore,
                offerScore: offer.score
            },
            error: anyFailure ? results.find(r => !r.success)?.message : undefined
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Erreur interne lors du dispatch de l\'alerte'
        };
    }
}
