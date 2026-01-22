import { NextRequest, NextResponse } from 'next/server';
import { trackEvent, AnalyticsEventType } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, metadata, path } = body;

    // Validate event type
    const validTypes: AnalyticsEventType[] = [
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

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event type' },
        { status: 400 }
      );
    }

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
