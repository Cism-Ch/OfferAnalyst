// Utilitaires partagés pour les agents AI
import { z } from 'zod';

// Types d'erreurs standardisés
export class AgentError extends Error {
  constructor(
    message: string,
    public code: 'API_KEY_MISSING' | 'NO_RESPONSE' | 'INVALID_JSON' | 'VALIDATION_FAILED' | 'SEARCH_FAILED' | 'API_ERROR' | 'OPENROUTER_ERROR'
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
  maxRetries: number = 5,
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

      // Ne pas retry sur certaines erreurs
      if (error instanceof AgentError &&
        (error.code === 'VALIDATION_FAILED' || error.code === 'API_KEY_MISSING' || error.code === 'API_ERROR')) {
        break;
      }

      // Attendre avant de retry
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`${context} - Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new AgentError(
    `${context} failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`,
    'SEARCH_FAILED'
  );
}

// Validation avec Zod
export function validateWithZod<T>(data: unknown, schema: z.ZodSchema<T>, context: string): T {
  const validationResult = schema.safeParse(data);

  if (!validationResult.success) {
    console.error(`Schema validation failed for ${context}:`, validationResult.error);
    throw new AgentError(
      `Validation failed for ${context}: ${validationResult.error.issues.map(i => i.path.join('.')).join(', ')}`,
      'VALIDATION_FAILED'
    );
  }

  return validationResult.data;
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