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

export const DEFAULT_MODEL_ID = 'nvidia/nemotron-3.5-lightning:free';

export const AI_MODEL_OPTIONS: AIModelOption[] = [
  // ---------------------------------------------------------------------------
  // 1. NVIDIA (2 Modèles Gratuits Nemotron - 0$)
  // ---------------------------------------------------------------------------
  {
    id: DEFAULT_MODEL_ID,
    label: 'NVIDIA Nemotron 3.5 Lightning (Gratuit)',
    provider: 'NVIDIA',
    tier: 'free',
    latency: 'fast',
    contextWindow: '1M tokens',
    price: '$0 / requête (Gratuit)',
    description: 'Modèle léger ultra-rapide de NVIDIA optimisé pour le raisonnement instantané et l\'analyse textuelle.',
    highlights: ['Modèle Gratuit', '1M Contexte', 'NVIDIA GPU Acceleration']
  },
  {
    id: 'nvidia/nemotron-3-ultra-550b-a55b:free',
    label: 'NVIDIA Nemotron 3 Ultra 550B (Gratuit)',
    provider: 'NVIDIA',
    tier: 'free',
    latency: 'reasoning',
    contextWindow: '1M tokens',
    price: '$0 / requête (Gratuit)',
    description: 'Architecture MoE géante de 550B de NVIDIA conçue pour les analyses complexes et le raisonnement approfondi.',
    highlights: ['Modèle Gratuit', 'Architecture MoE 550B', 'Raisonnement Avancé']
  },

  // ---------------------------------------------------------------------------
  // 2. OpenAI (GPT-6.1, o3, GPT-4o)
  // ---------------------------------------------------------------------------
  {
    id: 'openai/gpt-6.1-terra',
    label: 'GPT-6.1 Terra',
    provider: 'OpenAI',
    tier: 'pro',
    latency: 'balanced',
    contextWindow: '256k tokens',
    price: '$2.50 / 1M tokens',
    description: 'Dernière génération flagship OpenAI offrant une compréhension contextuelle et une précision analytique inégalées.',
    highlights: ['Clé BYOK Requise', 'Flagship GPT-6.1', 'Précision Maximale']
  },
  {
    id: 'openai/o3',
    label: 'OpenAI o3',
    provider: 'OpenAI',
    tier: 'pro',
    latency: 'reasoning',
    contextWindow: '200k tokens',
    price: '$2.00 / 1M tokens',
    description: 'Modèle frontière de raisonnement logique mathématique et déductif pour arbitrer les critères d\'offres complexes.',
    highlights: ['Clé BYOK Requise', 'Raisonnement o3', 'Logique Déductive']
  },
  {
    id: 'openai/gpt-4o',
    label: 'GPT-4o (Omni)',
    provider: 'OpenAI',
    tier: 'pro',
    latency: 'fast',
    contextWindow: '128k tokens',
    price: '$2.50 / 1M tokens',
    description: 'Modèle de référence polyvalent, équilibrant rapidité d\'inférence, exactitude sémantique et extraction de données.',
    highlights: ['Clé BYOK Requise', 'Standard Éprouvé', 'Haute Rapidité']
  },

  // ---------------------------------------------------------------------------
  // 3. Anthropic (2 Modèles Claude 5.5)
  // ---------------------------------------------------------------------------
  {
    id: 'anthropic/claude-sonnet-5.5',
    label: 'Claude 5.5 Sonnet',
    provider: 'Anthropic',
    tier: 'pro',
    latency: 'reasoning',
    contextWindow: '200k tokens',
    price: '$3.00 / 1M tokens',
    description: 'Dernier modèle frontière d\'Anthropic avec raisonnement hybride de pointe, nuance linguistique et synthèse experte.',
    highlights: ['Clé BYOK Requise', 'Claude 5.5', 'Nuance & Esprit Critique']
  },
  {
    id: 'anthropic/claude-haiku-5.5',
    label: 'Claude 5.5 Haiku',
    provider: 'Anthropic',
    tier: 'pro',
    latency: 'fast',
    contextWindow: '200k tokens',
    price: '$0.80 / 1M tokens',
    description: 'Version ultra-rapide de Claude 5.5 pour une exécution quasi-instantanée et des classements de données en temps réel.',
    highlights: ['Clé BYOK Requise', 'Haiku 5.5', 'Temps Réel']
  },

  // ---------------------------------------------------------------------------
  // 4. DeepSeek (2 Modèles V3 & R1)
  // ---------------------------------------------------------------------------
  {
    id: 'deepseek/deepseek-chat',
    label: 'DeepSeek V3',
    provider: 'DeepSeek',
    tier: 'pro',
    latency: 'fast',
    contextWindow: '128k tokens',
    price: '$0.27 / 1M tokens',
    description: 'Architecture MoE 671B ultra-efficace, champion mondial du rapport performance / coût pour l\'analyse en volume.',
    highlights: ['Clé BYOK Requise', 'MoE 671B', 'Ultra Économique']
  },
  {
    id: 'deepseek/deepseek-r1-0528',
    label: 'DeepSeek R1',
    provider: 'DeepSeek',
    tier: 'pro',
    latency: 'reasoning',
    contextWindow: '128k tokens',
    price: '$0.55 / 1M tokens',
    description: 'Modèle de raisonnement profond par renforcement, capable de décomposer méthodiquement chaque critère d\'évaluation.',
    highlights: ['Clé BYOK Requise', 'Raisonnement R1', 'Décomposition Logique']
  },

  // ---------------------------------------------------------------------------
  // 5. Google (2 Modèles Gemini)
  // ---------------------------------------------------------------------------
  {
    id: 'google/gemini-3.8-flash',
    label: 'Gemini 3.8 Flash',
    provider: 'Google',
    tier: 'pro',
    latency: 'fast',
    contextWindow: '1M tokens',
    price: '$0.15 / 1M tokens',
    description: 'Dernier modèle multimodal ultra-rapide de Google avec fenêtre de contexte géante de 1 million de tokens.',
    highlights: ['Clé BYOK Requise', '1M Contexte', 'Ultra-Rapide']
  },
  {
    id: 'google/gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    provider: 'Google',
    tier: 'pro',
    latency: 'reasoning',
    contextWindow: '1M tokens',
    price: '$1.25 / 1M tokens',
    description: 'Flagship de Google pour les déductions complexes, l\'analyse de documents longs et la synthèse de marché dense.',
    highlights: ['Clé BYOK Requise', 'Flagship Google', 'Analyse Approfondie']
  },

  // ---------------------------------------------------------------------------
  // 6. Mistral AI (2 Modèles Européens)
  // ---------------------------------------------------------------------------
  {
    id: 'mistralai/mistral-large',
    label: 'Mistral Large',
    provider: 'Mistral AI',
    tier: 'pro',
    latency: 'balanced',
    contextWindow: '128k tokens',
    price: '$2.00 / 1M tokens',
    description: 'Modèle européen flagship avec souveraineté des données et maîtrise multilingue exceptionnelle (FR, EN, ES, DE).',
    highlights: ['Clé BYOK Requise', 'Souveraineté EU', 'Excellence Multilingue']
  },
  {
    id: 'mistralai/mistral-small-2603',
    label: 'Mistral Small',
    provider: 'Mistral AI',
    tier: 'pro',
    latency: 'fast',
    contextWindow: '128k tokens',
    price: '$0.20 / 1M tokens',
    description: 'Modèle compact européen à faible latence et haute précision pour les extractions rapides de critères.',
    highlights: ['Clé BYOK Requise', 'Souveraineté EU', 'Faible Latence']
  }
];

export function getModelOption(id: string): AIModelOption {
  return AI_MODEL_OPTIONS.find((option) => option.id === id) ?? AI_MODEL_OPTIONS[0];
}

export function isModelSupported(id: string): boolean {
  return AI_MODEL_OPTIONS.some((option) => option.id === id);
}
