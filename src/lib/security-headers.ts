/**
 * Security Headers Configuration
 * 
 * Implements security best practices through HTTP headers
 * Protects against common web vulnerabilities
 */

export interface SecurityHeadersConfig {
  /**
   * Content Security Policy
   */
  contentSecurityPolicy?: string;
  /**
   * Strict Transport Security max age (seconds)
   */
  hstsMaxAge?: number;
  /**
   * Enable HSTS preload
   */
  hstsPreload?: boolean;
  /**
   * Referrer Policy
   */
  referrerPolicy?: string;
  /**
   * Permissions Policy
   */
  permissionsPolicy?: string;
}

/**
 * Default security headers configuration
 */
const defaultConfig: SecurityHeadersConfig = {
  contentSecurityPolicy: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-inline needed for Next.js
    "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for Tailwind
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://openrouter.ai https://api.openrouter.ai",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  hstsMaxAge: 31536000, // 1 year
  hstsPreload: true,
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()', // Disable FLoC
  ].join(', '),
};

/**
 * Generate security headers
 */
export function getSecurityHeaders(
  config: SecurityHeadersConfig = {}
): HeadersInit {
  const mergedConfig = { ...defaultConfig, ...config };

  const headers: Record<string, string> = {
    // Content Security Policy
    'Content-Security-Policy': mergedConfig.contentSecurityPolicy!,

    // Strict Transport Security (HTTPS only)
    'Strict-Transport-Security': `max-age=${mergedConfig.hstsMaxAge}${
      mergedConfig.hstsPreload ? '; includeSubDomains; preload' : ''
    }`,

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Enable XSS protection (legacy, but still useful)
    'X-XSS-Protection': '1; mode=block',

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // Referrer Policy
    'Referrer-Policy': mergedConfig.referrerPolicy!,

    // Permissions Policy
    'Permissions-Policy': mergedConfig.permissionsPolicy!,

    // Disable DNS prefetching for privacy
    'X-DNS-Prefetch-Control': 'off',

    // Remove X-Powered-By header
    'X-Powered-By': '',
  };

  return headers;
}

/**
 * CORS configuration
 */
export interface CORSConfig {
  /**
   * Allowed origins (use ['*'] for all, or specific domains)
   */
  origins: string[];
  /**
   * Allowed HTTP methods
   */
  methods?: string[];
  /**
   * Allowed headers
   */
  allowedHeaders?: string[];
  /**
   * Exposed headers
   */
  exposedHeaders?: string[];
  /**
   * Max age for preflight requests (seconds)
   */
  maxAge?: number;
  /**
   * Allow credentials
   */
  credentials?: boolean;
}

/**
 * Default CORS configuration
 */
const defaultCORSConfig: CORSConfig = {
  origins: [], // No origins allowed by default (same-origin only)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400, // 24 hours
  credentials: true,
};

/**
 * Generate CORS headers
 */
export function getCORSHeaders(
  origin: string | null,
  config: Partial<CORSConfig> = {}
): HeadersInit {
  const mergedConfig = { ...defaultCORSConfig, ...config };
  const headers: Record<string, string> = {};

  // Check if origin is allowed
  const isOriginAllowed = 
    mergedConfig.origins.includes('*') ||
    (origin && mergedConfig.origins.includes(origin));

  if (isOriginAllowed && origin) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  if (mergedConfig.methods) {
    headers['Access-Control-Allow-Methods'] = mergedConfig.methods.join(', ');
  }

  if (mergedConfig.allowedHeaders) {
    headers['Access-Control-Allow-Headers'] = mergedConfig.allowedHeaders.join(', ');
  }

  if (mergedConfig.exposedHeaders) {
    headers['Access-Control-Expose-Headers'] = mergedConfig.exposedHeaders.join(', ');
  }

  if (mergedConfig.maxAge) {
    headers['Access-Control-Max-Age'] = mergedConfig.maxAge.toString();
  }

  if (mergedConfig.credentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

/**
 * Validate and sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Check if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if an email is valid (basic validation)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
