"use client";

/**
 * Onboarding Wizard - 5 Steps
 * 
 * 1. Welcome - Introduction with animation
 * 2. Use Case - Select primary use case
 * 3. API Keys - Configure API keys (show dev keys + allow BYOK)
 * 4. First Search - Demo the platform
 * 5. Support - Optional donation/support
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Import step components
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import UseCaseStep from "@/components/onboarding/UseCaseStep";
import APIKeysStep from "@/components/onboarding/APIKeysStep";
import FirstSearchStep from "@/components/onboarding/FirstSearchStep";
import SupportStep from "@/components/onboarding/SupportStep";

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const router = useRouter();
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
      // Complete onboarding
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    // Skip to last step or complete
    if (currentStep === TOTAL_STEPS) {
      completeOnboarding();
    } else {
      setCurrentStep(TOTAL_STEPS);
    }
  };

  const completeOnboarding = async () => {
    try {
      // TODO: Save onboarding data to profile
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8 mt-4">
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index + 1 === currentStep
                  ? "w-8 bg-primary"
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
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
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {currentStep < TOTAL_STEPS && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
