import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { trackEvent, AnalyticsEventType } from '@/lib/analytics';
import { rateLimit, getClientIdentifier, createRateLimitHeaders } from '@/lib/rate-limiter';

const validEventTypes: [AnalyticsEventType, ...AnalyticsEventType[]] = [
  'page_view',
  'search_started',
  'search_completed',
  'analysis_started',
  'analysis_completed',
  'offer_saved',
  'offer_unsaved',
  'project_created',
  'project_updated',
  'theme_changed',
  'model_changed',
  'export_data',
];

const analyticsEventSchema = z.object({
  type: z.enum(validEventTypes),
  metadata: z.record(z.string().max(100), z.unknown()).optional(),
  path: z.string().max(2048).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting (60 events per minute per IP)
    const identifier = getClientIdentifier(request);
    const rateLimitResult = rateLimit(`analytics:${identifier}`, {
      max: 60,
      windowMs: 60 * 1000,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded for analytics events' },
        { status: 429, headers: createRateLimitHeaders(rateLimitResult) }
      );
    }

    // 2. Reject payloads exceeding 16KB
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 16384) {
      return NextResponse.json(
        { success: false, error: 'Payload too large (max 16KB)' },
        { status: 413, headers: createRateLimitHeaders(rateLimitResult) }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400, headers: createRateLimitHeaders(rateLimitResult) }
      );
    }

    // 3. Strict Zod Validation
    const parsed = analyticsEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400, headers: createRateLimitHeaders(rateLimitResult) }
      );
    }

    const { type, metadata, path } = parsed.data;
    const userAgent = request.headers.get('user-agent')?.slice(0, 512) || undefined;

    // 4. Track the event safely
    await trackEvent({
      type,
      metadata,
      userAgent,
      path,
    });

    return NextResponse.json(
      { success: true },
      { headers: createRateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    console.error('[Analytics API] Error tracking event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
