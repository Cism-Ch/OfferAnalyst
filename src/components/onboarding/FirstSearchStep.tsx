"use client";

/**
 * First Search Step - Step 4 of Onboarding
 * 
 * Demo the platform with a pre-filled example search
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";

interface FirstSearchStepProps {
  onComplete: () => void;
}

export default function FirstSearchStep({ onComplete }: FirstSearchStepProps) {
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleRunDemo = async () => {
    setRunning(true);

    // Simulate analysis
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setRunning(false);
    setCompleted(true);

    // Auto-advance after showing success
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Amazing! 🎉</h2>
        <p className="text-lg text-muted-foreground">
          You&apos;ve successfully run your first analysis
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold mb-4">Try Your First Analysis</h2>
        <p className="text-muted-foreground">
          Let&apos;s run a quick demo to see OfferAnalyst in action
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-gradient-to-br from-primary/10 to-purple-500/10 p-8 rounded-lg border"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Domain</label>
            <p className="text-lg font-semibold">Real Estate</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Criteria</label>
            <p className="text-lg">
              3-bedroom house under $500k, good schools, low crime, near public transport
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">AI Model</label>
            <p className="text-lg font-semibold">GPT-4o Mini</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col items-center gap-4 pt-4"
      >
        <Button
          onClick={handleRunDemo}
          size="lg"
          disabled={running}
          className="px-8"
        >
          {running ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing offers...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Run Demo Analysis
            </>
          )}
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          This will take about 3 seconds
        </p>
      </motion.div>

      {running && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {["Fetching offers...", "Analyzing with AI...", "Scoring results..."].map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 1 }}
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
