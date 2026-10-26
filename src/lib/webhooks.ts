import crypto from 'crypto';
import { log } from './logger';

export interface WebhookPayload<T = unknown> {
  event: string;
  timestamp: string;
  data: T;
}

export interface WebhookOptions {
  secret?: string;
  maxRetries?: number;
  timeoutMs?: number;
  customHeaders?: Record<string, string>;
}

export interface WebhookDeliveryResult {
  success: boolean;
  statusCode?: number;
  attempts: number;
  durationMs: number;
  error?: string;
}

/**
 * Computes an HMAC SHA-256 signature for the given webhook body.
 */
export function generateWebhookSignature(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

/**
 * Dispatches a webhook asynchronously with retry logic, timeout, and HMAC signing.
 */
export async function sendWebhook<T = unknown>(
  webhookUrl: string,
  payload: WebhookPayload<T>,
  options: WebhookOptions = {}
): Promise<WebhookDeliveryResult> {
  const {
    secret = process.env.WEBHOOK_SECRET,
    maxRetries = 3,
    timeoutMs = 5000,
    customHeaders = {}
  } = options;

  const startTime = Date.now();
  const serializedPayload = JSON.stringify(payload);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'OfferAnalyst-Webhook-Notifier/1.0',
    'X-OfferAnalyst-Event': payload.event,
    'X-OfferAnalyst-Timestamp': payload.timestamp,
    ...customHeaders
  };

  if (secret) {
    const signature = generateWebhookSignature(serializedPayload, secret);
    headers['X-OfferAnalyst-Signature'] = `sha256=${signature}`;
  }

  let attempt = 0;
  let lastError: string | undefined;

  while (attempt < maxRetries) {
    attempt++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      log.info('Dispatching webhook', {
        url: webhookUrl,
        event: payload.event,
        attempt,
        maxRetries
      });

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: serializedPayload,
        signal: controller.signal
      });

      clearTimeout(timer);

      if (response.ok) {
        const durationMs = Date.now() - startTime;
        log.info('Webhook dispatched successfully', {
          url: webhookUrl,
          statusCode: response.status,
          attempts: attempt,
          durationMs
        });

        return {
          success: true,
          statusCode: response.status,
          attempts: attempt,
          durationMs
        };
      }

      lastError = `HTTP ${response.status}: ${response.statusText}`;
      log.warn(`Webhook attempt ${attempt} failed with status ${response.status}`, {
        url: webhookUrl,
        attempt,
        status: response.status
      });
    } catch (err) {
      clearTimeout(timer);
      const isAbort = err instanceof Error && err.name === 'AbortError';
      lastError = isAbort ? `Webhook delivery timed out after ${timeoutMs}ms` : (err instanceof Error ? err.message : String(err));

      log.warn(`Webhook attempt ${attempt} encountered error: ${lastError}`, {
        url: webhookUrl,
        attempt,
        error: lastError
      });
    }

    if (attempt < maxRetries) {
      // Exponential backoff delay (500ms, 1000ms, 2000ms)
      const delay = Math.pow(2, attempt - 1) * 500;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  const durationMs = Date.now() - startTime;
  log.error('Webhook delivery failed after max retries', new Error(lastError || 'Max retries reached'), {
    url: webhookUrl,
    attempts: attempt,
    durationMs,
    error: lastError
  });

  return {
    success: false,
    attempts: attempt,
    durationMs,
    error: lastError || 'Webhook delivery failed'
  };
}
