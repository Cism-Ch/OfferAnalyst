// Utilitaires partagés pour les agents AI
import { z } from 'zod';
import { AgentActionError, AgentErrorCode } from '@/types';

// Types d'erreurs standardisés
export class AgentError extends Error {
  constructor(
    message: string,
    public code: AgentErrorCode
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

// Interface pour les réponses AI
export interface AIResponse {
  text: string;
  candidates?: unknown[];
}

// Utilitaire de parsing JSON robuste
export function parseJSONFromText(text: string, context: string = 'AI response'): unknown {
  console.log(`Parsing JSON from ${context} (${text.length} chars)`);

  let cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();

  // Trouver le premier délimiteur JSON valide ({ ou [)
  const firstBrace = cleanedText.indexOf('{');
  const firstBracket = cleanedText.indexOf('[');

  let startIndex = -1;
  let endChar = '';

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIndex = firstBrace;
    endChar = '}';
  } else if (firstBracket !== -1) {
    startIndex = firstBracket;
    endChar = ']';
  }

  if (startIndex === -1) {
    throw new AgentError(`No valid JSON object or array found in ${context}`, 'INVALID_JSON');
  }

  const lastIndex = cleanedText.lastIndexOf(endChar);

  if (lastIndex === -1 || lastIndex <= startIndex) {
    throw new AgentError(`Incomplete JSON structure found in ${context}`, 'INVALID_JSON');
  }

  cleanedText = cleanedText.substring(startIndex, lastIndex + 1);

  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    throw new AgentError(`Failed to parse JSON from ${context}: ${error}`, 'INVALID_JSON');
  }
}

