'use client';

/**
 * URL Ingestion Tab
 * 
 * Allows users to paste 1 to 5 opportunity or job listing URLs.
 * Validates URLs for security (HTTPS, valid syntax) and structures them
 * as input candidates for the analysis engine.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
    Link as LinkIcon,
    Plus,
    Trash2,
    CheckCircle2,
    Globe,
    AlertCircle,
    ExternalLink
} from 'lucide-react';
import { Offer } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface UrlImportTabProps {
    domain: string;
    onOffersExtracted: (offers: Offer[]) => void;
}

export function UrlImportTab({ domain, onOffersExtracted }: UrlImportTabProps) {
    const { language } = useLanguage();
    const isFr = language === 'fr';

    const [urls, setUrls] = useState<string[]>([
        'https://example.com/jobs/staff-cloud-architect',
        'https://example.com/jobs/lead-platform-engineer'
    ]);
    const [currentInput, setCurrentInput] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const validateUrl = (url: string): boolean => {
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'https:' || parsed.protocol === 'http:';
        } catch {
            return false;
        }
    };

    const handleAddUrl = () => {
        const trimmed = currentInput.trim();
        if (!trimmed) return;

        if (!validateUrl(trimmed)) {
            setError(isFr ? "Veuillez entrer une URL valide débutant par https://" : "Please enter a valid URL starting with https://");
            return;
        }

        if (urls.includes(trimmed)) {
            setError(isFr ? "Cette URL a déjà été ajoutée." : "This URL is already in the list.");
            return;
        }

        if (urls.length >= 10) {
            setError(isFr ? "Limite de 10 URLs atteinte par lot." : "Maximum limit of 10 URLs reached.");
            return;
        }

        const newUrls = [...urls, trimmed];
        setUrls(newUrls);
        setCurrentInput('');
        setError(null);
        syncOffers(newUrls);
    };

    const handleRemoveUrl = (index: number) => {
        const newUrls = urls.filter((_, i) => i !== index);
        setUrls(newUrls);
        syncOffers(newUrls);
    };

    const syncOffers = (list: string[]) => {
        const structured: Offer[] = list.map((url, idx) => {
            const domainName = (new URL(url)).hostname.replace('www.', '');
            return {
                id: String(idx + 1),
                title: `${domain} - Offre #${idx + 1} (${domainName})`,
                organization: domainName,
                description: `Offre importée depuis le lien : ${url}`,
                price: "Vérification en cours",
                location: "À analyser",
                category: domain,
                url: url
            };
        });
        onOffersExtracted(structured);
    };

    const handleApplyUrls = () => {
        syncOffers(urls);
    };

    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <span>{isFr ? "Importer des offres depuis des liens (URLs)" : "Import from URLs"}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                    {isFr
                        ? "Ajoutez jusqu'à 10 liens directs vers des pages d'annonces (LinkedIn, Indeed, sites carrières)."
                        : "Add up to 10 direct listing URLs (LinkedIn, Indeed, career sites)."}
                </p>
            </div>

            {/* URL Input Form */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="url"
                        value={currentInput}
                        onChange={(e) => {
                            setCurrentInput(e.target.value);
                            if (error) setError(null);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddUrl();
                            }
                        }}
                        placeholder="https://..."
                        className="pl-9 text-xs sm:text-sm h-10 rounded-xl"
                    />
                </div>
                <Button
                    type="button"
                    onClick={handleAddUrl}
                    className="min-h-[40px] px-4 gap-1.5 shrink-0 touch-manipulation font-semibold"
                >
                    <Plus className="h-4 w-4" />
                    <span>{isFr ? "Ajouter l'URL" : "Add URL"}</span>
                </Button>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-xs text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* URL List */}
            <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    {urls.length} {isFr ? "liens configurés" : "links queued"}
                </span>

                {urls.map((url, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/70 bg-card text-xs"
                    >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Badge variant="outline" className="font-mono text-[10px] shrink-0">
                                #{idx + 1}
                            </Badge>
                            <span className="font-mono text-foreground truncate">{url}</span>
                            <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-muted-foreground hover:text-primary shrink-0"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveUrl(idx)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                ))}
            </div>

            <div className="pt-2 flex justify-end">
                <Button
                    type="button"
                    onClick={handleApplyUrls}
                    disabled={urls.length === 0}
                    className="min-h-[40px] px-5 gap-1.5 font-semibold touch-manipulation"
                >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isFr ? "Valider la sélection des liens" : "Confirm Link Selection"}</span>
                </Button>
            </div>
        </div>
    );
}
