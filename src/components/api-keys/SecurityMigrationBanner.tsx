'use client';

/**
 * Security Migration Banner & Guest Storage Notice
 * 
 * Uses semantic HSL theme tokens (compatible with Light, Dark, and Neon themes)
 * and non-blocking inline layout so it never obscures the sticky ModernHeader.
 */

import React, { useState } from 'react';
import { X, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

const BANNER_DISMISSED_KEY = 'api_security_migration_dismissed';
const BANNER_VERSION = 'v1_2026_01';

export function SecurityMigrationBanner() {
    const { language } = useLanguage();
    const isFr = language === 'fr';
    const [state, setState] = useState<{ isVisible: boolean; isLoaded: boolean }>(() => {
        if (typeof window === 'undefined') {
            return { isVisible: false, isLoaded: true };
        }
        
        const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
        return {
            isVisible: dismissed !== BANNER_VERSION,
            isLoaded: true
        };
    });

    const handleDismiss = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(BANNER_DISMISSED_KEY, BANNER_VERSION);
        }
        setState(prev => ({ ...prev, isVisible: false }));
    };

    if (!state.isLoaded || !state.isVisible) {
        return null;
    }

    return (
        <div className="border-b border-primary/20 bg-primary/10 text-foreground">
            <div className="container mx-auto px-4 py-2.5 max-w-6xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3 flex-1">
                        <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5 sm:mt-0" />
                        <div className="flex-1">
                            <p className="text-xs sm:text-sm font-semibold">
                                {isFr
                                    ? 'Chiffrement Cloud AES-256-GCM Actif'
                                    : 'AES-256-GCM Cloud Encryption Active'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {isFr
                                    ? 'Vos clés API enregistrées sur un compte connecté sont chiffrées de bout en bout avec AES-256-GCM.'
                                    : 'API keys saved to an authenticated account are encrypted at rest with AES-256-GCM.'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Link href="/changelog">
                            <Button size="sm" variant="outline" className="h-8 text-xs">
                                {isFr ? 'En savoir plus' : 'Learn more'}
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleDismiss}
                            aria-label={isFr ? 'Fermer la bannière' : 'Dismiss banner'}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function UnauthenticatedSecurityWarning() {
    const { language } = useLanguage();
    const isFr = language === 'fr';

    return (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 mb-6 text-foreground">
            <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-amber-500">
                        {isFr
                            ? 'Mode Invité — Stockage Temporaire (24h)'
                            : 'Guest Mode — Temporary Storage (24h)'}
                    </h3>
                    <div className="mt-1.5 text-xs sm:text-sm text-muted-foreground space-y-2">
                        <p>
                            {isFr
                                ? 'Vos clés sont stockées localement dans votre navigateur et expirent après 24 heures. Pour une sécurité optimale :'
                                : 'Your keys are stored locally in your browser and expire after 24 hours. For optimal security:'}
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>
                                {isFr
                                    ? 'Créez un compte pour activer le chiffrement serveur AES-256-GCM'
                                    : 'Create an account to enable server-side AES-256-GCM encryption'}
                            </li>
                            <li>
                                {isFr
                                    ? 'Synchronisez vos clés et projets sur tous vos appareils'
                                    : 'Sync your keys and projects across all your devices'}
                            </li>
                        </ul>
                        <div className="pt-2 flex flex-wrap gap-2">
                            <Link href="/auth/signup">
                                <Button size="sm">
                                    {isFr ? 'Créer un compte' : 'Create Account'}
                                </Button>
                            </Link>
                            <Link href="/auth/login">
                                <Button size="sm" variant="outline">
                                    {isFr ? 'Se connecter' : 'Sign In'}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
