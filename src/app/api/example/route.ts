/**
 * Example API Route with Security Features
 * 
 * This is a template showing how to use rate limiting, security headers,
 * and audit logging in API routes.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  rateLimit,
  rateLimitConfigs,
  getClientIdentifier,
  createRateLimitHeaders,
} from '@/lib/rate-limiter';
import { getSecurityHeaders } from '@/lib/security-headers';
// import { logRateLimitExceeded } from '@/lib/audit-logger'; // Commented out due to pino build warnings

/**
 * GET /api/example
 * 
 * Example protected API route with rate limiting
 */
export async function GET(request: NextRequest) {
  try {
    // Get client identifier (IP address)
    const identifier = getClientIdentifier(request);

    // Apply rate limiting
    const rateLimitResult = rateLimit(identifier, rateLimitConfigs.api);

    if (!rateLimitResult.success) {
      // Log rate limit exceeded (audit logger commented out due to build issues)
      // logRateLimitExceeded(identifier, '/api/example');
      console.warn(`[Security] Rate limit exceeded for ${identifier} on /api/example`);

      // Return 429 Too Many Requests
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          limit: rateLimitResult.limit,
          reset: rateLimitResult.reset,
        },
        {
          status: 429,
          headers: {
            ...createRateLimitHeaders(rateLimitResult),
            ...getSecurityHeaders(),
          },
        }
      );
    }

    // Your API logic here
    const data = {
      message: 'Hello from secure API',
      timestamp: new Date().toISOString(),
    };

    // Return success response with security headers
    return NextResponse.json(data, {
      status: 200,
      headers: {
        ...createRateLimitHeaders(rateLimitResult),
        ...getSecurityHeaders(),
      },
    });
  } catch (error) {
    console.error('API Error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      {
        status: 500,
        headers: getSecurityHeaders(),
      }
    );
  }
}

/**
 * POST /api/example
 * 
 * Example POST endpoint with stricter rate limiting
 */
export async function POST(request: NextRequest) {
  try {
    const identifier = getClientIdentifier(request);

    // Use stricter rate limit for POST requests
    const rateLimitResult = rateLimit(identifier, {
      max: 50,
      windowMs: 60 * 60 * 1000,
    });

    if (!rateLimitResult.success) {
      // logRateLimitExceeded(identifier, '/api/example'); // Commented out due to build issues
      console.warn(`[Security] Rate limit exceeded for ${identifier} on /api/example POST`);

      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            ...createRateLimitHeaders(rateLimitResult),
            ...getSecurityHeaders(),
          },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    // Your API logic here
    const result = {
      success: true,
      data: body,
    };

    return NextResponse.json(result, {
      status: 200,
      headers: {
        ...createRateLimitHeaders(rateLimitResult),
        ...getSecurityHeaders(),
      },
    });
  } catch (error) {
    console.error('API Error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      {
        status: 500,
        headers: getSecurityHeaders(),
      }
    );
  }
}

/**
 * OPTIONS /api/example
 * 
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      ...getSecurityHeaders(),
    },
  });
}
