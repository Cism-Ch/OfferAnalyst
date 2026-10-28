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

export const DEFAULT_MODEL_ID = 'google/gemini-3.5-flash-lite';

export const AI_MODEL_OPTIONS: AIModelOption[] = [
  {
    id: DEFAULT_MODEL_ID,
    label: 'Gemini 3.5 Flash Lite (Inclus)',
    provider: 'Google via OpenRouter',
    tier: 'free',
    latency: 'fast',
    contextWindow: '~1M tokens',
    price: '$0 / requête (Inclus)',
    description: 'Moteur IA ultra-rapide par défaut, optimisé pour l\'extraction d\'offres et l\'analyse structurée.',
    highlights: ['Modèle Inclus', 'Ultra-rapide', '1M tokens']
  },
  {
    id: 'nvidia/nemotron-3.5-lightning:free',
    label: 'NVIDIA Nemotron 3.5 Lightning (Gratuit)',
    provider: 'NVIDIA via OpenRouter',
    tier: 'free',
    latency: 'fast',
    contextWindow: '128k tokens',
    price: '$0 / requête (Gratuit)',
    description: 'Modèle léger ultra-rapide de NVIDIA optimisé pour le raisonnement instantané et l\'analyse textuelle.',
    highlights: ['Modèle Gratuit', 'NVIDIA GPU Acceleration', 'Haute vitesse']
  },
  {
    id: 'anthropic/claude-3.7-sonnet',
    label: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    tier: 'pro',
    latency: 'reasoning',
    contextWindow: '200k tokens',
    price: '$3.00 / 1M tokens',
    description: 'Dernier modèle frontière d\'Anthropic avec raisonnement hybride et capacités analytiques avancées.',
    highlights: ['Clé BYOK Requise', 'Raisonnement hybride', 'Dernière génération']
  },
  {
    id: 'openai/gpt-4o',
    label: 'GPT-4o (Omni)',
    provider: 'OpenAI',
    tier: 'pro',
    latency: 'balanced',
    contextWindow: '128k tokens',
    price: '$2.50 / 1M tokens',
    description: 'Dernier flagship multimodal d\'OpenAI, référence mondiale de précision et d\'analyse textuelle.',
    highlights: ['Clé BYOK Requise', 'Flagship OpenAI', 'Multimodal']
  },
  {
    id: 'openai/o3-mini',
    label: 'OpenAI o3-mini',
    provider: 'OpenAI',
    tier: 'pro',
    latency: 'reasoning',
    contextWindow: '200k tokens',
    price: '$1.10 / 1M tokens',
    description: 'Dernier modèle de raisonnement logique haute vitesse d\'OpenAI pour calculs et analyses complexes.',
    highlights: ['Clé BYOK Requise', 'Raisonnement o3', 'Haute vitesse']
  },
  {
    id: 'deepseek/deepseek-r1',
    label: 'DeepSeek R1',
    provider: 'DeepSeek',
    tier: 'pro',
    latency: 'reasoning',
    contextWindow: '128k tokens',
    price: '$0.55 / 1M tokens',
    description: 'Dernier modèle de raisonnement profond open-weights rivalisant avec les meilleurs flagships mondiaux.',
    highlights: ['Clé BYOK Requise', 'Raisonnement R1', 'Ultra-puissant']
  },
  {
    id: 'deepseek/deepseek-chat',
    label: 'DeepSeek V3',
    provider: 'DeepSeek',
    tier: 'pro',
    latency: 'fast',
    contextWindow: '128k tokens',
    price: '$0.14 / 1M tokens',
    description: 'Dernière architecture MoE 671B de DeepSeek, ultra-rapide et économique.',
    highlights: ['Clé BYOK Requise', 'Architecture MoE 671B', 'Économique']
  },
  {
    id: 'moonshotai/kimi-k2.6',
    label: 'Kimi 2.6 (Moonshot)',
    provider: 'Moonshot AI',
    tier: 'pro',
    latency: 'balanced',
    contextWindow: '256k tokens',
    price: '$0.39 / 1M tokens',
    description: 'Dernier modèle multimodal et agentique de Moonshot AI avec contexte long de 256k tokens.',
    highlights: ['Clé BYOK Requise', 'Contexte 256k', 'Dernier Kimi']
  },
  {
    id: 'mistralai/mistral-large',
    label: 'Mistral Large',
    provider: 'Mistral AI',
    tier: 'pro',
    latency: 'balanced',
    contextWindow: '128k tokens',
    price: '$2.00 / 1M tokens',
    description: 'Dernier modèle européen flagship avec maîtrise multilingue exceptionnelle (FR, EN, ES, DE).',
    highlights: ['Clé BYOK Requise', 'Souveraineté EU', 'Multilingue']
  }
];

export function getModelOption(id: string): AIModelOption {
  return AI_MODEL_OPTIONS.find((option) => option.id === id) ?? AI_MODEL_OPTIONS[0];
}

export function isModelSupported(id: string): boolean {
  return AI_MODEL_OPTIONS.some((option) => option.id === id);
}
