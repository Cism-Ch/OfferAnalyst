"use client";

/**
 * Welcome Step - Step 1 of Onboarding (Bilingual FR/EN)
 */

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, Zap, Target, TrendingUp } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  const { language } = useLanguage();
  const isFr = language === "fr";

  const features = [
    {
      icon: Sparkles,
      title: isFr ? "Analyse Propulsée par IA" : "AI-Powered Analysis",
      description: isFr
        ? "Obtenez des synthèses intelligentes via plusieurs modèles d'IA"
        : "Get intelligent insights from multiple AI models",
    },
    {
      icon: Zap,
      title: isFr ? "Ultra-Rapide" : "Lightning Fast",
      description: isFr
        ? "Analysez des dizaines d'offres en quelques secondes"
        : "Analyze dozens of offers in seconds",
    },
    {
      icon: Target,
      title: isFr ? "Scoring de Précision" : "Precision Scoring",
      description: isFr
        ? "Évaluation multi-axes adaptée à vos critères stricts et préférences"
        : "Custom criteria matching for your specific needs",
    },
    {
      icon: TrendingUp,
      title: isFr ? "Organisation Intelligente" : "Smart Organization",
      description: isFr
        ? "Catégorisation et priorisation automatiques de vos favoris"
        : "Automatic categorization and prioritization",
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {isFr ? "Bienvenue sur OfferAnalyst" : "Welcome to OfferAnalyst"}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          {isFr
            ? "Transformez votre manière d'analyser et de comparer des offres dans tous les domaines — immobilier, emploi, tech, services B2B. Configurons votre espace en quelques étapes."
            : "Transform how you analyze and compare offers across any domain — real estate, jobs, startups, and more. Let's get you set up in just 5 quick steps."}
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
            className="p-6 rounded-xl border bg-card hover:bg-accent/50 transition-colors"
          >
            <feature.icon className="h-8 w-8 mb-3 text-primary" />
            <h3 className="font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="flex justify-center pt-4"
      >
        <Button onClick={onNext} size="lg" className="px-8 min-h-11">
          {isFr ? "Commencer" : "Get Started"}
        </Button>
      </motion.div>
    </div>
  );
}
