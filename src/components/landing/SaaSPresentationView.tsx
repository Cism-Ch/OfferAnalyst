'use client';

/**
 * Premium SaaS Presentation View (Vitrine)
 * 
 * Designed by UI/UX specialist for high-conversion B2B & Prosumer positioning:
 * - Direct 1-Click Interactive Demo (Anti-hallucination & Multi-axis scoring)
 * - Anti-Bounce Cookie System (never resets an active app user on refresh)
 * - Bento Grid, Pricing & Trust proof
 * - Bilingual FR / EN
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Sparkles,
    ShieldCheck,
    Zap,
    Key,
    ArrowRight,
    CheckCircle2,
    Lock,
    Search,
    Database,
    LineChart
} from 'lucide-react';
import { OffanLogo } from '@/components/brand/OffanBrand';
import { InteractiveDemoWidget } from '@/components/landing/InteractiveDemoWidget';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import { PremiumThemeSelector } from '@/components/theme-selector';
import { setAppModeCookie } from '@/lib/cookie-nav';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

export function SaaSPresentationView() {
    const router = useRouter();
    const { language } = useLanguage();
    const isFr = language === 'fr';

    const handleEnterApp = () => {
        setAppModeCookie('app');
        router.push('/search-context');
    };

    const handleGoToDashboard = () => {
        setAppModeCookie('app');
        router.push('/');
    };

    const scrollToDemo = () => {
        const el = document.getElementById('interactive-demo-section');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const bentoItems = [
        {
            icon: ShieldCheck,
            title: isFr ? "Preuves & Citations Web en Direct" : "Live Proof & Verified Web Citations",
            description: isFr
                ? "Chaque score est adossé à des sources vérifiées (salaires marché, accords d'entreprise, avis certifiés). Zéro hallucination tolérée."
                : "Every score is backed by verified sources (market salaries, company agreements, certified reviews). Zero hallucinations tolerated.",
            badge: isFr ? "Anti-Hallucination" : "Anti-Hallucination",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        },
        {
            icon: Zap,
            title: isFr ? "Modèle IA Rapide & Souverain Inclus" : "Fast & Sovereign AI Model Included",
            description: isFr
                ? "Propulsé par défaut par NVIDIA Nemotron 3.5 Lightning. 10 analyses quotidiennes gratuites incluses sans carte bancaire."
                : "Powered by default with NVIDIA Nemotron 3.5 Lightning. 10 free daily analyses included without credit card.",
            badge: isFr ? "NVIDIA Nemotron" : "NVIDIA Nemotron",
            color: "text-primary",
            bg: "bg-primary/10",
            border: "border-primary/20"
        },
        {
            icon: Key,
            title: isFr ? "Mode BYOK Illimité (Bring Your Own Key)" : "Unlimited BYOK (Bring Your Own Key)",
            description: isFr
                ? "Connectez vos propres clés OpenAI, Claude 3.5 Sonnet ou DeepSeek R1. Zéro commission ajoutée sur vos tokens."
                : "Connect your own OpenAI, Claude 3.5 Sonnet, or DeepSeek R1 keys. Zero platform markup on your tokens.",
            badge: isFr ? "Zéro Marge" : "Zero Markup",
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20"
        },
        {
            icon: Lock,
            title: isFr ? "Confidentialité & Zero-Retention" : "Confidentiality & Zero-Retention",
            description: isFr
                ? "Vos critères de recherche et vos offres ne sont ni vendus ni utilisés pour entraîner des modèles publics tiers."
                : "Your proprietary search criteria and sensitive offers are never sold or used to train third-party public models.",
            badge: isFr ? "GDPR / Strict" : "GDPR Compliant",
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
        }
    ];

    const steps = [
        {
            num: "01",
            icon: Search,
            title: isFr ? "Définissez le Contexte" : "Define the Context",
            desc: isFr
                ? "Renseignez vos critères stricts indispensables (salaire plancher, 100% remote, tech stack) et vos préférences souples."
                : "Set your must-have requirements (minimum salary, 100% remote, tech stack) and flexible lifestyle preferences."
        },
        {
            num: "02",
            icon: Database,
            title: isFr ? "Fournissez les Offres" : "Feed the Opportunities",
            desc: isFr
                ? "Collez des URLs d'annonces, un texte brut copié-collé, ou des fiches structurées sans friction."
                : "Paste job or deal URLs, raw copied text, or structured files seamlessly without format friction."
        },
        {
            num: "03",
            icon: LineChart,
            title: isFr ? "Arbitrage & Recommandations" : "Arbitration & Recommendations",
            desc: isFr
                ? "Visualisez le classement objectif, les notes multi-axes et les signaux faibles pour décider en 10 secondes."
                : "Inspect objective rankings, multi-axis breakdowns, and weak signals to make decisions in 10 seconds."
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
            {/* Top Showcase Navigation Bar */}
            <header className="sticky top-0 z-30 w-full border-b border-border/70 bg-background/85 backdrop-blur-md">
                <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
                            <OffanLogo variant="full" size="md" glow />
                        </Link>
                        <Badge variant="outline" className="hidden md:inline-flex text-[11px] font-mono border-primary/30 text-primary bg-primary/5">
                            B2B & Prosumer
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-1.5">
                            <LanguageToggle />
                            <PremiumThemeSelector />
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleGoToDashboard}
                            className="text-xs sm:text-sm font-medium min-h-[38px] px-3 touch-manipulation"
                        >
                            {isFr ? "Accéder au Dashboard" : "Dashboard"}
                        </Button>

                        <Button
                            size="sm"
                            onClick={handleEnterApp}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold min-h-[38px] px-3.5 gap-1.5 shadow-sm touch-manipulation"
                        >
                            <span>{isFr ? "Démarrer l'App" : "Launch App"}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 px-4">
                    {/* Background Glows */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-primary/15 via-purple-500/10 to-transparent blur-3xl pointer-events-none" />

                    <div className="container mx-auto max-w-5xl relative z-10 text-center space-y-6 sm:space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs sm:text-sm font-medium shadow-xs"
                        >
                            <Sparkles className="h-4 w-4" />
                            <span>
                                {isFr
                                    ? "Copilote IA d'Arbitrage d'Offres & Opportunités"
                                    : "AI Co-pilot for Opportunity & Offer Arbitration"}
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]"
                        >
                            {isFr ? (
                                <>
                                    L&apos;IA qui filtre 500 offres et calcule le{" "}
                                    <span className="bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
                                        vrai reste-à-vivre
                                    </span>
                                </>
                            ) : (
                                <>
                                    The AI engine that scans 500 offers and calculates{" "}
                                    <span className="bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
                                        the real bottom line
                                    </span>
                                </>
                            )}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                        >
                            {isFr
                                ? "Éliminez les fiches trompeuses, scorez selon vos critères multi-axes stricts et validez chaque promesse d'employeur ou de vendeur avec des citations web certifiées en direct."
                                : "Filter out misleading listings, score against your strict multi-axis criteria, and validate employer or vendor claims with live verified web citations."}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2"
                        >
                            <Button
                                size="lg"
                                onClick={scrollToDemo}
                                className="w-full sm:w-auto min-h-[48px] px-7 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 gap-2 touch-manipulation"
                            >
                                <Zap className="h-4 w-4" />
                                <span>{isFr ? "Tester la démo en 1 clic" : "Try 1-Click Demo"}</span>
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                onClick={handleEnterApp}
                                className="w-full sm:w-auto min-h-[48px] px-7 text-base font-semibold border-border/80 hover:bg-muted/70 gap-2 touch-manipulation"
                            >
                                <span>{isFr ? "Démarrer l'Analyse (Gratuit)" : "Start Free Analysis"}</span>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </motion.div>

                        {/* Trust Badges */}
                        <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                {isFr ? "Mode Invité Sans Inscription" : "Guest Mode Without Signup"}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Zap className="h-4 w-4 text-primary" />
                                {isFr ? "NVIDIA Nemotron 3.5 Inclus" : "NVIDIA Nemotron 3.5 Included"}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <ShieldCheck className="h-4 w-4 text-purple-500" />
                                {isFr ? "Citations Web Anti-Hallucination" : "Anti-Hallucination Citations"}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Interactive 1-Click Live Demo Section */}
                <section id="interactive-demo-section" className="py-12 sm:py-16 px-4 bg-muted/20 border-y border-border/60">
                    <div className="container mx-auto max-w-5xl space-y-6">
                        <div className="text-center space-y-2 mb-8">
                            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-xs font-semibold">
                                {isFr ? "Démonstration Interactive" : "Interactive Showcase"}
                            </Badge>
                            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
                                {isFr ? "Constatez la rigueur de l'arbitrage" : "Experience the rigor of AI arbitration"}
                            </h2>
                            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                                {isFr
                                    ? "Changez de scénario ci-dessous et observez le calcul en temps réel des notes multi-axes et des citations web."
                                    : "Switch scenarios below and observe real-time multi-axis scoring and verified citations."}
                            </p>
                        </div>

                        <InteractiveDemoWidget />
                    </div>
                </section>

                {/* Bento Grid: Why OfferAnalyst Beats Generic Prompts */}
                <section className="py-16 sm:py-24 px-4">
                    <div className="container mx-auto max-w-5xl space-y-12">
                        <div className="text-center space-y-3">
                            <Badge variant="secondary" className="text-xs font-semibold uppercase tracking-wider">
                                {isFr ? "L'Avantage Décisif" : "The Decisive Advantage"}
                            </Badge>
                            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
                                {isFr
                                    ? "Pourquoi OfferAnalyst surpasse un simple prompt ChatGPT"
                                    : "Why OfferAnalyst outperforms a generic ChatGPT prompt"}
                            </h2>
                            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                                {isFr
                                    ? "Un prompt ordinaire hallucine et oublie vos critères stricts. Notre moteur combine scoring contextuel, vérification web externe et pondération déterministe."
                                    : "Standard prompts hallucinate and drift away from strict constraints. Our engine blends contextual scoring, external web corroboration, and deterministic weights."}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {bentoItems.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <Card key={index} className={`border ${item.border} bg-card/70 hover:shadow-lg transition-all`}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className={`p-2.5 rounded-xl ${item.bg}`}>
                                                    <Icon className={`h-6 w-6 ${item.color}`} />
                                                </div>
                                                <Badge variant="outline" className="text-xs font-mono">
                                                    {item.badge}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-lg sm:text-xl font-bold">{item.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                                                {item.description}
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* 3-Step Clear Workflow */}
                <section className="py-16 px-4 bg-muted/15 border-t border-border/60">
                    <div className="container mx-auto max-w-5xl space-y-12">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                {isFr ? "Un flux conçu pour la rapidité d'exécution" : "A workflow engineered for rapid execution"}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {isFr ? "De l'offre brute à la décision éclairée en moins de 60 secondes" : "From raw offer to confident decision in under 60 seconds"}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {steps.map((step, idx) => {
                                const Icon = step.icon;
                                return (
                                    <div key={idx} className="p-5 rounded-2xl bg-card border border-border/70 space-y-3 relative">
                                        <span className="text-2xl font-black font-mono text-primary/30 block">
                                            {step.num}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Icon className="h-5 w-5 text-primary" />
                                            <h3 className="font-bold text-base">{step.title}</h3>
                                        </div>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            {step.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Simple Pricing & BYOK Section */}
                <section className="py-16 sm:py-24 px-4">
                    <div className="container mx-auto max-w-4xl space-y-10">
                        <div className="text-center space-y-2">
                            <Badge variant="outline" className="text-xs font-semibold">
                                {isFr ? "Modèle Économique Éthique" : "Transparent Pricing"}
                            </Badge>
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                {isFr ? "Gratuit pour tester, illimité avec vos clés" : "Free to explore, unlimited with your keys"}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {isFr ? "Aucun abonnement forcé pour commencer vos arbitrages" : "No forced subscription to begin arbitrating opportunities"}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Free Tier */}
                            <Card className="border border-border/80 bg-card p-6 flex flex-col justify-between space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold">{isFr ? "Invité / Découverte" : "Guest / Starter"}</h3>
                                        <Badge variant="secondary">{isFr ? "Inclus" : "Included"}</Badge>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl sm:text-4xl font-extrabold font-mono">0€</span>
                                        <span className="text-xs text-muted-foreground">{isFr ? "/ à vie" : "/ forever"}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {isFr
                                            ? "Parfait pour évaluer vos opportunités personnelles sans inscription."
                                            : "Perfect for evaluating personal opportunities without creating an account."}
                                    </p>

                                    <ul className="space-y-2 text-xs sm:text-sm text-foreground pt-2">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                            <span>{isFr ? "10 analyses contextuelles par jour" : "10 contextual analyses per day"}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                            <span>{isFr ? "Modèle NVIDIA Nemotron 3.5 Lightning" : "NVIDIA Nemotron 3.5 Lightning model"}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                            <span>{isFr ? "Scoring multi-axes et radar" : "Multi-axis scoring & radar"}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                            <span>{isFr ? "Citations web vérifiées" : "Verified web citations"}</span>
                                        </li>
                                    </ul>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={handleEnterApp}
                                    className="w-full min-h-[44px] font-semibold touch-manipulation"
                                >
                                    {isFr ? "Commencer gratuitement" : "Start For Free"}
                                </Button>
                            </Card>

                            {/* BYOK Pro Tier */}
                            <Card className="border-2 border-primary bg-primary/5 p-6 flex flex-col justify-between space-y-6 relative shadow-md">
                                <div className="absolute -top-3 right-6">
                                    <Badge className="bg-primary text-primary-foreground font-semibold text-xs">
                                        {isFr ? "Recommandé Pro" : "Pro Choice"}
                                    </Badge>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold">Pro BYOK</h3>
                                        <Badge variant="outline" className="border-primary/40 text-primary">
                                            {isFr ? "Volume Libre" : "Unlimited"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl sm:text-4xl font-extrabold font-mono">
                                            {isFr ? "Vos Clés" : "Your Keys"}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{isFr ? "sans marge" : "zero markup"}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {isFr
                                            ? "Pour les recruteurs, consultants tech et investisseurs analysant des dizaines d'offres."
                                            : "For recruiters, tech consultants, and investors analyzing dozens of opportunities."}
                                    </p>

                                    <ul className="space-y-2 text-xs sm:text-sm text-foreground pt-2">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                            <span>{isFr ? "Analyses et scoring illimités" : "Unlimited analyses & scoring"}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                            <span>{isFr ? "Modèles premium (Claude 3.5, GPT-4o, DeepSeek)" : "Premium models (Claude 3.5, GPT-4o, DeepSeek)"}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                            <span>{isFr ? "Export PDF & Partage d'analyses" : "PDF Export & Link sharing"}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                            <span>{isFr ? "Chiffrement AES de vos clés API" : "AES encryption of your API keys"}</span>
                                        </li>
                                    </ul>
                                </div>

                                <Button
                                    onClick={handleEnterApp}
                                    className="w-full min-h-[44px] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md touch-manipulation"
                                >
                                    {isFr ? "Lancer le mode BYOK" : "Launch BYOK Mode"}
                                </Button>
                            </Card>
                        </div>
                    </div>
                </section>
            </main>

            {/* Showcase Footer */}
            <footer className="border-t border-border/60 py-8 px-4 bg-muted/30 text-xs text-muted-foreground">
                <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <OffanLogo variant="compact" size="sm" />
                        <span>© 2026 OfferAnalyst. {isFr ? "Tous droits réservés." : "All rights reserved."}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <Link href="/privacy" className="hover:text-foreground transition-colors">
                            {isFr ? "Confidentialité" : "Privacy"}
                        </Link>
                        <Link href="/terms" className="hover:text-foreground transition-colors">
                            {isFr ? "Conditions" : "Terms"}
                        </Link>
                        <Link href="/cookies" className="hover:text-foreground transition-colors">
                            Cookies
                        </Link>
                        <Link href="/changelog" className="hover:text-foreground transition-colors">
                            Changelog
                        </Link>
                        <Link href="/help" className="hover:text-foreground transition-colors">
                            {isFr ? "Aide" : "Help"}
                        </Link>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleGoToDashboard}
                        className="text-xs text-primary hover:underline touch-manipulation"
                    >
                        {isFr ? "Basculer vers le Dashboard →" : "Switch to Dashboard →"}
                    </Button>
                </div>
            </footer>
        </div>
    );
}
