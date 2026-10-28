"use client";

/**
 * Support Step - Step 5 of Onboarding (Bilingual FR/EN)
 */

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Coffee, Heart, Zap, PartyPopper, Smile } from "lucide-react";

interface SupportStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function SupportStep({ onComplete, onSkip }: SupportStepProps) {
  const { language } = useLanguage();
  const isFr = language === "fr";

  const handleSupport = () => {
    window.open("https://buymeacoffee.com/offeranalyst", "_blank");
    onComplete();
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 flex items-center justify-center gap-2">
          {isFr ? "Tout est prêt !" : "You're All Set!"}{" "}
          <PartyPopper className="h-7 w-7 text-primary" />
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground">
          {isFr ? (
            <>
              OfferAnalyst est <strong>gratuit</strong> avec ses modèles IA intégrés
            </>
          ) : (
            <>
              OfferAnalyst is <strong>free forever</strong> with integrated AI models
            </>
          )}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="p-6 sm:p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Coffee className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">
              {isFr ? "Soutenir le Projet" : "Support Development"}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {isFr
                ? "Si OfferAnalyst vous fait gagner du temps, vous pouvez nous offrir un café ! Votre soutien aide à maintenir l'infrastructure et faire évoluer la plateforme."
                : "If you find OfferAnalyst helpful, consider buying us a coffee! Your support helps us keep the service running and improve it continuously."}
            </p>
            <div className="grid md:grid-cols-3 gap-4 w-full mt-6">
              <div className="p-4 rounded-xl border bg-card">
                <Zap className="h-6 w-6 text-primary mb-2" />
                <h4 className="font-semibold mb-1">
                  {isFr ? "Accès Gratuit" : "Free Forever"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {isFr
                    ? "Modèles IA gratuits inclus par défaut"
                    : "Always free with integrated AI models"}
                </p>
              </div>
              <div className="p-4 rounded-xl border bg-card">
                <Heart className="h-6 w-6 text-primary mb-2" />
                <h4 className="font-semibold mb-1">
                  {isFr ? "Support BYOK" : "BYOK Support"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {isFr
                    ? "Utilisez vos propres clés sans limite"
                    : "Bring your own keys for unlimited usage"}
                </p>
              </div>
              <div className="p-4 rounded-xl border bg-card">
                <Coffee className="h-6 w-6 text-primary mb-2" />
                <h4 className="font-semibold mb-1">
                  {isFr ? "100% Libre" : "Voluntary"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {isFr
                    ? "Contribution libre pour soutenir les serveurs"
                    : "Donations help keep servers running"}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-col items-center gap-3 pt-2"
      >
        <Button onClick={handleSupport} size="lg" className="px-8 min-h-11">
          <Coffee className="mr-2 h-5 w-5" />
          {isFr ? "Offrir un café" : "Buy Us a Coffee"}
        </Button>
        <Button onClick={onSkip} variant="ghost" size="lg" className="min-h-11">
          {isFr ? "Accéder au Tableau de Bord" : "Go to Dashboard"}
        </Button>
        <p className="text-xs text-muted-foreground text-center max-w-md flex items-center justify-center gap-1.5">
          <span>
            {isFr
              ? "Vous pourrez toujours nous soutenir plus tard depuis la page Support."
              : "You can always support us later from the Support page."}
          </span>
          <Smile className="h-3.5 w-3.5 text-muted-foreground inline shrink-0" />
        </p>
      </motion.div>
    </div>
  );
}
