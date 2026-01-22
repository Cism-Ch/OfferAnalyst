import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, metadata, path } = body;

    // Get user agent from headers
    const userAgent = request.headers.get('user-agent') || undefined;

    // Track the event
    await trackEvent({
      type,
      metadata,
      userAgent,
      path,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Analytics API] Error tracking event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
