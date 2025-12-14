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
  searchSources?: SearchSource[];
}
