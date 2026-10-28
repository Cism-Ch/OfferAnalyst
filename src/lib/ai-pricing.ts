/**
 * AI Models Pricing Engine (FinOps & Token Telemetry)
 * 
 * Provides reference rates and real-time cost computation for prompt/completion tokens.
 * Pricing is expressed in USD per 1,000,000 (1M) tokens.
 */

export interface ModelPricing {
  promptPricePer1M: number;      // USD per 1M input tokens
  completionPricePer1M: number;  // USD per 1M output tokens
  isFree: boolean;
}

/**
 * Standard reference pricing matrix for models used in OfferAnalyst.
 * Updatable dynamically via OpenRouter /models API.
 */
export const MODEL_PRICING_TABLE: Record<string, ModelPricing> = {
  // Modèles Standards Inclus & Gratuits
  'google/gemini-3.5-flash-lite': {
    promptPricePer1M: 0,
    completionPricePer1M: 0,
    isFree: true,
  },
  'nvidia/nemotron-3.5-lightning:free': {
    promptPricePer1M: 0,
    completionPricePer1M: 0,
    isFree: true,
  },

  // Modèles Payants (BYOK)
  'openai/gpt-4o': {
    promptPricePer1M: 2.50,
    completionPricePer1M: 10.00,
    isFree: false,
  },
  'anthropic/claude-3.7-sonnet': {
    promptPricePer1M: 3.00,
    completionPricePer1M: 15.00,
    isFree: false,
  },
  'openai/o3-mini': {
    promptPricePer1M: 1.10,
    completionPricePer1M: 4.40,
    isFree: false,
  },
  'deepseek/deepseek-r1': {
    promptPricePer1M: 0.55,
    completionPricePer1M: 2.19,
    isFree: false,
  },
  'deepseek/deepseek-chat': {
    promptPricePer1M: 0.14,
    completionPricePer1M: 0.28,
    isFree: false,
  },
  'moonshotai/kimi-k2.6': {
    promptPricePer1M: 0.39,
    completionPricePer1M: 1.64,
    isFree: false,
  },
  'mistralai/mistral-large': {
    promptPricePer1M: 2.00,
    completionPricePer1M: 6.00,
    isFree: false,
  },
  'anthropic/claude-3.5-sonnet': {
    promptPricePer1M: 3.00,
    completionPricePer1M: 15.00,
    isFree: false,
  },
  'anthropic/claude-3-haiku': {
    promptPricePer1M: 0.25,
    completionPricePer1M: 1.25,
    isFree: false,
  },
  'mistralai/mistral-small': {
    promptPricePer1M: 0.20,
    completionPricePer1M: 0.60,
    isFree: false,
  },
};

/**
 * Calculates exact cost in USD for a given prompt + completion token usage.
 * Returns 0 for free tier models or unknown models defaulting to free.
 */
export function calculateTokenCostUSD(
  modelId: string,
  promptTokens: number = 0,
  completionTokens: number = 0
): number {
  if (promptTokens <= 0 && completionTokens <= 0) return 0;

  // Lookup model rates or check if explicitly tagged as free
  const normalizedId = modelId.toLowerCase().trim();
  if (normalizedId.includes(':free')) {
    return 0;
  }

  const pricing = MODEL_PRICING_TABLE[normalizedId] || MODEL_PRICING_TABLE[modelId];

  if (!pricing || pricing.isFree) {
    return 0;
  }

  const promptCost = (promptTokens / 1_000_000) * pricing.promptPricePer1M;
  const completionCost = (completionTokens / 1_000_000) * pricing.completionPricePer1M;

  return Number((promptCost + completionCost).toFixed(6));
}

/**
 * Formats a USD cost into an elegant user-friendly string.
 * e.g., "$0.00" -> "Gratuit", 0.000045 -> "< $0.0001", 0.0142 -> "$0.014"
 */
export function formatCostUSD(costInUsd: number | null | undefined): string {
  if (costInUsd === null || costInUsd === undefined || costInUsd === 0) {
    return '$0.00 (Inclus)';
  }

  if (costInUsd < 0.0001) {
    return '< $0.0001';
  }

  if (costInUsd < 0.01) {
    return `$${costInUsd.toFixed(4)}`;
  }

  return `$${costInUsd.toFixed(3)}`;
}
