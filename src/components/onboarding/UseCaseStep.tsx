"use client";

/**
 * Use Case Step - Step 2 of Onboarding
 * 
 * Let users select their primary use case
 */

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, Briefcase, Rocket, ShoppingBag, MoreHorizontal, Building2 } from "lucide-react";

interface UseCaseStepProps {
  value: string;
  onChange: (useCase: string) => void;
  onNext: () => void;
}

export default function UseCaseStep({ value, onChange, onNext }: UseCaseStepProps) {
  const useCases = [
    {
      id: "real-estate",
      title: "Real Estate",
      description: "Find and compare properties, rentals, and locations",
      icon: Home,
    },
    {
      id: "jobs",
      title: "Job Hunting",
      description: "Analyze job postings and career opportunities",
      icon: Briefcase,
    },
    {
      id: "startups",
      title: "Startups & Investments",
      description: "Research startups, funding rounds, and investors",
      icon: Rocket,
    },
    {
      id: "e-commerce",
      title: "E-commerce",
      description: "Compare products, prices, and marketplace offers",
      icon: ShoppingBag,
    },
    {
      id: "business",
      title: "Business Services",
      description: "Evaluate B2B services, vendors, and partnerships",
      icon: Building2,
    },
    {
      id: "other",
      title: "Other",
      description: "Custom use case for your specific needs",
      icon: MoreHorizontal,
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
        <h2 className="text-3xl font-bold mb-4">What will you use OfferAnalyst for?</h2>
        <p className="text-muted-foreground">
          This helps us personalize your experience and provide better recommendations
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4">
        {useCases.map((useCase, index) => (
          <motion.button
            key={useCase.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            onClick={() => onChange(useCase.id)}
            className={`p-6 rounded-lg border-2 text-left transition-all hover:scale-105 ${
              value === useCase.id
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <useCase.icon className={`h-8 w-8 mb-3 ${
              value === useCase.id ? "text-primary" : "text-muted-foreground"
            }`} />
            <h3 className="font-semibold mb-2">{useCase.title}</h3>
            <p className="text-sm text-muted-foreground">{useCase.description}</p>
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex justify-center pt-4"
      >
        <Button onClick={onNext} size="lg" disabled={!value} className="px-8">
          Continue
        </Button>
      </motion.div>
    </div>
  );
}
