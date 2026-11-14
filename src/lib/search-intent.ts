/**
 * Semantic Search Intent & Localized Query Builder for Tavily + OpenRouter
 *
 * Ensures consistent query formulation, language boosting, and domain-specific
 * extraction/scoring across Jobs, Wholesale/Sourcing, Real Estate, Freelance B2B, and SaaS.
 */

import { getCountryOption, normalizeCountryCode } from '@/lib/geo';

export type OfferDomainIntent =
  | 'job'
  | 'wholesale'
  | 'real_estate'
  | 'freelance_b2b'
  | 'saas_product'
  | 'general';

export type QueryLanguage = 'fr' | 'en';

const INTENT_PATTERNS: Array<{ intent: OfferDomainIntent; regex: RegExp }> = [
  {
    intent: 'wholesale',
    regex: /\b(gros|grossiste|fournisseur|fournisseurs|marchandise|marchandises|lot|lots|moq|import|export|wholesale|bulk|supplier|suppliers|manufacturer|stock|destockage|b2b\s+trade|chaussures\s+en\s+gros|vetements\s+en\s+gros)\b/i,
  },
  {
    intent: 'real_estate',
    regex: /\b(immobilier|real\s+estate|appartement|maison|villa|terrain|studio|bureau|local\s+commercial|location|loyer|achat\s+immo|m2|sqft|rent|lease|property)\b/i,
  },
  {
    intent: 'freelance_b2b',
    regex: /\b(freelance|consultant|prestation|mission|tjm|day\s+rate|agency|agence|contrat\s+prestation|sous-traitance|appel\s+d'?offre|rfp)\b/i,
  },
  {
    intent: 'job',
    regex: /\b(job|jobs|emploi|emplois|recrutement|carriere|carrière|poste|cdi|cdd|stage|alternance|salaire|hiring|career|salary|developer|developpeur|développeur|engineer|ingenieur|ingénieur|manager)\b/i,
  },
  {
    intent: 'saas_product',
    regex: /\b(saas|software|logiciel|outil|abonnement|subscription|pricing|plan|licence|license|cloud|api|hardware|produit|product|ecommerce)\b/i,
  },
];

/**
 * Classify the user's domain and criteria/context into a structured business intent.
 */
export function classifyOfferIntent(domain: string, context = ''): OfferDomainIntent {
  const combined = `${domain} ${context}`.trim();
  for (const rule of INTENT_PATTERNS) {
    if (rule.regex.test(combined)) {
      return rule.intent;
    }
  }
  return 'general';
}

/**
 * Lightweight deterministic language detection for user queries.
 * Avoids forcing French on English sourcing queries (and vice versa).
 */
export function detectQueryLanguage(
  text: string,
  fallbackLang?: string
): QueryLanguage {
  const sample = text.trim();
  if (!sample) {
    return fallbackLang === 'en' ? 'en' : 'fr';
  }

  const hasFrenchAccents = /[àâäçéèêëîïôöùûüÿœæ]/i.test(sample);
  const frenchMarkers =
    sample.match(
      /\b(en\s+gros|offre|offres|emploi|emplois|travail|salaire|prix|loyer|cherche|recherche|avec|sans|pour|dans|sur|cote\s+d'?ivoire|abidjan|france|paris|dakar|fournisseur|grossiste|chaussures|achat|vente)\b/gi
    )?.length ?? 0;
  const englishMarkers =
    sample.match(
      /\b(wholesale|bulk|supplier|suppliers|hiring|remote|hybrid|salary|looking\s+for|jobs|price|average|market|shoes|sneakers|for|with|in|near)\b/gi
    )?.length ?? 0;

  const frScore = frenchMarkers * 2 + (hasFrenchAccents ? 2 : 0);
  const enScore = englishMarkers * 2;

  if (frScore > enScore) return 'fr';
  if (enScore > frScore) return 'en';
  return fallbackLang === 'en' ? 'en' : 'fr';
}

function appendIfMissing(base: string, addition: string): string {
  const normalizedBase = base.toLowerCase();
  const tokens = addition
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);
  const alreadyPresent = tokens.some((token) => normalizedBase.includes(token));
  if (alreadyPresent) return base;
  return `${base} ${addition}`.trim();
}

/**
 * Build a clean, single-language localized search query for Tavily `fetchOffersAction`.
 * Never mixes English + French country labels in the same query.
 */
export function buildTavilyFetchQuery(params: {
  domain: string;
  context: string;
  countryCode?: string | null;
  intent?: OfferDomainIntent;
  queryLang?: QueryLanguage;
}): string {
  const normalizedCountry = normalizeCountryCode(params.countryCode);
  const countryMeta = getCountryOption(normalizedCountry);
  const intent = params.intent ?? classifyOfferIntent(params.domain, params.context);
  const queryLang =
    params.queryLang ??
    detectQueryLanguage(`${params.domain} ${params.context}`, countryMeta.tavilyLanguage);

  let query = `${params.domain} ${params.context}`.replace(/\s+/g, ' ').trim();

  if (intent === 'job') {
    query = appendIfMissing(query, queryLang === 'fr' ? 'offre emploi' : 'job opening');
  } else if (intent === 'wholesale') {
    query = appendIfMissing(
      query,
      queryLang === 'fr' ? 'grossiste fournisseur prix' : 'wholesale supplier bulk price'
    );
  } else if (intent === 'real_estate') {
    query = appendIfMissing(query, queryLang === 'fr' ? 'annonce prix' : 'listing price');
  }

  if (normalizedCountry !== 'INTL') {
    const localizedCountryName =
      queryLang === 'fr' ? countryMeta.labelFr : countryMeta.labelEn;
    if (
      !query.toLowerCase().includes(countryMeta.labelFr.toLowerCase()) &&
      !query.toLowerCase().includes(countryMeta.labelEn.toLowerCase())
    ) {
      query = `${query} ${localizedCountryName}`.trim();
    }
  }

  return query.slice(0, 380);
}

/**
 * Build a domain-aware market benchmark query for Tavily inside `analyzeOffersAction`.
 */
export function buildTavilyBenchmarkQuery(params: {
  domain: string;
  criteria: string;
  countryCode?: string | null;
  intent?: OfferDomainIntent;
  queryLang?: QueryLanguage;
}): string {
  const normalizedCountry = normalizeCountryCode(params.countryCode);
  const countryMeta = getCountryOption(normalizedCountry);
  const intent = params.intent ?? classifyOfferIntent(params.domain, params.criteria);
  const queryLang =
    params.queryLang ??
    detectQueryLanguage(`${params.domain} ${params.criteria}`, countryMeta.tavilyLanguage);

  const benchmarkSuffixMap: Record<OfferDomainIntent, Record<QueryLanguage, string>> = {
    job: {
      fr: 'grille salaire tendance marché',
      en: 'salary range market benchmark',
    },
    wholesale: {
      fr: 'prix moyen grossiste MOQ fournisseur',
      en: 'average wholesale unit price MOQ supplier',
    },
    real_estate: {
      fr: 'prix m2 loyer moyen marché',
      en: 'average price per sqm rent market trend',
    },
    freelance_b2b: {
      fr: 'TJM tarif prestation marché',
      en: 'freelance day rate B2B benchmark',
    },
    saas_product: {
      fr: 'comparatif tarifs avis marché',
      en: 'pricing comparison market benchmark',
    },
    general: {
      fr: 'prix moyen tendance marché',
      en: 'average market price trend',
    },
  };

  const suffix = benchmarkSuffixMap[intent][queryLang];
  const countryHint =
    normalizedCountry === 'INTL'
      ? ''
      : queryLang === 'fr'
        ? countryMeta.labelFr
        : countryMeta.labelEn;

  return `${params.domain} ${params.criteria} ${countryHint} ${suffix}`
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 320);
}

