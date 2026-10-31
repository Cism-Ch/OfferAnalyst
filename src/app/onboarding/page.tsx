"use client";

/**
 * Onboarding Wizard - 5 Steps
 * 
 * 1. Welcome - Introduction with animation
 * 2. Use Case - Select primary use case
 * 3. API Keys - Configure API keys (show dev keys + allow BYOK)
 * 4. First Search - Demo the platform
 * 5. Support - Optional donation/support
 * 
 * Supports both Authenticated Cloud Persistence and Guest Mode Local Persistence.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { PremiumThemeSelector } from "@/components/theme-selector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTemporaryApiKeys } from "@/hooks/use-temporary-api-keys";
import { ArrowLeft, ChevronLeft } from "lucide-react";

// Import step components
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import UseCaseStep from "@/components/onboarding/UseCaseStep";
import APIKeysStep from "@/components/onboarding/APIKeysStep";
import FirstSearchStep from "@/components/onboarding/FirstSearchStep";
import SupportStep from "@/components/onboarding/SupportStep";

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const tempKeys = useTemporaryApiKeys();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState({
    useCase: "",
    hasOwnKeys: false,
    apiKeys: {} as Record<string, string>,
    completedFirstSearch: false,
  });

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep === TOTAL_STEPS) {
      completeOnboarding();
    } else {
      setCurrentStep(TOTAL_STEPS);
    }
  };

  const completeOnboarding = async () => {
    try {
      // 1. Persist BYOK keys locally in useTemporaryApiKeys for Guest Mode & immediate local access
      if (data.hasOwnKeys && data.apiKeys) {
        Object.entries(data.apiKeys).forEach(([provider, rawKey]) => {
          const trimmed = rawKey?.trim();
          if (trimmed && trimmed.length >= 10) {
            tempKeys.addKey(`Onboarding (${provider})`, provider.toLowerCase(), trimmed);
          }
        });
      }

      // 2. Persist onboarding preferences in localStorage for Guest Mode continuity
      if (typeof window !== "undefined") {
        window.localStorage.setItem("offeranalyst_onboarding_completed", "true");
        if (data.useCase) {
          window.localStorage.setItem("offeranalyst_onboarding_usecase", data.useCase);
        }
      }

      // 3. Synchronize with server profile if authenticated
      await fetch("/api/profile/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          onboardingComplete: true,
        }),
      });

      // Redirect to dashboard
      router.push("/");
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      router.push("/");
    }
  };

  const updateData = (newData: Partial<typeof data>) => {
    setData({ ...data, ...newData });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onNext={handleNext} />;
      case 2:
        return (
          <UseCaseStep
            value={data.useCase}
            onChange={(useCase) => updateData({ useCase })}
            onNext={handleNext}
          />
        );
      case 3:
        return (
          <APIKeysStep
            hasOwnKeys={data.hasOwnKeys}
            apiKeys={data.apiKeys}
            onChange={(keys, hasOwn) => updateData({ apiKeys: keys, hasOwnKeys: hasOwn })}
            onNext={handleNext}
          />
        );
      case 4:
        return (
          <FirstSearchStep
            onComplete={() => {
              updateData({ completedFirstSearch: true });
              handleNext();
            }}
          />
        );
      case 5:
        return <SupportStep onComplete={completeOnboarding} onSkip={completeOnboarding} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-app bg-gradient-to-br from-background to-muted flex flex-col overflow-x-hidden">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-header">
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      {/* Top Navigation & Controls */}
      <header className="w-full max-w-4xl mx-auto px-3 sm:px-6 pt-4 pb-2 flex items-center justify-between gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-h-11 px-3 rounded-lg hover:bg-muted/60"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t.auth.backToApp}</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <PremiumThemeSelector />
        </div>
      </header>

      {/* Main content */}
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-6 flex-1 overflow-x-hidden">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <div
              key={index}
              className={`h-1.5 sm:h-2 rounded-full transition-all ${
                index + 1 === currentStep
                  ? "w-6 sm:w-8 bg-primary"
                  : index + 1 < currentStep
                  ? "w-2 bg-primary"
                  : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            <Card className="border-border/60 shadow-lg">
              <CardContent className="p-4 sm:p-8">
                {renderStep()}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        {currentStep !== 1 && currentStep !== 4 && (
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="min-h-11"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {language === "fr" ? "Retour" : "Back"}
            </Button>

            {currentStep < TOTAL_STEPS && (
              <Button variant="ghost" onClick={handleSkip} className="min-h-11">
                {language === "fr" ? "Passer" : "Skip"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
