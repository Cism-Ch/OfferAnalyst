'use client';

/**
 * File Upload Ingestion Tab
 * 
 * Supports CSV, TXT, or JSON file uploads.
 * Automatically parses CSV columns (title, company, price, location, description)
 * into normalized Offer[] items.
 */

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
    Upload,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    Trash2,
} from 'lucide-react';
import { Offer } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface FileUploadTabProps {
    domain: string;
    onOffersExtracted: (offers: Offer[]) => void;
}

export function FileUploadTab({ domain, onOffersExtracted }: FileUploadTabProps) {
    const { language } = useLanguage();
    const isFr = language === 'fr';

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [parsedOffers, setParsedOffers] = useState<Offer[]>([]);
    const [error, setError] = useState<string | null>(null);

    const parseCsvContent = (content: string): Offer[] => {
        const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
            throw new Error(isFr ? "Le fichier CSV doit comporter au moins une ligne d'en-tête et une ligne de données." : "CSV must have at least one header row and one data row.");
        }

        const delimiter = lines[0].includes(';') ? ';' : ',';
        const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/['"]/g, ''));

        // Identify key column indexes
        const titleIdx = headers.findIndex(h => h.includes('tit') || h.includes('job') || h.includes('poste') || h.includes('nom') || h.includes('name'));
        const orgIdx = headers.findIndex(h => h.includes('ent') || h.includes('comp') || h.includes('org') || h.includes('societ'));
        const priceIdx = headers.findIndex(h => h.includes('sal') || h.includes('prix') || h.includes('remun') || h.includes('price') || h.includes('pay'));
        const locIdx = headers.findIndex(h => h.includes('loc') || h.includes('ville') || h.includes('city') || h.includes('remote') || h.includes('pays'));
        const descIdx = headers.findIndex(h => h.includes('desc') || h.includes('detail') || h.includes('text') || h.includes('info'));

        const offers: Offer[] = [];
        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
            if (row.length === 0 || row.every(c => c === '')) continue;

            const title = (titleIdx !== -1 && row[titleIdx]) ? row[titleIdx] : `${domain} #${i}`;
            const org = (orgIdx !== -1 && row[orgIdx]) ? row[orgIdx] : "Non spécifié";
            const price = (priceIdx !== -1 && row[priceIdx]) ? row[priceIdx] : "N/A";
            const location = (locIdx !== -1 && row[locIdx]) ? row[locIdx] : "Non spécifié";
            const description = (descIdx !== -1 && row[descIdx]) ? row[descIdx] : row.join(' - ');

            offers.push({
                id: String(i),
                title,
                organization: org,
                price,
                location,
                category: domain,
                description
            });
        }
        return offers;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (!content) return;

            try {
                if (file.name.endsWith('.csv')) {
                    const extracted = parseCsvContent(content);
                    setParsedOffers(extracted);
                    onOffersExtracted(extracted);
                } else if (file.name.endsWith('.json')) {
                    const parsed = JSON.parse(content);
                    const list = Array.isArray(parsed) ? parsed : parsed.offers || [];
                    if (!Array.isArray(list) || list.length === 0) {
                        throw new Error(isFr ? "Le fichier JSON doit contenir une liste d'offres." : "JSON file must contain an array of offers.");
                    }
                    setParsedOffers(list);
                    onOffersExtracted(list);
                } else {
                    // Plain text file: fallback simple lines
                    const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
                    const list: Offer[] = lines.map((l, idx) => ({
                        id: String(idx + 1),
                        title: l.slice(0, 50),
                        description: l,
                        price: "N/A",
                        location: "Non spécifié",
                        category: domain
                    }));
                    setParsedOffers(list);
                    onOffersExtracted(list);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : (isFr ? "Erreur de lecture du fichier." : "File read error."));
            }
        };
        reader.readAsText(file);
    };

    const handleClear = () => {
        setFileName(null);
        setParsedOffers([]);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onOffersExtracted([]);
    };

    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-primary" />
                    <span>{isFr ? "Importer un fichier (CSV, Excel ou TXT)" : "Upload File (CSV or TXT)"}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                    {isFr
                        ? "Glissez-déposez un tableau CSV ou un export d'offres. Les colonnes salaire, titre et localisation sont mappées automatiquement."
                        : "Drag and drop a CSV file. Title, salary, and location columns are automatically mapped."}
                </p>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv,.txt,.json"
                className="hidden"
            />

            {/* Dropzone */}
            <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border/80 hover:border-primary/50 bg-muted/20 hover:bg-muted/40 transition-colors rounded-2xl p-6 sm:p-8 text-center cursor-pointer space-y-3"
            >
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Upload className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-foreground">
                        {fileName ? fileName : (isFr ? "Cliquez pour sélectionner un fichier CSV, JSON ou TXT" : "Click to select a CSV, JSON, or TXT file")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {isFr ? "Formats supportés : .csv (recommandé), .json, .txt jusqu'à 5 Mo" : "Supported formats: .csv, .json, .txt up to 5 MB"}
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-xs text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Parsed Result Summary */}
            {parsedOffers.length > 0 && (
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                            {parsedOffers.length} {isFr ? "offres extraites avec succès depuis le fichier." : "offers successfully extracted."}
                        </span>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className="h-7 text-xs text-muted-foreground hover:text-destructive"
                    >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        <span>{isFr ? "Réinitialiser" : "Reset"}</span>
                    </Button>
                </div>
            )}
        </div>
    );
}