// Utilitaire de retry avec exponential backoff
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  context: string = 'operation'
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`${context} - Attempt ${attempt}/${maxRetries}`);
      const result = await operation();
      console.log(`${context} - Success on attempt ${attempt}`);
      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`${context} - Attempt ${attempt} failed:`, error);

      // Ne pas retry sur certaines erreurs non récupérables (validation, clé invalide, expirée)
      const isAuthOrExpired = error instanceof Error && (
        error.message.toLowerCase().includes('expired') ||
        error.message.toLowerCase().includes('unauthorized') ||
        error.message.toLowerCase().includes('invalid api key') ||
        error.message.toLowerCase().includes('401')
      );

      if (
        isAuthOrExpired ||
        (error instanceof AgentError &&
        (error.code === 'VALIDATION_FAILED' || error.code === 'API_KEY_MISSING' || error.code === 'API_ERROR'))
      ) {
        break;
      }

      // Attendre avant de retry
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 2000;
        console.log(`${context} - Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  const isAuthError = lastError?.message.toLowerCase().includes('expired') ||
    lastError?.message.toLowerCase().includes('unauthorized') ||
    lastError?.message.toLowerCase().includes('invalid api key');

  throw new AgentError(
    `${context} failed: ${lastError?.message || 'Unknown error'}`,
    isAuthError ? 'API_KEY_EXPIRED' : 'SEARCH_FAILED'
  );
}

// Validation avec Zod
export function validateWithZod<T>(data: unknown, schema: z.ZodSchema<T>, context: string): T {
  const validationResult = schema.safeParse(data);

  if (!validationResult.success) {
    console.error(`Schema validation failed for ${context}:`, validationResult.error);
    const details = validationResult.error.issues
      .map(i => `${i.path.length > 0 ? `[${i.path.join('.')}] ` : ''}${i.message}`)
      .join('; ');
    throw new AgentError(
      `Validation failed for ${context}: ${details}`,
      'VALIDATION_FAILED'
    );
  }

  return validationResult.data;
}

/**
 * Extrait de manière robuste un tableau d'offres depuis n'importe quelle structure JSON renvoyée par un LLM.
 * Gère :
 * - Tableaux JSON directs : [ {...}, {...} ]
 * - Objets avec clé standard : { "offers": [...] }, { "data": [...] }, { "results": [...] }, { "items": [...] }
 * - Objets imbriqués : { "response": { "offers": [...] } }
 * - Dictionnaire d'offres : { "0": {...}, "1": {...} } ou { "offer_a": {...} }
 * - Offre unique isolée au niveau racine : { "id": "1", "title": "..." }
 */
export function extractOffersArray(parsed: unknown): unknown[] {
  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return [];
  }

  const obj = parsed as Record<string, unknown>;

  // 1. Clés directes standard
  const candidateKeys = ['offers', 'topOffers', 'listings', 'results', 'items', 'data', 'elements'];
  for (const key of candidateKeys) {
    if (Array.isArray(obj[key])) {
      return obj[key] as unknown[];
    }
  }

  // 2. Recherche d'un tableau au premier ou deuxième niveau d'imbrication
  for (const val of Object.values(obj)) {
    if (Array.isArray(val)) {
      return val;
    }
    if (typeof val === 'object' && val !== null) {
      for (const nestedVal of Object.values(val as Record<string, unknown>)) {
        if (Array.isArray(nestedVal)) {
          return nestedVal;
        }
      }
    }
  }

  // 3. Dictionnaire d'objets (ex: { "offer1": { title: "..." }, "offer2": { title: "..." } })
  const values = Object.values(obj);
  if (
    values.length > 0 &&
    values.every(v => typeof v === 'object' && v !== null && ('title' in v || 'name' in v || 'description' in v))
  ) {
    return values;
  }

  // 4. Offre unique renvoyée directement à la racine
  if ('title' in obj || 'name' in obj || 'price' in obj) {
    return [obj];
  }

  return [];
}

// Détection d'erreurs API dans les réponses
export function detectAPIError(text: string): AgentError | null {
  if (text.includes('"error"') && text.includes('"code"')) {
    try {
      const errorData = JSON.parse(text);
      if (errorData.error) {
        return new AgentError(
          `API Error: ${errorData.error.message || 'Unknown API error'} (Code: ${errorData.error.code})`,
          'API_ERROR'
        );
      }
    } catch {
      // Pas une erreur JSON, continuer
    }
  }
  return null;
}

export function toAgentActionError(
  error: unknown,
  context: string,
  fallbackCode: AgentErrorCode = 'OPENROUTER_ERROR'
): AgentActionError {
  let message = 'Une erreur inattendue est survenue lors de l\'opération.';
  let code: AgentErrorCode | string = fallbackCode;
  let raw: string | undefined;

  if (error instanceof AgentError) {
    message = error.message;
    code = error.code;
  } else if (error instanceof Error) {
    message = error.message;
    raw = error.stack;
  } else if (typeof error === 'string') {
    message = error;
    raw = error;
  }

  const rawLower = (message + ' ' + (raw || '')).toLowerCase();

  // 1. Détection 401 Unauthorized / Clé API invalide ou absente
  if (
    rawLower.includes('401') ||
    rawLower.includes('unauthorized') ||
    rawLower.includes('invalid api key') ||
    rawLower.includes('user key') ||
    code === 'API_KEY_MISSING' ||
    code === 'API_KEY_EXPIRED'
  ) {
    return {
      code: 'API_KEY_INVALID',
      message: 'Clé API invalide, expirée ou non autorisée pour ce modèle. Veuillez renseigner votre clé dans les paramètres.',
      context,
      raw,
      httpStatus: 401,
      remedy: {
        type: 'configure_api_key',
        label: 'Configurer ma clé API',
        targetUrl: '/dashboard/api-keys?action=add'
      }
    };
  }

  // 2. Détection 402 Solde/Crédits insuffisants
  if (
    rawLower.includes('402') ||
    rawLower.includes('insufficient') ||
    rawLower.includes('payment required') ||
    rawLower.includes('credit balance') ||
    rawLower.includes('quota exceeded')
  ) {
    return {
      code: 'INSUFFICIENT_CREDITS',
      message: 'Crédits OpenRouter insuffisants pour utiliser ce modèle payant. Vous pouvez basculer gratuitement sur Gemini 3.5 Flash Lite ou recharger votre solde.',
      context,
      raw,
      httpStatus: 402,
      remedy: {
        type: 'switch_to_free',
        label: 'Basculer sur Gemini 3.5 Flash Lite (Inclus)',
        suggestedModel: 'google/gemini-3.5-flash-lite'
      }
    };
  }

  // 3. Détection 429 Rate Limited / Trop de requêtes
  if (
    rawLower.includes('429') ||
    rawLower.includes('rate limit') ||
    rawLower.includes('too many requests')
  ) {
    return {
      code: 'RATE_LIMITED',
      message: 'Limite de requêtes atteinte (Rate Limit) sur ce modèle. Veuillez patienter quelques secondes avant de relancer.',
      context,
      raw,
      httpStatus: 429,
      remedy: {
        type: 'retry',
        label: 'Réessayer dans 15 secondes'
      }
    };
  }

  // 4. Détection 502/503/504 Modèle surchargé ou en panne côté provider
  if (
    rawLower.includes('502') ||
    rawLower.includes('503') ||
    rawLower.includes('504') ||
    rawLower.includes('overloaded') ||
    rawLower.includes('bad gateway') ||
    rawLower.includes('service unavailable')
  ) {
    return {
      code: 'MODEL_OVERLOADED',
      message: 'Le fournisseur de ce modèle IA rencontre une surcharge ou une panne temporaire. Veuillez réessayer ou choisir un autre modèle.',
      context,
      raw,
      httpStatus: 503,
      remedy: {
        type: 'switch_model',
        label: 'Basculer sur NVIDIA Nemotron ou Gemini',
        suggestedModel: 'google/gemini-3.5-flash-lite'
      }
    };
  }

  // 5. Détection Timeout / Déconnexion réseau
  if (
    rawLower.includes('etimedout') ||
    rawLower.includes('econnreset') ||
    rawLower.includes('timeout') ||
    rawLower.includes('fetch failed') ||
    rawLower.includes('abort')
  ) {
    return {
      code: 'TIMEOUT',
      message: 'Délai d\'attente dépassé : le modèle IA n\'a pas répondu dans le temps alloué. Vérifiez votre connexion ou réessayez.',
      context,
      raw,
      remedy: {
        type: 'retry',
        label: 'Relancer l\'analyse'
      }
    };
  }

  // 6. Détection Erreur de formatage JSON
  if (code === 'INVALID_JSON' || rawLower.includes('json')) {
    return {
      code: 'INVALID_JSON',
      message: 'Le modèle a répondu mais la structure de données n\'a pas pu être validée au format structuré attendu.',
      context,
      raw,
      remedy: {
        type: 'retry',
        label: 'Relancer l\'analyse'
      }
    };
  }

  // Fallback avec message explicite
  return {
    code,
    message: message || 'Une anomalie s\'est produite pendant l\'exécution de l\'agent IA.',
    context,
    raw,
    remedy: {
      type: 'retry',
      label: 'Réessayer'
    }
  };
}