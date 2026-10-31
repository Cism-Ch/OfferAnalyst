'use client';

/**
 * Interactive 1-Click Demo Widget (SaaS Vitrine)
 * 
 * Demonstrates the power of OfferAnalyst's multi-axis AI scoring,
 * contextual rankings, and verified anti-hallucination web citations
 * with zero signup friction and 1-click preset switching.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Sparkles,
    CheckCircle2,
    TrendingUp,
    ShieldCheck,
    ExternalLink,
    Zap,
    BarChart3,
    RefreshCw,
    Briefcase,
    Building2,
    Layers,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { setAppModeCookie } from '@/lib/cookie-nav';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

export interface DemoOffer {
    id: string;
    title: string;
    organization: string;
    location: string;
    score: number;
    badge: string;
    axes: {
        name: string;
        score: number;
    }[];
    verdict: string;
    citations: {
        source: string;
        metric: string;
        detail: string;
    }[];
}

export interface DemoPreset {
    id: string;
    label: string;
    icon: React.ElementType;
    context: {
        domain: string;
        mustHaves: string;
        preferences: string;
    };
    offers: DemoOffer[];
}

const DEMO_PRESETS: DemoPreset[] = [
    {
        id: 'tech-remote',
        label: 'Tech Expat & Remote',
        icon: Briefcase,
        context: {
            domain: 'Staff / Lead Cloud Engineering',
            mustHaves: '100% Remote, Rémunération > 120k€, Stack Moderne (K8s/Go)',
            preferences: 'Équilibre de vie, asynchrone, culture produit internationale'
        },
        offers: [
            {
                id: 'remote-1',
                title: 'Staff Cloud Architect (Full Remote US/EU)',
                organization: 'DistributedCloud Global',
                location: 'Remote Global (Base EU/US)',
                score: 94,
                badge: 'Top Match #1',
                axes: [
                    { name: 'Rémunération & Reste-à-vivre', score: 96 },
                    { name: 'Stack & Outillage Moderne', score: 92 },
                    { name: 'Flexibilité & Autonomie', score: 95 },
                    { name: 'Culture & Équilibre de Vie', score: 93 }
                ],
                verdict: 'Alignement quasi-parfait. Compensation au 95e percentile, politique télétravail asynchrone formalisée et allocation coworking annuelle incluse.',
                citations: [
                    {
                        source: 'levels.fyi (Q3 2026)',
                        metric: '145k€ - 165k€ Base + Bonus',
                        detail: 'Fourchette certifiée pour profil Staff Cloud en Europe sans décote géographique.'
                    },
                    {
                        source: 'Glassdoor Verified (4.8/5)',
                        metric: 'Culture Asynchrone 98%',
                        detail: 'Zéro micro-management, réunions limitées à 3h par semaine, forte autonomie.'
                    }
                ]
            },
            {
                id: 'remote-2',
                title: 'Lead Platform Engineer (Hybride)',
                organization: 'FinTech ScaleUp Paris',
                location: 'Paris, France (2j site)',
                score: 81,
                badge: 'Match Modéré #2',
                axes: [
                    { name: 'Rémunération & Reste-à-vivre', score: 78 },
                    { name: 'Stack & Outillage Moderne', score: 88 },
                    { name: 'Flexibilité & Autonomie', score: 76 },
                    { name: 'Culture & Équilibre de Vie', score: 82 }
                ],
                verdict: 'Stack technique de pointe et projet stimulant, mais reste-à-vivre diminué par le coût du logement francilien et contrainte de 2 jours de présence sur site.',
                citations: [
                    {
                        source: 'TechSalary Index Paris',
                        metric: '85k€ - 95k€ Brut',
                        detail: 'Dans la médiane parisienne, mais reste-à-vivre inférieur de 22% par rapport au full remote de province.'
                    },
                    {
                        source: 'Accord Télétravail 2025/2026',
                        metric: '2j/semaine obligatoires',
                        detail: 'Présence mardi et jeudi contrôlée par badgeuse, flexibilité modérée.'
                    }
                ]
            },
            {
                id: 'remote-3',
                title: 'Consultant SRE & DevOps Freelance',
                organization: 'Enterprise Tech Partners',
                location: 'Missions Europe (Déplacements)',
                score: 69,
                badge: 'Score Pénalisé #3',
                axes: [
                    { name: 'Rémunération & Reste-à-vivre', score: 89 },
                    { name: 'Stack & Outillage Moderne', score: 70 },
                    { name: 'Flexibilité & Autonomie', score: 65 },
                    { name: 'Culture & Équilibre de Vie', score: 52 }
                ],
                verdict: 'Taux journalier moyen attractif (750€/j), mais forte pénalisation sur les critères indispensables : astreintes de nuit obligatoires et dépendance à des socles legacy.',
                citations: [
                    {
                        source: 'Malt Insights Pro',
                        metric: 'TJM 750€ - 800€/j',
                        detail: 'Excellent niveau brut, mais instabilité contractuelle sur cycles de 3 mois.'
                    },
                    {
                        source: 'Retours Équipe Tech',
                        metric: 'Astreintes 1 sem./mois',
                        detail: 'Astreintes non majorées le week-end, incompatible avec l équilibre familial souhaité.'
                    }
                ]
            }
        ]
    },
    {
        id: 'b2b-sourcing',
        label: 'Recrutement & Sourcing B2B',
        icon: Building2,
        context: {
            domain: 'Sourcing Candidats Clés / Rôles Stratégiques',
            mustHaves: 'Expertise Next.js 16 / TypeScript Strict, Expérience Production IA',
            preferences: 'Leadership technique, contributions open-source, esprit entrepreneurial'
        },
        offers: [
            {
                id: 'cand-1',
                title: 'Profil A : Principal Fullstack & Architecte IA',
                organization: 'Candidate Assessment Report',
                location: 'Ex-Tech Lead SaaS AI',
                score: 96,
                badge: 'Top Match #1',
                axes: [
                    { name: 'Adéquation Stack (Next/TS/IA)', score: 98 },
                    { name: 'Leadership & Autonomie', score: 95 },
                    { name: 'Potentiel d Impact Produit', score: 96 },
                    { name: 'Alignement Rémunération', score: 94 }
                ],
                verdict: 'Profil exceptionnel. A conçu et déployé 3 architectures serverless combinant LLM et pipelines asynchrones QStash. Score de fit maximal.',
                citations: [
                    {
                        source: 'GitHub Verified Metrics',
                        metric: 'Top 1% TS Contributor',
                        detail: 'Mainteneur actif de librairies Next.js, code conforme aux règles strictes de production.'
                    },
                    {
                        source: 'Références Validées',
                        metric: 'Recommandation 10/10',
                        detail: 'Capacité démontrée à accélérer les livraisons de 40% sans dette technique.'
                    }
                ]
            },
            {
                id: 'cand-2',
                title: 'Profil B : Senior Fullstack React/Node',
                organization: 'Candidate Assessment Report',
                location: 'ESN Grands Comptes',
                score: 75,
                badge: 'Match Partiel #2',
                axes: [
                    { name: 'Adéquation Stack (Next/TS/IA)', score: 72 },
                    { name: 'Leadership & Autonomie', score: 78 },
                    { name: 'Potentiel d Impact Produit', score: 74 },
                    { name: 'Alignement Rémunération', score: 76 }
                ],
                verdict: 'Bonne maîtrise React traditionnelle mais manque de pratique sur Next.js App Router v16 et intégrations LLM en production.',
                citations: [
                    {
                        source: 'Évaluation Technique',
                        metric: 'Score Code 74/100',
                        detail: 'Habitué aux SPA Pages Router, formation requise sur les RSC et les flux streaming.'
                    }
                ]
            }
        ]
    },
    {
        id: 'real-estate',
        label: 'Arbitrage Immobilier Pro',
        icon: Layers,
        context: {
            domain: 'Locaux Commerciaux & Espaces Coworking',
            mustHaves: 'Rendement net > 7.5%, Emplacement centre-ville, Bâtiment BBC',
            preferences: 'Baux commerciaux longs, potentiel de surélévation ou réaménagement'
        },
        offers: [
            {
                id: 'immo-1',
                title: 'Immeuble Mixte Bureaux & RDC Commercial (Lyon 6e)',
                organization: 'Dossier Opportunité #409',
                location: 'Lyon 6e, Proche Part-Dieu',
                score: 91,
                badge: 'Opportunité Prime #1',
                axes: [
                    { name: 'Rendement Net Exploitation', score: 94 },
                    { name: 'Sécurité Emplacement & Desserte', score: 92 },
                    { name: 'Performance Énergétique DPE', score: 88 },
                    { name: 'Potentiel de Valorisation', score: 90 }
                ],
                verdict: 'Rendement net audité à 7.9%. Baux 3/6/9 avec enseignes pérennes, travaux récents d isolation et risque de vacance locative estimé à 2%.',
                citations: [
                    {
                        source: 'Base Notaires & DVF 2026',
                        metric: 'Prix m² : -8% marché',
                        detail: 'Acquisition négociée sous la valeur de référence du quartier.'
                    },
                    {
                        source: 'Audit Énergétique Certifié',
                        metric: 'DPE B (Faible conso)',
                        detail: 'Aucun capex de rénovation thermique requis avant 2034.'
                    }
                ]
            },
            {
                id: 'immo-2',
                title: 'Plateau Bureaux Périphérie (Zone Activité)',
                organization: 'Dossier Opportunité #214',
                location: 'Périphérie Métropolitaine',
                score: 64,
                badge: 'Risque Élevé #2',
                axes: [
                    { name: 'Rendement Net Exploitation', score: 70 },
                    { name: 'Sécurité Emplacement & Desserte', score: 58 },
                    { name: 'Performance Énergétique DPE', score: 62 },
                    { name: 'Potentiel de Valorisation', score: 66 }
                ],
                verdict: 'Rendement brut alléchant (8.5%), mais vacance moyenne de 14 mois dans la zone et DPE E exigeant plus de 120k€ de rénovation.',
                citations: [
                    {
                        source: 'Observatoire Immobilier Régional',
                        metric: 'Taux vacance 18.4%',
                        detail: 'Offre excédentaire de bureaux sur la commune, baisse des loyers de 4%/an.'
                    }
                ]
            }
        ]
    }
];

export function InteractiveDemoWidget() {
    const router = useRouter();
    const { language } = useLanguage();
    const isFr = language === 'fr';

    const [activePresetId, setActivePresetId] = useState<string>('tech-remote');
    const [selectedOfferId, setSelectedOfferId] = useState<string>('remote-1');
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [analysisStep, setAnalysisStep] = useState<number>(3); // 3 = ready

    const activePreset = DEMO_PRESETS.find(p => p.id === activePresetId) || DEMO_PRESETS[0];
    const selectedOffer = activePreset.offers.find(o => o.id === selectedOfferId) || activePreset.offers[0];

    const runSimulation = (presetId?: string) => {
        const targetId = presetId || activePresetId;
        setIsAnalyzing(true);
        setAnalysisStep(1);

        setTimeout(() => {
            setAnalysisStep(2);
        }, 450);

        setTimeout(() => {
            setAnalysisStep(3);
            setIsAnalyzing(false);
            if (presetId) {
                const newPreset = DEMO_PRESETS.find(p => p.id === targetId);
                if (newPreset && newPreset.offers.length > 0) {
                    setSelectedOfferId(newPreset.offers[0].id);
                }
            }
        }, 950);
    };

    const handleSelectPreset = (presetId: string) => {
        if (presetId === activePresetId) return;
        setActivePresetId(presetId);
        runSimulation(presetId);
    };

    const handleGoToApp = () => {
        setAppModeCookie('app');
        router.push('/search-context');
    };

    return (
        <Card className="border-border/80 shadow-2xl bg-card/85 backdrop-blur-md overflow-hidden relative">
            {/* Subtle Neon Accents */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

            <CardHeader className="border-b border-border/60 pb-5 bg-muted/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 px-2.5 py-0.5 text-xs font-semibold">
                                <Sparkles className="h-3.5 w-3.5 mr-1 inline" />
                                {isFr ? "Démo Interactive en 1 Clic" : "Interactive 1-Click Demo"}
                            </Badge>
                            <span className="text-xs text-muted-foreground hidden sm:inline">
                                • {isFr ? "Sans inscription ni clé requise" : "No signup or key required"}
                            </span>
                        </div>
                        <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                            {isFr ? "Scoring Multi-Axes & Citations Web en Direct" : "Live Multi-Axis Scoring & Web Citations"}
                        </CardTitle>
                        <CardDescription className="text-sm mt-1 text-muted-foreground">
                            {isFr
                                ? "Voyez comment l'algorithme dissèque et classe 3 opportunités réelles selon des critères stricts."
                                : "See how our AI engine evaluates and ranks 3 real opportunities against strict criteria."}
                        </CardDescription>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => runSimulation()}
                            disabled={isAnalyzing}
                            className="min-h-[40px] px-3 gap-1.5 border-border/80 text-xs sm:text-sm font-medium touch-manipulation"
                            title={isFr ? "Relancer l'évaluation" : "Rerun evaluation"}
                        >
                            <RefreshCw className={cn("h-3.5 w-3.5", isAnalyzing && "animate-spin text-primary")} />
                            <span>{isFr ? "Relancer le scan" : "Rescan Demo"}</span>
                        </Button>

                        <Button
                            size="sm"
                            onClick={handleGoToApp}
                            className="min-h-[40px] px-4 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold shadow-md touch-manipulation"
                        >
                            <span>{isFr ? "Démarrer l'App" : "Start Real App"}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                {/* Preset Selector Buttons */}
                <div className="pt-4 flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-medium text-muted-foreground mr-1">
                        {isFr ? "Scénario test :" : "Test scenario:"}
                    </span>
                    {DEMO_PRESETS.map((preset) => {
                        const Icon = preset.icon;
                        const isSelected = preset.id === activePresetId;
                        return (
                            <button
                                key={preset.id}
                                onClick={() => handleSelectPreset(preset.id)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all min-h-[36px] border touch-manipulation",
                                    isSelected
                                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                        : "bg-background/80 hover:bg-muted text-foreground border-border/70"
                                )}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                <span>{preset.label}</span>
                            </button>
                        );
                    })}
                </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-6">
                {/* Active Search Context Mini-Banner */}
                <div className="rounded-xl p-3 sm:p-4 bg-muted/40 border border-border/60 text-xs sm:text-sm space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                                {isFr ? "Contexte configuré :" : "Configured Context:"}
                            </span>
                            <Badge variant="secondary" className="font-mono text-xs">
                                {activePreset.context.domain}
                            </Badge>
                        </div>
                        <span className="text-muted-foreground text-[11px]">
                            {isFr ? "Moteur : NVIDIA Nemotron 3.5 Lightning" : "Engine: NVIDIA Nemotron 3.5 Lightning"}
                        </span>
                    </div>
                    <div className="text-muted-foreground flex flex-col gap-1 pt-1 text-xs">
                        <p>
                            <strong className="text-foreground">{isFr ? "Exigences strictes : " : "Must-haves: "}</strong>
                            {activePreset.context.mustHaves}
                        </p>
                        <p>
                            <strong className="text-foreground">{isFr ? "Préférences : " : "Preferences: "}</strong>
                            {activePreset.context.preferences}
                        </p>
                    </div>
                </div>

                {/* Analysis Loading Progress Bar */}
                <AnimatePresence>
                    {isAnalyzing && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2 overflow-hidden"
                        >
                            <div className="flex items-center justify-between text-xs font-medium text-primary">
                                <span className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 animate-spin" />
                                    {analysisStep === 1 && (isFr ? "Extraction des critères et normalisation contextuelle..." : "Extracting criteria & contextual normalisation...")}
                                    {analysisStep === 2 && (isFr ? "Scoring multi-axes via NVIDIA Nemotron 3.5..." : "Multi-axis scoring via NVIDIA Nemotron 3.5...")}
                                    {analysisStep === 3 && (isFr ? "Vérification des citations web anti-hallucination..." : "Verifying anti-hallucination web citations...")}
                                </span>
                                <span>{analysisStep === 1 ? '35%' : analysisStep === 2 ? '75%' : '100%'}</span>
                            </div>
                            <Progress
                                value={analysisStep === 1 ? 35 : analysisStep === 2 ? 75 : 100}
                                className="h-1.5 [&>[data-slot=progress-indicator]]:bg-primary"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Presentation Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Left Column: Ranked Offer List */}
                    <div className="lg:col-span-5 space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {isFr ? "Classement IA Contextuel" : "Contextual AI Ranking"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {activePreset.offers.length} {isFr ? "offres analysées" : "offers evaluated"}
                            </span>
                        </div>

                        <div className="space-y-2.5">
                            {activePreset.offers.map((offer, idx) => {
                                const isSelected = offer.id === selectedOffer.id;
                                const isWinner = idx === 0;

                                return (
                                    <div
                                        key={offer.id}
                                        onClick={() => setSelectedOfferId(offer.id)}
                                        className={cn(
                                            "p-3.5 rounded-xl border transition-all cursor-pointer relative",
                                            isSelected
                                                ? "bg-primary/5 border-primary shadow-sm"
                                                : "bg-card hover:bg-muted/50 border-border/70"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                                                    isWinner
                                                        ? "bg-primary text-primary-foreground shadow-xs"
                                                        : "bg-muted text-muted-foreground"
                                                )}>
                                                    #{idx + 1}
                                                </span>
                                                <h4 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-1">
                                                    {offer.title}
                                                </h4>
                                            </div>
                                            <Badge
                                                variant={offer.score >= 85 ? "default" : offer.score >= 75 ? "secondary" : "outline"}
                                                className={cn(
                                                    "text-xs font-mono font-bold shrink-0",
                                                    offer.score >= 85 && "bg-emerald-600 text-white hover:bg-emerald-600"
                                                )}
                                            >
                                                {offer.score}%
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-muted-foreground pl-8">
                                            <span className="truncate">{offer.organization} • {offer.location}</span>
                                            <span className="text-[11px] font-medium text-primary shrink-0 ml-2">
                                                {isSelected ? (isFr ? "Détails ouverts" : "Viewing") : (isFr ? "Voir détails" : "Inspect")}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: Detailed Breakdown of Selected Offer */}
                    <div className="lg:col-span-7 bg-muted/20 border border-border/70 rounded-xl p-4 sm:p-5 space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs font-semibold bg-background">
                                        {selectedOffer.badge}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">{selectedOffer.organization}</span>
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-foreground mt-1">
                                    {selectedOffer.title}
                                </h3>
                            </div>

                            <div className="text-left sm:text-right shrink-0">
                                <span className="text-[11px] uppercase font-semibold text-muted-foreground block">
                                    {isFr ? "Score d'adéquation" : "Match Score"}
                                </span>
                                <span className={cn(
                                    "text-2xl sm:text-3xl font-extrabold font-mono",
                                    selectedOffer.score >= 85 ? "text-emerald-500" : selectedOffer.score >= 75 ? "text-amber-500" : "text-rose-500"
                                )}>
                                    {selectedOffer.score}%
                                </span>
                            </div>
                        </div>

                        {/* Multi-Axis Breakdown */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <BarChart3 className="h-3.5 w-3.5 text-primary" />
                                <span>{isFr ? "Évaluation Multidimensionnelle" : "Multi-Dimensional Axes"}</span>
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {selectedOffer.axes.map((axis, i) => (
                                    <div key={i} className="p-2.5 rounded-lg bg-background/80 border border-border/60 space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-medium text-foreground truncate">{axis.name}</span>
                                            <span className="font-mono font-bold text-primary">{axis.score}%</span>
                                        </div>
                                        <Progress
                                            value={axis.score}
                                            className={cn(
                                                "h-1.5",
                                                axis.score >= 85 && "[&>[data-slot=progress-indicator]]:bg-emerald-500",
                                                axis.score < 85 && axis.score >= 70 && "[&>[data-slot=progress-indicator]]:bg-primary",
                                                axis.score < 70 && "[&>[data-slot=progress-indicator]]:bg-amber-500"
                                            )}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Synthesis & Weak Signals */}
                        <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20 space-y-1.5 text-xs sm:text-sm">
                            <div className="flex items-center gap-1.5 font-semibold text-primary">
                                <Zap className="h-4 w-4" />
                                <span>{isFr ? "Arbitrage & Synthèse Déterministe" : "AI Arbitration & Synthesis"}</span>
                            </div>
                            <p className="text-foreground/90 leading-relaxed text-xs sm:text-sm">
                                {selectedOffer.verdict}
                            </p>
                        </div>

                        {/* Verified Web Citations (The Core Anti-Hallucination Moat) */}
                        <div className="space-y-2.5">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                <span>{isFr ? "Citations Web Vérifiées (Anti-Hallucination)" : "Verified Web Citations (Anti-Hallucination)"}</span>
                            </h4>

                            <div className="space-y-2">
                                {selectedOffer.citations.map((cite, i) => (
                                    <div key={i} className="p-3 rounded-lg bg-background/90 border border-border/70 text-xs space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-primary flex items-center gap-1.5">
                                                <ExternalLink className="h-3 w-3" />
                                                {cite.source}
                                            </span>
                                            <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                                                {cite.metric}
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground text-xs leading-normal">
                                            {cite.detail}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final Call To Action Banner */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-purple-500/10 border border-primary/20">
                    <div>
                        <p className="text-sm font-semibold text-foreground">
                            {isFr ? "Prêt à évaluer vos propres opportunités ?" : "Ready to rank your own real opportunities?"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {isFr
                                ? "Entrez vos critères personnalisés et analysez jusqu'à 30 offres simultanément."
                                : "Input your custom criteria and evaluate up to 30 offers simultaneously."}
                        </p>
                    </div>

                    <Button
                        size="default"
                        onClick={handleGoToApp}
                        className="w-full sm:w-auto min-h-[44px] px-6 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md touch-manipulation"
                    >
                        <span>{isFr ? "Démarrer mes analyses" : "Launch My Analyses"}</span>
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
