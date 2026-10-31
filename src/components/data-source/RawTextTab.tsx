'use client';

/**
 * Raw Text Ingestion Tab
 * 
 * Allows users to paste messy unstructured text from any source
 * (LinkedIn job post, Indeed, email, Slack message) and converts it
 * into structured Offer[] using the fast AI extraction agent.
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles,
    Loader2,
    CheckCircle2,
    Trash2,
    Building2,
    MapPin,
    Coins,
    AlertCircle,
    FileText,
    ArrowRight
} from 'lucide-react';
import { Offer } from '@/types';
import { structureRawOffersAction } from '@/app/actions/offers/structure-raw-offers';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTemporaryApiKeys } from '@/hooks/use-temporary-api-keys';

interface RawTextTabProps {
    domain: string;
    model: string;
    onOffersExtracted: (offers: Offer[]) => void;
    currentOffersCount: number;
}

const SAMPLE_RAW_TEXT = `Staff Cloud Platform Engineer (Full Remote)
Entreprise : ScalableOps Tech Corp
Localisation : 100% Télétravail (Europe / US)
Salaire : 130 000 € - 150 000 € brut annuel + equity

À propos du poste :
Nous recherchons un Staff Engineer pour concevoir notre plateforme de conteneurs Kubernetes multi-cloud.
Stack : Kubernetes, Go, Terraform, AWS, Prometheus.
Avantages : 35 jours de congés, budget équipement 3000€, politique de travail asynchrone sans réunion imposée.

---

Lead Developer Backend Go / Rust
Entreprise : FinTech Parisienne
Localisation : Paris 9e (Hybride 2j présentiel)
Rémunération : 85k€ - 95k€ selon expérience

Description :
Rejoignez notre équipe Core Banking pour développer des microservices haute fréquence.
Exigences : 6+ ans d'expérience Go ou Rust, bases de données distribuées (CockroachDB), Kafka.`;

export function RawTextTab({
    domain,
    model,
    onOffersExtracted,
    currentOffersCount
}: RawTextTabProps) {
    const { language } = useLanguage();
    const isFr = language === 'fr';
    const tempKeys = useTemporaryApiKeys();

    const [rawText, setRawText] = useState<string>('');
    const [isExtracting, setIsExtracting] = useState<boolean>(false);
    const [extractedOffers, setExtractedOffers] = useState<Offer[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleExtract = async () => {
        if (!rawText.trim() || rawText.trim().length < 10) {
            setErrorMessage(isFr ? "Veuillez coller au moins 10 caractères de texte." : "Please paste at least 10 characters.");
            return;
        }

        setIsExtracting(true);
        setErrorMessage(null);

        try {
            const clientKey = tempKeys.getKey('openrouter') || 
                              tempKeys.getKey(model.split('/')[0]?.toLowerCase()) || 
                              undefined;

            const res = await structureRawOffersAction(
                rawText,
                domain,
                model,
                clientKey
            );

            if (res.success && res.data && res.data.length > 0) {
                setExtractedOffers(res.data);
                onOffersExtracted(res.data);
            } else {
                setErrorMessage(res.error?.message || (isFr ? "Échec de l'extraction. Vérifiez le texte collé." : "Extraction failed."));
            }
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : (isFr ? "Erreur de connexion lors de l'extraction." : "Connection error."));
        } finally {
            setIsExtracting(false);
        }
    };

    const handleLoadSample = () => {
        setRawText(SAMPLE_RAW_TEXT);
        setErrorMessage(null);
    };

    const handleRemoveOffer = (id: string) => {
        const updated = extractedOffers.filter(o => o.id !== id);
        setExtractedOffers(updated);
        onOffersExtracted(updated);
    };

    return (
        <div className="space-y-5">
            {/* Context & Quick Sample Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                    <h3 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span>{isFr ? "Collez vos annonces en texte brut" : "Paste raw listing text"}</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {isFr
                            ? "Faites un simple copier-coller depuis LinkedIn, Indeed, ou un email. L'IA extrait automatiquement tous les critères."
                            : "Simply copy-paste text from LinkedIn, Indeed, or email. AI structures all criteria automatically."}
                    </p>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLoadSample}
                    className="self-start sm:self-auto text-xs h-8 px-2.5 border-dashed touch-manipulation"
                >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    <span>{isFr ? "Charger un exemple" : "Load Sample"}</span>
                </Button>
            </div>

            {/* Raw Text Input Area */}
            <div className="space-y-2">
                <Textarea
                    value={rawText}
                    onChange={(e) => {
                        setRawText(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder={isFr 
                        ? "Collez ici le texte brut d'une annonce ou de plusieurs annonces séparées par '---'...\n\nExemple :\nStaff Cloud Engineer chez TechGlobal\nSalaire : 140k€, 100% remote\nStack : Kubernetes, Go..." 
                        : "Paste raw job or property posting text here...\n\nExample:\nStaff Cloud Engineer at TechGlobal\nSalary: $150k, 100% remote\nStack: Kubernetes, Go..."}
                    className="font-sans text-xs sm:text-sm min-h-[160px] sm:min-h-[200px] resize-y rounded-xl p-3.5 leading-relaxed bg-background/80"
                />

                {errorMessage && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-xs text-destructive">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}
            </div>

            {/* Extraction Trigger Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <span className="text-xs text-muted-foreground">
                    {rawText.length > 0 && `${rawText.length} ${isFr ? "caractères saisis" : "characters entered"}`}
                </span>

                <Button
                    type="button"
                    onClick={handleExtract}
                    disabled={isExtracting || rawText.trim().length < 10}
                    className="min-h-[42px] px-5 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm touch-manipulation"
                >
                    {isExtracting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>{isFr ? "Extraction IA en cours..." : "AI Structuring..."}</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4" />
                            <span>{isFr ? "Structurer avec l'IA en 1 clic" : "Structure with AI in 1-Click"}</span>
                        </>
                    )}
                </Button>
            </div>

            {/* Extracted Offers Preview List */}
            {extractedOffers.length > 0 && (
                <div className="pt-4 border-t border-border/60 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span>
                                {extractedOffers.length} {isFr ? "offres prêtes pour l'analyse" : "offers structured and ready"}
                            </span>
                        </span>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs">
                            {isFr ? "Prêt à scorer" : "Ready to rank"}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {extractedOffers.map((offer, idx) => (
                            <Card key={offer.id || idx} className="border border-border/70 bg-card p-3.5 rounded-xl space-y-2 relative">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-0.5 min-w-0">
                                        <Badge variant="secondary" className="text-[10px] font-mono mb-1">
                                            #{idx + 1}
                                        </Badge>
                                        <h4 className="text-xs sm:text-sm font-bold text-foreground line-clamp-1">
                                            {offer.title}
                                        </h4>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveOffer(offer.id)}
                                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                        title={isFr ? "Supprimer cette offre" : "Remove"}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>

                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground pt-1">
                                    {offer.organization && (
                                        <span className="flex items-center gap-1 truncate">
                                            <Building2 className="h-3 w-3 text-primary shrink-0" />
                                            {offer.organization}
                                        </span>
                                    )}
                                    {offer.location && (
                                        <span className="flex items-center gap-1 truncate">
                                            <MapPin className="h-3 w-3 text-primary shrink-0" />
                                            {offer.location}
                                        </span>
                                    )}
                                    {offer.price && offer.price !== "N/A" && (
                                        <span className="flex items-center gap-1 font-semibold text-foreground">
                                            <Coins className="h-3 w-3 text-amber-500 shrink-0" />
                                            {offer.price}
                                        </span>
                                    )}
                                </div>

                                {offer.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed pt-1 border-t border-border/40">
                                        {offer.description}
                                    </p>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
