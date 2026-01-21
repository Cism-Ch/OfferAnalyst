"use client";

/**
 * API Keys Step - Step 3 of Onboarding
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
import { Eye, EyeOff, Key, Plus, Trash2, CheckCircle2 } from "lucide-react";

interface APIKeysStepProps {
  hasOwnKeys: boolean;
  apiKeys: Record<string, string>;
  onChange: (keys: Record<string, string>, hasOwn: boolean) => void;
  onNext: () => void;
}

export default function APIKeysStep({ hasOwnKeys, apiKeys, onChange, onNext }: APIKeysStepProps) {
  const [showKeys, setShowKeys] = useState(false);
  const [customKeys, setCustomKeys] = useState<Array<{ provider: string; key: string }>>([]);

  const integratedProviders = [
    { name: "OpenRouter", status: "active", model: "GPT-4o Mini" },
    { name: "Google Gemini", status: "active", model: "Gemini 2.5 Flash" },
    { name: "DeepSeek", status: "active", model: "DeepSeek R1 (Free)" },
  ];

  const handleAddCustomKey = () => {
    setCustomKeys([...customKeys, { provider: "", key: "" }]);
  };

  const handleRemoveCustomKey = (index: number) => {
    const newKeys = customKeys.filter((_, i) => i !== index);
    setCustomKeys(newKeys);
  };

  const handleCustomKeyChange = (index: number, field: "provider" | "key", value: string) => {
    const newKeys = [...customKeys];
    newKeys[index][field] = value;
    setCustomKeys(newKeys);
    
    // Update parent state
    const keysObject = newKeys.reduce((acc, { provider, key }) => {
      if (provider && key) acc[provider] = key;
      return acc;
    }, {} as Record<string, string>);
    onChange(keysObject, newKeys.length > 0);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold mb-4">API Keys Setup</h2>
        <p className="text-muted-foreground">
          We provide free-tier access to AI models. Optionally add your own keys for unlimited usage.
        </p>
      </motion.div>

      {/* Integrated Keys */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Integrated Keys (Free Tier)
        </h3>
        <div className="space-y-3">
          {integratedProviders.map((provider, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{provider.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Using: {provider.model}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm text-muted-foreground capitalize">
                    {provider.status}
                  </span>
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
        transition={{ duration: 0.5, delay: 0.2 }}
        className="border-t pt-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Key className="h-5 w-5" />
              Bring Your Own Keys (Optional)
            </h3>
            <p className="text-sm text-muted-foreground">
              Add your own API keys for unlimited usage and premium models
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
                    <Label>Provider</Label>
                    <Input
                      placeholder="e.g., OpenAI, Anthropic"
                      value={customKey.provider}
                      onChange={(e) => handleCustomKeyChange(index, "provider", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        type={showKeys ? "text" : "password"}
                        placeholder="sk-..."
                        value={customKey.key}
                        onChange={(e) => handleCustomKeyChange(index, "key", e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowKeys(!showKeys)}
                      >
                        {showKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveCustomKey(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <Button
              variant="outline"
              onClick={handleAddCustomKey}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another Key
            </Button>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex justify-center pt-4"
      >
        <Button onClick={onNext} size="lg" className="px-8">
          Continue
        </Button>
      </motion.div>
    </div>
  );
}
