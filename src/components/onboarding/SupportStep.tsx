"use client";

/**
 * Support Step - Step 5 of Onboarding
 * 
 * Optional support/donation CTA
 */

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Coffee, Heart, Zap } from "lucide-react";

interface SupportStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function SupportStep({ onComplete, onSkip }: SupportStepProps) {
  const handleSupport = () => {
    // Open donation link in new tab
    window.open("https://buymeacoffee.com/offeranalyst", "_blank");
    onComplete();
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold mb-4">You&apos;re All Set! 🎉</h2>
        <p className="text-lg text-muted-foreground">
          OfferAnalyst is <strong>free forever</strong> with integrated AI models
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-8 bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Coffee className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Support Development</h3>
            <p className="text-muted-foreground max-w-md">
              If you find OfferAnalyst helpful, consider buying us a coffee! Your support
              helps us keep the service running and improve it continuously.
            </p>
            <div className="grid md:grid-cols-3 gap-4 w-full mt-6">
              <div className="p-4 rounded-lg border bg-card">
                <Zap className="h-6 w-6 text-primary mb-2" />
                <h4 className="font-semibold mb-1">Free Forever</h4>
                <p className="text-sm text-muted-foreground">
                  Always free with integrated AI models
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <Heart className="h-6 w-6 text-primary mb-2" />
                <h4 className="font-semibold mb-1">BYOK Support</h4>
                <p className="text-sm text-muted-foreground">
                  Bring your own keys for unlimited usage
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <Coffee className="h-6 w-6 text-primary mb-2" />
                <h4 className="font-semibold mb-1">Voluntary</h4>
                <p className="text-sm text-muted-foreground">
                  Donations help keep servers running
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col items-center gap-4 pt-4"
      >
        <Button onClick={handleSupport} size="lg" className="px-8">
          <Coffee className="mr-2 h-5 w-5" />
          Buy Us a Coffee
        </Button>
        <Button onClick={onSkip} variant="ghost" size="lg">
          Maybe Later
        </Button>
        <p className="text-xs text-muted-foreground text-center max-w-md">
          You can always support us later from the Settings page. No pressure! 😊
        </p>
      </motion.div>
    </div>
  );
}
