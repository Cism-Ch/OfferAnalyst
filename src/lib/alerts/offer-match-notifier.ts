/**
 * Offer Match Notifier Service
 * 
 * Dispatches automated alerts for high-matching offers (> 80% / > 85%)
 * to Webhooks (Slack, Discord, Zapier, Make, generic HTTP) and Email.
 * Follows Rule 5 & Rule 7 (idempotent, async via QStash when configured).
 */

import crypto from 'crypto';
import { getQStashClient } from '@/lib/qstash';
import { log } from '@/lib/logger';

export interface OfferAlertPayload {
    offer: {
        id: string;
        title: string;
        company: string;
        score: number;
        location?: string;
        price?: string;
        url?: string;
        keyStrengths?: string[];
    };
    criteria?: {
        domain?: string;
        mustHaves?: string[];
        niceToHaves?: string[];
    };
    triggeredAt?: string;
    customMessage?: string;
}

export interface WebhookDispatchResult {
    success: boolean;
    destination: 'webhook' | 'email';
    message: string;
    target?: string;
    statusCode?: number;
}

/**
 * Generate HMAC SHA-256 signature for generic webhooks
 */
export function generateWebhookSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Format payload according to destination platform (Slack, Discord, Generic)
 */
function formatPayloadForPlatform(webhookUrl: string, data: OfferAlertPayload): Record<string, unknown> {
    const isSlack = webhookUrl.includes('hooks.slack.com') || webhookUrl.includes('slack.com');
    const isDiscord = webhookUrl.includes('discord.com/api/webhooks') || webhookUrl.includes('discordapp.com/api/webhooks');

    const score = data.offer.score;
    const scoreColor = score >= 85 ? '#10b981' : score >= 70 ? '#3b82f6' : '#f59e0b';
    const scoreEmoji = score >= 85 ? '[Top Match]' : '[Bon Match]';

    if (isSlack) {
        return {
            text: `${scoreEmoji} *${data.offer.title}* chez *${data.offer.company}* (Score: ${score}%)`,
            blocks: [
                {
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: `${scoreEmoji} Nouvelle offre qualifiée (${score}%)`,
                        emoji: true
                    }
                },
                {
                    type: 'section',
                    fields: [
                        { type: 'mrkdwn', text: `*Poste :*\n${data.offer.title}` },
                        { type: 'mrkdwn', text: `*Entreprise :*\n${data.offer.company}` },
                        { type: 'mrkdwn', text: `*Localisation :*\n${data.offer.location || 'Non spécifiée'}` },
                        { type: 'mrkdwn', text: `*Rémunération :*\n${data.offer.price || 'À négocier'}` }
                    ]
                },
                ...(data.offer.keyStrengths && data.offer.keyStrengths.length > 0 ? [{
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Points forts identifiés :*\n• ${data.offer.keyStrengths.slice(0, 3).join('\n• ')}`
                    }
                }] : []),
                ...(data.offer.url ? [{
                    type: 'actions',
                    elements: [
                        {
                            type: 'button',
                            text: { type: 'plain_text', text: "Voir l'offre originale" },
                            url: data.offer.url,
                            style: 'primary'
                        }
                    ]
                }] : [])
            ]
        };
    }

    if (isDiscord) {
        return {
            content: `**${scoreEmoji} Offre à forte adéquation identifiée par OfferAnalyst !**`,
            embeds: [
                {
                    title: data.offer.title,
                    description: `Entreprise : **${data.offer.company}**\nScore d'adéquation : **${score}%**`,
                    url: data.offer.url || undefined,
                    color: parseInt(scoreColor.replace('#', ''), 16),
                    fields: [
                        { name: 'Localisation', value: data.offer.location || 'Non spécifiée', inline: true },
                        { name: 'Rémunération', value: data.offer.price || 'À négocier', inline: true },
                        ...(data.offer.keyStrengths && data.offer.keyStrengths.length > 0 ? [
                            { name: 'Points forts', value: data.offer.keyStrengths.slice(0, 3).join('\n'), inline: false }
                        ] : [])
                    ],
                    footer: { text: 'OfferAnalyst AI Alert Engine' },
                    timestamp: new Date().toISOString()
                }
            ]
        };
    }

    // Generic Webhook format
    return {
        event: 'offer.matched',
        timestamp: data.triggeredAt || new Date().toISOString(),
        offer: data.offer,
        criteria: data.criteria
    };
}

/**
 * Dispatch an offer match alert to a Webhook URL
 */
export async function dispatchOfferWebhook(
    webhookUrl: string,
    data: OfferAlertPayload,
    webhookSecret?: string
): Promise<WebhookDispatchResult> {
    try {
        const payloadObj = formatPayloadForPlatform(webhookUrl, data);
        const payloadString = JSON.stringify(payloadObj);
        const secret = webhookSecret || process.env.OFFERANALYST_WEBHOOK_SECRET || 'offeranalyst_default_secret';
        const signature = generateWebhookSignature(payloadString, secret);

        // 1. Try QStash queue if configured
        const qstash = getQStashClient();
        if (qstash && process.env.QSTASH_TOKEN) {
            try {
                await qstash.publishJSON({
                    url: webhookUrl,
                    body: payloadObj,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-OfferAnalyst-Signature': signature,
                        'X-OfferAnalyst-Event': 'offer.matched'
                    },
                    retries: 3
                });
                return {
                    success: true,
                    destination: 'webhook',
                    message: 'Alerte mise en file d\'attente QStash avec succès',
                    target: webhookUrl
                };
            } catch (qErr) {
                log.warn('QStash publish failed, falling back to direct fetch', { error: qErr });
            }
        }

        // 2. Direct resilient fetch with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'OfferAnalyst-Webhook-Dispatcher/1.0',
                'X-OfferAnalyst-Signature': signature,
                'X-OfferAnalyst-Event': 'offer.matched'
            },
            body: payloadString,
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            return {
                success: false,
                destination: 'webhook',
                message: `Le webhook a retourné le code HTTP ${response.status} (${response.statusText})`,
                target: webhookUrl,
                statusCode: response.status
            };
        }

        return {
            success: true,
            destination: 'webhook',
            message: 'Alerte transmise au Webhook avec succès (HTTP 200/204)',
            target: webhookUrl,
            statusCode: response.status
        };
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erreur réseau inconnue';
        return {
            success: false,
            destination: 'webhook',
            message: `Échec d'envoi du webhook : ${errorMsg}`,
            target: webhookUrl
        };
    }
}
