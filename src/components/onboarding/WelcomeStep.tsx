"use client";

/**
 * Welcome Step - Step 1 of Onboarding
 * 
 * Introduction to OfferAnalyst with animations
 */

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Target, TrendingUp } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Analysis",
      description: "Get intelligent insights from multiple AI models",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Analyze hundreds of offers in seconds",
    },
    {
      icon: Target,
      title: "Precision Scoring",
      description: "Custom criteria matching for your specific needs",
    },
    {
      icon: TrendingUp,
      title: "Smart Organization",
      description: "Automatic categorization and prioritization",
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Welcome to OfferAnalyst
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Transform how you analyze and compare offers across any domain - real estate,
          jobs, startups, and more. Let&apos;s get you set up in just 5 quick steps.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
            className="p-6 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
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
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex justify-center pt-4"
      >
        <Button onClick={onNext} size="lg" className="px-8">
          Get Started
        </Button>
      </motion.div>
    </div>
  );
}