/**
 * Domain-specific extraction guidance injected into the OpenRouter structurer prompt.
 */
export function getIntentExtractionGuidance(intent: OfferDomainIntent): string {
  switch (intent) {
    case 'wholesale':
      return 'WHOLESALE/SOURCING FOCUS: Prioritize unit/lot price, currency (FCFA/XOF, EUR, USD), Minimum Order Quantity (MOQ), supplier city/country, and delivery or incoterm clues.';
    case 'job':
      return 'JOB FOCUS: Prioritize role title, contract type (CDI/CDD/Freelance/Full-time), salary/compensation band, remote/hybrid/onsite policy, and city/country.';
    case 'real_estate':
      return 'REAL ESTATE FOCUS: Prioritize rent/sale price, surface area (m²/sqft), neighborhood/city, and key property conditions.';
    case 'freelance_b2b':
      return 'FREELANCE/B2B FOCUS: Prioritize day rate (TJM) or project budget, duration, deliverables, and client sector.';
    case 'saas_product':
      return 'SAAS/PRODUCT FOCUS: Prioritize tier pricing, billing cycle, core included limits, and key differentiators.';
    default:
      return 'GENERAL FOCUS: Extract exact stated price/compensation, clear location, and factual terms.';
  }
}

/**
 * Domain-specific scoring & red-flag guidance injected into `analyzeOffersAction`.
 */
export function getIntentScoringGuidance(intent: OfferDomainIntent): string {
  switch (intent) {
    case 'wholesale':
      return 'WHOLESALE EVALUATION: Assess margin potential vs market wholesale prices, MOQ clarity, supplier credibility, and flag risks (missing MOQ/unit price, 100% upfront wire without escrow, counterfeit/generic aggregator risk).';
    case 'job':
      return 'JOB EVALUATION: Assess role fit, salary competitiveness vs local market benchmark, contract clarity, and flag risks (missing salary, vague mission, unpaid trial, location mismatch).';
    case 'real_estate':
      return 'REAL ESTATE EVALUATION: Assess price per m² vs local market benchmark, location fit, and flag risks (missing surface/charges, below-market scam signals).';
    case 'freelance_b2b':
      return 'B2B/FREELANCE EVALUATION: Assess TJM/budget vs market benchmark, scope clarity, payment terms, and flag risks (unclear deliverables, underpriced scope).';
    default:
      return 'MARKET EVALUATION: Compare stated price/terms against live market benchmark and explicitly flag missing pricing or vague/generic listings.';
  }
}
