'use client';

/**
 * Security Migration Banner
 * 
 * Displays a persistent banner to inform users about the API key security update
 * and prompts them to re-enter their keys.
 */

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const BANNER_DISMISSED_KEY = 'api_security_migration_dismissed';
const BANNER_VERSION = 'v1_2026_01'; // Change this to show banner again

export function SecurityMigrationBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Check if banner was already dismissed for this version
        const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
        if (dismissed !== BANNER_VERSION) {
            setIsVisible(true);
        }
        setIsLoaded(true);
    }, []);

    const handleDismiss = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(BANNER_DISMISSED_KEY, BANNER_VERSION);
        }
        setIsVisible(false);
    };

    if (!isLoaded || !isVisible) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold mb-1">
                                🔐 Mise à Jour de Sécurité - Action Requise
                            </p>
                            <p className="text-xs opacity-90">
                                Nous avons amélioré la sécurité de vos clés API avec un chiffrement AES-256-GCM. 
                                Veuillez re-saisir vos clés API pour bénéficier de la protection renforcée.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard/api-keys">
                            <Button 
                                size="sm" 
                                variant="secondary"
                                className="bg-white text-blue-600 hover:bg-blue-50"
                            >
                                Mettre à Jour
                            </Button>
                        </Link>
                        <Link href="/changelog">
                            <Button 
                                size="sm" 
                                variant="ghost"
                                className="text-white hover:bg-blue-800"
                            >
                                En Savoir Plus
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleDismiss}
                            className="text-white hover:bg-blue-800"
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
    return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
                <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                        Stockage Temporaire - Sécurité Limitée
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                        <p className="mb-2">
                            Vos clés sont stockées localement et expirent dans 24h. Pour une sécurité optimale :
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Créez un compte pour le chiffrement AES-256-GCM</li>
                            <li>Bénéficiez d'un stockage persistant et sécurisé</li>
                            <li>Accédez aux statistiques d'utilisation</li>
                        </ul>
                        <div className="mt-3 flex gap-2">
                            <Link href="/auth/signup">
                                <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                                    Créer un Compte
                                </Button>
                            </Link>
                            <Link href="/auth/login">
                                <Button size="sm" variant="outline">
                                    Se Connecter
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
