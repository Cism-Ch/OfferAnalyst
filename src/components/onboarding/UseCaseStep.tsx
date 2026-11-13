"use client";

/**
 * Use Case Step - Step 2 of Onboarding (Bilingual FR/EN)
 */

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Home, Briefcase, Rocket, ShoppingBag, MoreHorizontal, Building2, Globe2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SUPPORTED_COUNTRIES } from "@/lib/geo";

interface UseCaseStepProps {
  value: string;
  onChange: (useCase: string) => void;
  country?: string;
  onCountryChange?: (country: string) => void;
  detectedCountry?: string | null;
  onNext: () => void;
}

export default function UseCaseStep({
  value,
  onChange,
  country = "INTL",
  onCountryChange,
  detectedCountry,
  onNext,
}: UseCaseStepProps) {
  const { language } = useLanguage();
  const isFr = language === "fr";

  const useCases = [
    {
      id: "real-estate",
      title: isFr ? "Immobilier" : "Real Estate",
      description: isFr
        ? "Rechercher et comparer des biens, locations et emplacements"
        : "Find and compare properties, rentals, and locations",
      icon: Home,
    },
    {
      id: "jobs",
      title: isFr ? "Emploi & Carrière" : "Job Hunting",
      description: isFr
        ? "Analyser des offres d'emploi, missions freelance et opportunités"
        : "Analyze job postings and career opportunities",
      icon: Briefcase,
    },
    {
      id: "startups",
      title: isFr ? "Startups & Investissements" : "Startups & Investments",
      description: isFr
        ? "Évaluer des startups, levées de fonds et opportunités marché"
        : "Research startups, funding rounds, and investors",
      icon: Rocket,
    },
    {
      id: "e-commerce",
      title: isFr ? "E-commerce & Tech" : "E-commerce & Tech",
      description: isFr
        ? "Comparer des produits, équipements, prix et offres marchandes"
        : "Compare products, prices, and marketplace offers",
      icon: ShoppingBag,
    },
    {
      id: "business",
      title: isFr ? "Services B2B & SaaS" : "Business Services",
      description: isFr
        ? "Évaluer des prestataires B2B, logiciels SaaS et partenariats"
        : "Evaluate B2B services, vendors, and partnerships",
      icon: Building2,
    },
    {
      id: "other",
      title: isFr ? "Autre Domaine" : "Other",
      description: isFr
        ? "Cas d'usage personnalisé selon vos besoins spécifiques"
        : "Custom use case for your specific needs",
      icon: MoreHorizontal,
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
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">
          {isFr
            ? "Dans quel domaine utiliserez-vous OfferAnalyst ?"
            : "What will you use OfferAnalyst for?"}
        </h2>
        <p className="text-muted-foreground">
          {isFr
            ? "Cela nous permet de personnaliser votre expérience et vos recommandations"
            : "This helps us personalize your experience and provide better recommendations"}
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4">
        {useCases.map((useCase, index) => (
          <motion.button
            key={useCase.id}
            type="button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 * index }}
            onClick={() => onChange(useCase.id)}
            className={`p-5 rounded-xl border-2 text-left transition-all hover:scale-[1.02] ${
              value === useCase.id
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <useCase.icon
              className={`h-7 w-7 mb-3 ${
                value === useCase.id ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <h3 className="font-semibold mb-1.5">{useCase.title}</h3>
            <p className="text-sm text-muted-foreground">{useCase.description}</p>
          </motion.button>
        ))}
      </div>

      {/* Default Search Country Localization */}
      {onCountryChange && (
        <div className="p-4 sm:p-5 rounded-xl border border-border/80 bg-muted/30 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-primary shrink-0" />
              <div>
                <h3 className="font-semibold text-sm sm:text-base">
                  {isFr ? "Pays de recherche par défaut" : "Default Search Country / Region"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isFr
                    ? "Localise automatiquement les recherches web Tavily et les benchmarks marché (modifiable à tout moment)."
                    : "Automatically localizes Tavily web searches and market benchmarks (changeable anytime)."}
                </p>
              </div>
            </div>
            {detectedCountry && detectedCountry !== "INTL" && (
              <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                {isFr ? `Détecté : ${detectedCountry}` : `Detected: ${detectedCountry}`}
              </Badge>
            )}
          </div>
          <Select value={country} onValueChange={onCountryChange}>
            <SelectTrigger className="w-full h-11 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.flag} {isFr ? c.labelFr : c.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="flex justify-center pt-4"
      >
        <Button onClick={onNext} size="lg" disabled={!value} className="px-8 min-h-11">
          {isFr ? "Continuer" : "Continue"}
        </Button>
      </motion.div>
    </div>
  );
}
