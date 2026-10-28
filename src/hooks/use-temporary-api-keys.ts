'use client';

/**
 * Temporary API Keys Hook
 * 
 * Manages temporary API keys for unauthenticated (Guest) users.
 * Keys are stored in localStorage with:
 * - 1-day expiration
 * - Simple obfuscation
 * - Device/browser fingerprint to limit visibility
 */

import { useState, useEffect, useCallback } from 'react';

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

function obfuscate(text: string): string {
    return btoa(text);
}

function deobfuscate(text: string): string {
    try {
        return atob(text);
    } catch {
        return '';
    }
}

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

    const saveKeys = useCallback((keysToSave: TemporaryAPIKey[]) => {
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
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const timer = setTimeout(() => {
            try {
                const stored = window.localStorage.getItem(STORAGE_KEY);
                if (!stored) {
                    setIsLoaded(true);
                    return;
                }

                const data = JSON.parse(deobfuscate(stored));
                const fingerprint = getBrowserFingerprint();

                const validKeys = data.filter((key: TemporaryAPIKey & { fingerprint?: string }) => {
                    const expiresAt = new Date(key.expiresAt);
                    const isExpired = expiresAt < new Date();
                    const isCorrectBrowser = !key.fingerprint || key.fingerprint === fingerprint;
                    return !isExpired && isCorrectBrowser;
                });

                setKeys(validKeys);
                
                if (validKeys.length !== data.length) {
                    saveKeys(validKeys);
                }
            } catch (error) {
                console.error('Failed to load temporary API keys:', error);
            } finally {
                setIsLoaded(true);
            }
        }, 0);

        return () => clearTimeout(timer);
    }, [saveKeys]);

    const addKey = useCallback((name: string, provider: string, key: string): string => {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + ONE_DAY_MS);
        
        const randomBytes = new Uint8Array(8);
        if (typeof window !== 'undefined' && window.crypto) {
            window.crypto.getRandomValues(randomBytes);
        }
        const randomId = Array.from(randomBytes, byte => byte.toString(36)).join('');
        
        const newKey: TemporaryAPIKey = {
            id: `temp_${Date.now()}_${randomId}`,
            name,
            provider: provider.toLowerCase(),
            key: key.trim(),
            createdAt: now.toISOString(),
            expiresAt: expiresAt.toISOString()
        };

        setKeys(prev => {
            const updatedKeys = [...prev, newKey];
            saveKeys(updatedKeys);
            return updatedKeys;
        });
        
        return newKey.id;
    }, [saveKeys]);

    const deleteKey = useCallback((id: string) => {
        setKeys(prev => {
            const updatedKeys = prev.filter(k => k.id !== id);
            saveKeys(updatedKeys);
            return updatedKeys;
        });
    }, [saveKeys]);

    const getKey = useCallback((provider: string): string | null => {
        const key = keys.find(k => k.provider.toLowerCase() === provider.toLowerCase());
        return key ? key.key : null;
    }, [keys]);

    const clearAllKeys = useCallback(() => {
        setKeys([]);
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    return {
        keys,
        isLoaded,
        addKey,
        deleteKey,
        getKey,
        clearAllKeys
    };
}
