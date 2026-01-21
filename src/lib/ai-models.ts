export interface AIModelOption {
  id: string;
  label: string;
  provider: string;
  tier: 'free' | 'pro';
  latency: 'fast' | 'balanced' | 'reasoning';
  contextWindow: string;
  price: string;
  description: string;
  highlights: string[];
}

export const DEFAULT_MODEL_ID = 'google/gemini-2.5-flash-preview-09-2025';

export const AI_MODEL_OPTIONS: AIModelOption[] = [
  {
    id: DEFAULT_MODEL_ID,
    label: 'Gemini 2.5 Flash Preview (Free)',
    provider: 'Google via OpenRouter',
    tier: 'free',
    latency: 'fast',
    contextWindow: '~1M tokens',
    price: '$0 / request',
    description: 'Balanced reasoning, great for structured JSON outputs.',
    highlights: ['Deterministic JSON mode', 'Low latency', 'Great for dashboards']
  },
  {
    id: 'google/gemini-2.0-flash-exp:free',
    label: 'Gemini 2.0 Flash (Free)',
    provider: 'Google via OpenRouter',
    tier: 'free',
    latency: 'fast',
    contextWindow: '~1M tokens',
    price: '$0 / request',
    description: 'Balanced reasoning, great for structured JSON outputs.',
    highlights: ['Deterministic JSON mode', 'Low latency', 'Great for dashboards']
  },
  {
    id: 'deepseek/deepseek-r1:free',
    label: 'DeepSeek R1 (Free)',
    provider: 'DeepSeek via OpenRouter',
    tier: 'free',
    latency: 'reasoning',
    contextWindow: '200k tokens',
    price: '$0 / request',
    description: 'Reasoning-first model with chain-of-thought; slower but thorough.',
    highlights: ['Reasoning traces', 'Better for complex planning']
  },
  {
    id: 'openai/gpt-4o-mini',
    label: 'GPT-4o Mini',
    provider: 'OpenAI via OpenRouter',
    tier: 'pro',
    latency: 'balanced',
    contextWindow: '128k tokens',
    price: '$0.06 / 1M tokens',
    description: 'Stronger language understanding and summarization.',
    highlights: ['Great summarization', 'High accuracy JSON']
  },
  {
    id: 'mistralai/mistral-large',
    label: 'Mistral Large',
    provider: 'Mistral AI via OpenRouter',
    tier: 'pro',
    latency: 'balanced',
    contextWindow: '128k tokens',
    price: '$4 / 1M tokens',
    description: 'High quality European model with precise outputs.',
    highlights: ['Great for multilingual', 'Deterministic JSON']
  }
];

export function getModelOption(id: string): AIModelOption {
  return AI_MODEL_OPTIONS.find((option) => option.id === id) ?? AI_MODEL_OPTIONS[0];
}

export function isModelSupported(id: string): boolean {
  return AI_MODEL_OPTIONS.some((option) => option.id === id);
}
