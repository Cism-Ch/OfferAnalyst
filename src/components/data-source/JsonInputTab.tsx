'use client';

/**
 * Developer / API JSON Input Tab
 * 
 * Preserves raw JSON editing for technical users, automation pipelines,
 * and API integrations.
 */

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Code2,
    AlertCircle,
    Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface JsonInputTabProps {
    value: string;
    onChange: (val: string) => void;
    disabled?: boolean;
}

const DEFAULT_SAMPLE_JSON = `[
  {
    "id": "1",
    "title": "Staff Platform Engineer",
    "organization": "CloudScale Global",
    "description": "Kubernetes, Go, AWS, Remote Worldwide",
    "price": "145000 €",
    "location": "Full Remote",
    "category": "Tech"
  },
  {
    "id": "2",
    "title": "Lead Software Engineer",
    "organization": "FinTech Paris",
    "description": "Next.js, TypeScript, PostgreSQL, Hybride 2j",
    "price": "90000 €",
    "location": "Paris, France",
    "category": "Tech"
  }
]`;

export function JsonInputTab({ value, onChange, disabled }: JsonInputTabProps) {
    const { language } = useLanguage();
    const isFr = language === 'fr';

    const [error, setError] = useState<string | null>(null);

    const handleFormat = () => {
        try {
            const parsed = JSON.parse(value || '[]');
            onChange(JSON.stringify(parsed, null, 2));
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "JSON invalide");
        }
    };

    const handleLoadSample = () => {
        onChange(DEFAULT_SAMPLE_JSON);
        setError(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
                            <Code2 className="h-4 w-4 text-primary" />
                            <span>{isFr ? "Mode Développeur / JSON API" : "Developer Mode / Raw JSON API"}</span>
                        </h3>
                        <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                            Advanced
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {isFr
                            ? "Collez ou éditez directement une charge utile JSON standard (tableau d'objets Offer)."
                            : "Paste or directly edit standard JSON payload (Offer[] array)."}
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleLoadSample}
                        className="text-xs h-8 px-2.5 touch-manipulation"
                    >
                        <Sparkles className="h-3.5 w-3.5 mr-1 text-primary" />
                        <span>{isFr ? "Exemple" : "Sample"}</span>
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleFormat}
                        className="text-xs h-8 px-2.5 touch-manipulation"
                    >
                        <span>{isFr ? "Formater" : "Beautify"}</span>
                    </Button>
                </div>
            </div>

            <Textarea
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    if (error) setError(null);
                }}
                disabled={disabled}
                placeholder={DEFAULT_SAMPLE_JSON}
                className="font-mono text-xs h-60 sm:h-72 resize-y rounded-xl p-3.5 leading-relaxed bg-background/90"
            />

            {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-xs text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{isFr ? `Erreur de syntaxe JSON : ${error}` : `JSON Syntax Error: ${error}`}</span>
                </div>
            )}
        </div>
    );
}
