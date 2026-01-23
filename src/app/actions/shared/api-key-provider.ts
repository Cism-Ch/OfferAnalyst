'use server';

/**
 * API Key Provider Utility
 * 
 * Provides API keys for server actions with BYOK support.
 * Priority:
 * 1. User's BYOK key from database (authenticated users)
 * 2. Client-provided temporary key (unauthenticated users)
 * 3. Environment variable (fallback)
 */

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getDecryptedAPIKey, updateAPIKeyUsage } from '@/app/actions/db/api-keys';
import { prisma } from '@/lib/prisma';

export interface APIKeyResult {
    key: string;
    source: 'byok' | 'temp' | 'env';
    provider: string;
    keyId?: string;
}

/**
 * Get API key for a specific provider
 * Checks user's BYOK keys first, then client-provided temp keys, then environment variables
 * 
 * @param provider - AI provider name
 * @param clientApiKey - Optional temporary key from unauthenticated users (from localStorage)
 */
export async function getAPIKey(
    provider: 'openrouter' | 'openai' | 'anthropic' | 'google' | 'mistral',
    clientApiKey?: string
): Promise<APIKeyResult | null> {
    // Try to get authenticated user's BYOK key first
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (session?.user?.id) {
            // User is authenticated, check for BYOK keys
            const decryptedKey = await getDecryptedAPIKey(session.user.id, provider);
            
            if (decryptedKey) {
                console.log(`[getAPIKey] Using BYOK key for ${provider}`);
                
                // Get the key ID for usage tracking
                const keyRecord = await prisma.aPIKey.findFirst({
                    where: {
                        userId: session.user.id,
                        provider: provider,
                        isActive: true
                    },
                    select: { id: true }
                });
                
                return {
                    key: decryptedKey,
                    source: 'byok',
                    provider,
                    keyId: keyRecord?.id
                };
            }
        }
    } catch (error) {
        console.error('[getAPIKey] Error checking for user BYOK keys:', error);
        // Fall through to next options
    }

    // If client provided a temporary key, use it
    if (clientApiKey) {
        console.log(`[getAPIKey] Using client-provided temporary key for ${provider}`);
        return {
            key: clientApiKey,
            source: 'temp',
            provider
        };
    }

    // Fallback to environment variable
    const envKey = getEnvAPIKey(provider);
    if (envKey) {
        console.log(`[getAPIKey] Using environment variable for ${provider}`);
        return {
            key: envKey,
            source: 'env',
            provider
        };
    }

    console.warn(`[getAPIKey] No API key found for ${provider}`);
    return null;
}

/**
 * Get API key from environment variables
 */
function getEnvAPIKey(provider: string): string | null {
    switch (provider.toLowerCase()) {
        case 'openrouter':
            return process.env.OPENROUTER_API_KEY || null;
        case 'openai':
            return process.env.OPENAI_API_KEY || null;
        case 'anthropic':
            return process.env.ANTHROPIC_API_KEY || null;
        case 'google':
        case 'gemini':
            return process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || null;
        case 'mistral':
            return process.env.MISTRAL_API_KEY || null;
        default:
            return null;
    }
}

/**
 * Track API key usage after a successful request
 * Call this after using a BYOK key
 */
export async function trackBYOKUsage(keyId: string): Promise<void> {
    try {
        await updateAPIKeyUsage(keyId);
    } catch (error) {
        console.error('[trackBYOKUsage] Error tracking usage:', error);
        // Don't throw - tracking failures shouldn't break the main operation
    }
}
