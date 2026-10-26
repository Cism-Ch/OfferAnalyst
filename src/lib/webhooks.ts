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
 * Anti-SSRF URL validator for webhooks.
 * Blocks non-HTTP(S) protocols, private IP ranges, localhost (in production), and cloud metadata endpoints.
 */
export function isValidWebhookUrl(urlStr: string): { valid: boolean; reason?: string } {
  try {
    const url = new URL(urlStr);

    // Require HTTP or HTTPS protocol
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, reason: 'Protocole non supporté (seuls http: et https: sont autorisés)' };
    }

    const hostname = url.hostname.toLowerCase();
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

    // Loopback / localhost checks
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1'
    ) {
      if (!isDevelopment) {
        return { valid: false, reason: 'Les adresses de boucle locale (localhost) sont interdites en production' };
      }
    }

    // Cloud metadata endpoints (AWS, GCP, Azure, DigitalOcean, etc.)
    if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal' || hostname === 'instance-data') {
      return { valid: false, reason: 'Accès interdit aux métadonnées d’instance cloud (Anti-SSRF)' };
    }

    // Check IPv4 private networks (RFC 1918 & RFC 3927 link-local)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = hostname.match(ipv4Regex);
    if (ipMatch) {
      const [, o1, o2] = ipMatch.map(Number);
      if (o1 === 10) return { valid: false, reason: 'Adresses privées 10.0.0.0/8 interdites' };
      if (o1 === 172 && o2 >= 16 && o2 <= 31) return { valid: false, reason: 'Adresses privées 172.16.0.0/12 interdites' };
      if (o1 === 192 && o2 === 168) return { valid: false, reason: 'Adresses privées 192.168.0.0/16 interdites' };
      if (o1 === 169 && o2 === 254) return { valid: false, reason: 'Adresses de lien local (169.254.0.0/16) interdites' };
      if (o1 === 127 && !isDevelopment) return { valid: false, reason: 'Adresses de boucle locale (127.0.0.0/8) interdites' };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: 'URL malformée' };
  }
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
  const urlCheck = isValidWebhookUrl(webhookUrl);
  if (!urlCheck.valid) {
    log.warn('Tentative d’envoi de webhook vers une URL non sécurisée (SSRF)', {
      url: webhookUrl,
      reason: urlCheck.reason
    });
    return {
      success: false,
      attempts: 0,
      durationMs: 0,
      error: `URL de webhook rejetée (Anti-SSRF) : ${urlCheck.reason}`
    };
  }

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
