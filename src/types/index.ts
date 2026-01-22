export interface Offer {
  id: string;
  title: string;
  description: string;
  price: string | number;
  location: string;
  category: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface UserProfile {
  explicitCriteria: string; // e.g., "Budget 800k, Paris"
  implicitContext: string; // e.g., "Family with 2 kids, safety priority"
  domain: string; // e.g., "Real Estate", "Jobs"
}

export interface ScoreBreakdown {
  relevance: number; // 0-100
  quality: number; // 0-100
  trend: number; // 0-100
}

export interface ScoredOffer extends Offer {
  finalScore: number; // 0-100
  breakdown: ScoreBreakdown;
  justification: string;
  webInsights: string[]; // Facts gathered from web
  rank: number;
}

export interface SearchSource {
  title: string;
  uri: string;
}

export interface AnalysisResponse {
  topOffers: ScoredOffer[];
  marketSummary: string;
  searchSources: SearchSource[];
}

export type AgentErrorCode =
  | 'API_KEY_MISSING'
  | 'NO_RESPONSE'
  | 'INVALID_JSON'
  | 'VALIDATION_FAILED'
  | 'SEARCH_FAILED'
  | 'API_ERROR'
  | 'OPENROUTER_ERROR';

export interface AgentActionError {
  message: string;
  code: AgentErrorCode | string;
  context?: string;
  raw?: string;
}

export type AgentActionResult<T> =
  | { success: true; data: T; meta?: { model: string; latencyMs?: number; [key: string]: any } }
  | { success: false; error: AgentActionError };

export type ProviderErrorPhase = 'fetch' | 'analyze';

export interface ProviderErrorState extends AgentActionError {
  phase: ProviderErrorPhase;
  timestamp: number;
  model?: string;
}

export interface SearchHistoryItem {
  id: string;
  timestamp: number;
  inputs: {
    domain: string;
    criteria: string;
    context: string;
  };
  results: AnalysisResponse;
  pinned: boolean;
}

// Zod schemas for validation
import { z } from 'zod';

export const OfferSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.union([z.string(), z.number()]),
  location: z.string(),
  category: z.string(),
  url: z.string().optional(),
});

export const OfferArraySchema = z.array(OfferSchema);

// Type inference from Zod schema
export type ValidatedOffer = z.infer<typeof OfferSchema>;
