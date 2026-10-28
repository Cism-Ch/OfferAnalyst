"use client";

/**
 * API Keys Step - Step 3 of Onboarding (Bilingual FR/EN)
 * 
 * Show integrated dev keys and allow users to add their own (BYOK)
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eye, EyeOff, Key, Plus, Trash2, CheckCircle2 } from "lucide-react";

interface APIKeysStepProps {
  hasOwnKeys: boolean;
  apiKeys: Record<string, string>;
  onChange: (keys: Record<string, string>, hasOwn: boolean) => void;
  onNext: () => void;
}

export default function APIKeysStep({ hasOwnKeys, apiKeys, onChange, onNext }: APIKeysStepProps) {
  const { language } = useLanguage();
  const isFr = language === "fr";
  const [showKeys, setShowKeys] = useState(false);
  const [customKeys, setCustomKeys] = useState<Array<{ provider: string; key: string }>>([
    { provider: "openrouter", key: apiKeys.openrouter || "" },
  ]);

  const integratedProviders = [
    {
      name: "Google Gemini",
      status: isFr ? "Actif" : "Active",
      model: isFr ? "Gemini 3.5 Flash Lite (Inclus)" : "Gemini 3.5 Flash Lite (Included)",
    },
    {
      name: "NVIDIA",
      status: isFr ? "Actif" : "Active",
      model: isFr ? "Nemotron 3.5 Lightning (Gratuit)" : "Nemotron 3.5 Lightning (Free)",
    },
    {
      name: "OpenRouter / BYOK",
      status: isFr ? "Actif" : "Active",
      model: "Claude 3.7, GPT-4o, DeepSeek R1, Kimi",
    },
  ];

  const handleAddCustomKey = () => {
    setCustomKeys([...customKeys, { provider: "openrouter", key: "" }]);
  };

  const handleRemoveCustomKey = (index: number) => {
    const newKeys = customKeys.filter((_, i) => i !== index);
    setCustomKeys(newKeys);
    const keysObject = newKeys.reduce((acc, { provider, key }) => {
      if (provider && key) acc[provider.toLowerCase()] = key;
      return acc;
    }, {} as Record<string, string>);
    onChange(keysObject, newKeys.length > 0);
  };

  const handleCustomKeyChange = (index: number, field: "provider" | "key", value: string) => {
    const newKeys = [...customKeys];
    newKeys[index][field] = value;
    setCustomKeys(newKeys);

    const keysObject = newKeys.reduce((acc, { provider, key }) => {
      if (provider && key) acc[provider.toLowerCase()] = key;
      return acc;
    }, {} as Record<string, string>);
    onChange(keysObject, true);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">
          {isFr ? "Configuration des Clés API" : "API Keys Setup"}
        </h2>
        <p className="text-muted-foreground">
          {isFr
            ? "Nous fournissons un accès gratuit aux modèles IA intégrés. Vous pouvez aussi ajouter vos propres clés (BYOK)."
            : "We provide free-tier access to AI models. Optionally add your own keys for unlimited usage."}
        </p>
      </motion.div>

      {/* Integrated Keys */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          {isFr ? "Modèles Intégrés (Accès Gratuit)" : "Integrated Keys (Free Tier)"}
        </h3>
        <div className="space-y-3">
          {integratedProviders.map((provider, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{provider.name}</h4>
                  <p className="text-sm text-muted-foreground">{provider.model}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm text-muted-foreground">{provider.status}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* BYOK Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="border-t pt-6"
      >
        <div className="flex items-center justify-between mb-4 gap-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              {isFr ? "Utiliser vos propres clés (BYOK - Optionnel)" : "Bring Your Own Keys (Optional)"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isFr
                ? "Ajoutez votre clé OpenRouter ou Gemini (sauvegardée dans le Cloud si connecté, ou localement en mode Invité)"
                : "Add your OpenRouter or Gemini key (saved to Cloud if signed in, or locally in Guest Mode)"}
            </p>
          </div>
          <Switch
            checked={hasOwnKeys}
            onCheckedChange={(checked) => onChange(apiKeys, checked)}
          />
        </div>

        {hasOwnKeys && (
          <div className="space-y-4">
            {customKeys.map((customKey, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>{isFr ? "Fournisseur IA" : "Provider"}</Label>
                    <Input
                      placeholder="openrouter, gemini, deepseek..."
                      value={customKey.provider}
                      onChange={(e) => handleCustomKeyChange(index, "provider", e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isFr ? "Clé API" : "API Key"}</Label>
                    <div className="flex gap-2">
                      <Input
                        type={showKeys ? "text" : "password"}
                        placeholder="sk-or-v1-..."
                        value={customKey.key}
                        onChange={(e) => handleCustomKeyChange(index, "key", e.target.value)}
                        className="h-11"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowKeys(!showKeys)}
                        className="h-11 w-11 shrink-0"
                      >
                        {showKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveCustomKey(index)}
                        className="h-11 w-11 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddCustomKey}
              className="w-full min-h-11"
            >
              <Plus className="mr-2 h-4 w-4" />
              {isFr ? "Ajouter une autre clé" : "Add Another Key"}
            </Button>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex justify-center pt-4"
      >
        <Button onClick={onNext} size="lg" className="px-8 min-h-11">
          {isFr ? "Continuer" : "Continue"}
        </Button>
      </motion.div>
    </div>
  );
}
