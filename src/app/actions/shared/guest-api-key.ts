'use server';

/**
 * Guest API Key Server Actions
 * 
 * Secure ephemeral 24-hour storage for unauthenticated / guest personal API keys.
 * Encrypted using AES-256-GCM via src/lib/api-key-encryption.ts and stored in an
 * HttpOnly, Secure, SameSite: "lax" cookie named 'offeranalyst.guest_key'.
 * Never exposes raw plaintext keys to the client.
 */

import { cookies } from 'next/headers';
import { z } from 'zod';
import { encryptApiKeyToParts, decryptApiKeyFromParts } from '@/lib/api-key-encryption';

const GUEST_KEY_COOKIE_NAME = 'offeranalyst.guest_key';
const GUEST_KEY_MAX_AGE_SECONDS = 86400; // 24 hours

const SupportedProviderSchema = z.enum([
    'openrouter',
    'openai',
    'anthropic',
    'google',
    'gemini',
    'mistral',
    'deepseek'
]);

const SaveGuestApiKeyInputSchema = z.object({
    provider: SupportedProviderSchema,
    apiKey: z.string()
        .trim()
        .min(8, 'La clé API est trop courte (minimum 8 caractères)')
        .max(500, 'La clé API est trop longue')
        .refine(val => !/\s/.test(val), 'La clé API ne doit pas contenir d\'espaces')
});

export type SupportedGuestProvider = z.infer<typeof SupportedProviderSchema>;

export interface GuestApiKeyPayload {
    provider: string;
    ciphertext: string;
    iv: string;
    tag: string;
    expiresAt: number;
}

export interface GuestApiKeyStatus {
    hasKey: boolean;
    provider?: string;
    maskedKey?: string;
    expiresAt?: number;
    isExpired?: boolean;
}

/**
 * Compute masked preview of an API key (e.g., sk-or-••••••••1234).
 * Ensures that sensitive key credentials are never sent to the client.
 */
function maskApiKey(key: string): string {
    if (!key || key.length < 8) return '••••••••';
    
    // Check for standard prefixes
    if (key.startsWith('sk-or-v1-')) {
        return `sk-or-••••••••${key.slice(-4)}`;
    }
    if (key.startsWith('sk-or-')) {
        return `sk-or-••••••••${key.slice(-4)}`;
    }
    if (key.startsWith('sk-ant-')) {
        return `sk-ant-••••••••${key.slice(-4)}`;
    }
    if (key.startsWith('sk-')) {
        return `sk-••••••••${key.slice(-4)}`;
    }
    if (key.startsWith('AIza')) {
        return `AIza••••••••${key.slice(-4)}`;
    }

    // Default masking: first 4 and last 4
    return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

/**
 * Save a guest personal API key in a 24h encrypted HttpOnly cookie.
 */
export async function saveGuestApiKeyAction(input: {
    provider: string;
    apiKey: string;
}): Promise<{
    success: boolean;
    data?: {
        provider: string;
        maskedKey: string;
        expiresAt: number;
    };
    error?: {
        code: string;
        message: string;
    };
}> {
    try {
        const validated = SaveGuestApiKeyInputSchema.safeParse({
            provider: input.provider.toLowerCase(),
            apiKey: input.apiKey.trim()
        });

        if (!validated.success) {
            const firstIssue = validated.error.issues[0]?.message || 'Données de clé API invalides';
            return {
                success: false,
                error: {
                    code: 'VALIDATION_FAILED',
                    message: firstIssue
                }
            };
        }

        const { provider, apiKey } = validated.data;
        const now = Date.now();
        const expiresAt = now + (GUEST_KEY_MAX_AGE_SECONDS * 1000);

        // Encrypt the key using AES-256-GCM with random IV and auth tag
        const encryptedParts = encryptApiKeyToParts(apiKey);

        const payload: GuestApiKeyPayload = {
            provider,
            ciphertext: encryptedParts.ciphertext,
            iv: encryptedParts.iv,
            tag: encryptedParts.tag,
            expiresAt
        };

        const cookieStore = await cookies();
        cookieStore.set(GUEST_KEY_COOKIE_NAME, JSON.stringify(payload), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: GUEST_KEY_MAX_AGE_SECONDS,
            path: '/'
        });

        const maskedKey = maskApiKey(apiKey);

        return {
            success: true,
            data: {
                provider,
                maskedKey,
                expiresAt
            }
        };
    } catch (error) {
        console.error('[saveGuestApiKeyAction] Error saving guest API key:', error);
        return {
            success: false,
            error: {
                code: 'ENCRYPTION_FAILED',
                message: 'Impossible de chiffrer et sauvegarder la clé API invité.'
            }
        };
    }
}

