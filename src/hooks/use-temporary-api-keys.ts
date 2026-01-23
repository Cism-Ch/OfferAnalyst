'use client';

/**
 * Temporary API Keys Hook
 * 
 * Manages temporary API keys for unauthenticated users.
 * Keys are stored in localStorage with:
 * - 1-day expiration
 * - Simple obfuscation (not true encryption, as browser-side encryption without server is limited)
 * - Device/browser fingerprint to limit visibility
 * 
 * Note: This is NOT secure encryption. Keys in localStorage can be accessed by:
 * - The user themselves
 * - Browser extensions
 * - XSS attacks
 * 
 * For true security, users should authenticate and store keys server-side.
 */

import { useState, useEffect } from 'react';

interface TemporaryAPIKey {
    id: string;
    name: string;
    provider: string;
    key: string;
    createdAt: string;
    expiresAt: string;
}

const STORAGE_KEY = 'offeranalyst_temp_api_keys';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Simple obfuscation (NOT encryption)
 * This just makes it slightly harder to spot keys in localStorage
 */
function obfuscate(text: string): string {
    return btoa(text); // Base64 encoding
}

function deobfuscate(text: string): string {
    try {
        return atob(text); // Base64 decoding
    } catch {
        return '';
    }
}

/**
 * Generate a simple browser fingerprint
 */
function getBrowserFingerprint(): string {
    if (typeof window === 'undefined') return '';
    
    const components = [
        navigator.userAgent,
        navigator.language,
        new Date().getTimezoneOffset(),
        screen.colorDepth,
        screen.width + 'x' + screen.height
    ];
    
    return btoa(components.join('|'));
}

export function useTemporaryApiKeys() {
    const [keys, setKeys] = useState<TemporaryAPIKey[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load keys from localStorage on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                setIsLoaded(true);
                return;
            }

            const data = JSON.parse(deobfuscate(stored));
            const fingerprint = getBrowserFingerprint();

            // Filter out expired keys and keys from other browsers
            const validKeys = data.filter((key: TemporaryAPIKey & { fingerprint?: string }) => {
                const expiresAt = new Date(key.expiresAt);
                const isExpired = expiresAt < new Date();
                const isCorrectBrowser = !key.fingerprint || key.fingerprint === fingerprint;
                return !isExpired && isCorrectBrowser;
            });

            setKeys(validKeys);
            
            // Save back filtered keys if any were removed
            if (validKeys.length !== data.length) {
                saveKeys(validKeys);
            }
        } catch (error) {
            console.error('Failed to load temporary API keys:', error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const saveKeys = (keysToSave: TemporaryAPIKey[]) => {
        if (typeof window === 'undefined') return;
        
        try {
            const fingerprint = getBrowserFingerprint();
            const dataWithFingerprint = keysToSave.map(key => ({
                ...key,
                fingerprint
            }));
            const encoded = obfuscate(JSON.stringify(dataWithFingerprint));
            window.localStorage.setItem(STORAGE_KEY, encoded);
        } catch (error) {
            console.error('Failed to save temporary API keys:', error);
        }
    };

    const addKey = (name: string, provider: string, key: string): string => {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + ONE_DAY_MS);
        
        const newKey: TemporaryAPIKey = {
            id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            name,
            provider,
            key,
            createdAt: now.toISOString(),
            expiresAt: expiresAt.toISOString()
        };

        const updatedKeys = [...keys, newKey];
        setKeys(updatedKeys);
        saveKeys(updatedKeys);
        
        return newKey.id;
    };

    const deleteKey = (id: string) => {
        const updatedKeys = keys.filter(k => k.id !== id);
        setKeys(updatedKeys);
        saveKeys(updatedKeys);
    };

    const getKey = (provider: string): string | null => {
        const key = keys.find(k => k.provider.toLowerCase() === provider.toLowerCase());
        return key ? key.key : null;
    };

    const clearAllKeys = () => {
        setKeys([]);
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(STORAGE_KEY);
        }
    };

    return {
        keys,
        isLoaded,
        addKey,
        deleteKey,
        getKey,
        clearAllKeys
    };
}
