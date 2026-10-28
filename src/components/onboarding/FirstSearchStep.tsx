"use client";

/**
 * First Search Step - Step 4 of Onboarding (Bilingual FR/EN)
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2, Sparkles, CheckCircle2, PartyPopper } from "lucide-react";

interface FirstSearchStepProps {
  onComplete: () => void;
}

export default function FirstSearchStep({ onComplete }: FirstSearchStepProps) {
  const { language } = useLanguage();
  const isFr = language === "fr";
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleRunDemo = async () => {
    setRunning(true);
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setRunning(false);
    setCompleted(true);

    setTimeout(() => {
      onComplete();
    }, 1200);
  };

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="mx-auto w-20 h-20 bg-emerald-500/15 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
          {isFr ? "Excellent !" : "Amazing!"} <PartyPopper className="h-7 w-7 text-primary" />
        </h2>
        <p className="text-lg text-muted-foreground">
          {isFr
            ? "Vous venez d'exécuter votre première simulation d'analyse"
            : "You've successfully run your first analysis"}
        </p>
      </motion.div>
    );
  }

  const demoSteps = isFr
    ? ["Collecte des offres...", "Analyse contextuelle par l'IA...", "Calcul des scores multi-axes..."]
    : ["Fetching offers...", "Analyzing with AI...", "Scoring results..."];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">
          {isFr ? "Testez Votre Première Analyse" : "Try Your First Analysis"}
        </h2>
        <p className="text-muted-foreground">
          {isFr
            ? "Lançons une démonstration rapide pour voir OfferAnalyst en action"
            : "Let's run a quick demo to see OfferAnalyst in action"}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 sm:p-8 rounded-xl border"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {isFr ? "Domaine" : "Domain"}
            </label>
            <p className="text-lg font-semibold">
              {isFr ? "Immobilier" : "Real Estate"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {isFr ? "Critères" : "Criteria"}
            </label>
            <p className="text-base sm:text-lg">
              {isFr
                ? "Appartement 3 pièces moins de 450k€, proche transports, quartier calme et lumineux"
                : "3-bedroom house under $500k, good schools, low crime, near public transport"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {isFr ? "Modèle IA" : "AI Model"}
            </label>
            <p className="text-lg font-semibold flex items-center gap-2 flex-wrap">
              Gemini 3.5 Flash Lite{" "}
              <span className="text-xs font-normal text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {isFr ? "(Inclus Gratuitement)" : "(Included Free)"}
              </span>
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-col items-center gap-4 pt-4"
      >
        <Button
          onClick={handleRunDemo}
          size="lg"
          disabled={running}
          className="px-8 min-h-11"
        >
          {running ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {isFr ? "Analyse en cours..." : "Analyzing offers..."}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              {isFr ? "Lancer l'analyse de démo" : "Run Demo Analysis"}
            </>
          )}
        </Button>
      </motion.div>

      {running && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {demoSteps.map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.7 }}
              className="flex items-center gap-3 text-sm"
            >
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-muted-foreground">{step}</span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