/**
 * Clear the guest API key cookie.
 */
export async function clearGuestApiKeyAction(): Promise<{
    success: boolean;
    data?: { cleared: boolean };
    cleared: boolean;
}> {
    try {
        const cookieStore = await cookies();
        cookieStore.delete(GUEST_KEY_COOKIE_NAME);
        return {
            success: true,
            data: { cleared: true },
            cleared: true
        };
    } catch (error) {
        console.error('[clearGuestApiKeyAction] Error deleting cookie:', error);
        return {
            success: false,
            cleared: false
        };
    }
}

/**
 * Retrieve metadata and masked preview of the guest API key.
 * Never leaks the plaintext key.
 */
export async function getGuestApiKeyAction(): Promise<{
    success: boolean;
    data: GuestApiKeyStatus;
    hasKey: boolean;
    provider?: string;
    maskedKey?: string;
    expiresAt?: number;
    isExpired?: boolean;
}> {
    try {
        const cookieStore = await cookies();
        const cookie = cookieStore.get(GUEST_KEY_COOKIE_NAME);

        if (!cookie?.value) {
            const fallback: GuestApiKeyStatus = {
                hasKey: false,
                isExpired: false
            };
            return {
                success: true,
                data: fallback,
                ...fallback
            };
        }

        const payload: GuestApiKeyPayload = JSON.parse(cookie.value);
        const now = Date.now();
        const isExpired = Boolean(payload.expiresAt && now > payload.expiresAt);

        if (isExpired) {
            const expiredStatus: GuestApiKeyStatus = {
                hasKey: false,
                provider: payload.provider,
                expiresAt: payload.expiresAt,
                isExpired: true
            };
            return {
                success: true,
                data: expiredStatus,
                ...expiredStatus
            };
        }

        // Decrypt key in memory ONLY to compute masked preview
        let masked = '••••••••';
        try {
            const plaintext = decryptApiKeyFromParts({
                ciphertext: payload.ciphertext,
                iv: payload.iv,
                tag: payload.tag
            });
            masked = maskApiKey(plaintext);
        } catch {
            masked = '••••••••';
        }

        const status: GuestApiKeyStatus = {
            hasKey: true,
            provider: payload.provider,
            maskedKey: masked,
            expiresAt: payload.expiresAt,
            isExpired: false
        };

        return {
            success: true,
            data: status,
            ...status
        };
    } catch (error) {
        console.error('[getGuestApiKeyAction] Error reading guest key cookie:', error);
        const fallback: GuestApiKeyStatus = {
            hasKey: false,
            isExpired: false
        };
        return {
            success: true,
            data: fallback,
            ...fallback
        };
    }
}

/**
 * Internal server-only helper to read and decrypt the guest API key.
 * Used by the server-side API Key Resolver (getAPIKey).
 */
export async function getGuestDecryptedApiKey(): Promise<{
    provider: string;
    apiKey: string;
} | null> {
    try {
        const cookieStore = await cookies();
        const cookie = cookieStore.get(GUEST_KEY_COOKIE_NAME);
        if (!cookie?.value) return null;

        const payload: GuestApiKeyPayload = JSON.parse(cookie.value);
        if (payload.expiresAt && Date.now() > payload.expiresAt) {
            return null; // Expired
        }

        const plaintext = decryptApiKeyFromParts({
            ciphertext: payload.ciphertext,
            iv: payload.iv,
            tag: payload.tag
        });

        if (!plaintext) return null;

        return {
            provider: payload.provider,
            apiKey: plaintext
        };
    } catch (error) {
        console.error('[getGuestDecryptedApiKey] Error decrypting guest key:', error);
        return null;
    }
}
