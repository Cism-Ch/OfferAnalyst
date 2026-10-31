import { NextRequest, NextResponse } from 'next/server';
import { trackWebVitals } from '@/lib/analytics';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown>;
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await request.json().catch(() => ({}));
    } else {
      const text = await request.text().catch(() => '');
      try {
        body = JSON.parse(text || '{}');
      } catch {
        body = {};
      }
    }

    const { name, value, rating, path } = body;

    // Validate required fields
    if (!name || typeof value !== 'number' || !Number.isFinite(value) || value < 0 || !rating) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    // Validate metric name
    const validMetrics = ['FCP', 'LCP', 'CLS', 'TTFB', 'FID', 'INP'];
    if (typeof name !== 'string' || !validMetrics.includes(name)) {
      return NextResponse.json(
        { success: false, error: 'Invalid metric name' },
        { status: 400 }
      );
    }

    // Validate rating
    const validRatings = ['good', 'needs-improvement', 'poor'];
    if (typeof rating !== 'string' || !validRatings.includes(rating)) {
      return NextResponse.json(
        { success: false, error: 'Invalid rating' },
        { status: 400 }
      );
    }

    // Optional user session context
    let userId: string | undefined = undefined;
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      userId = session?.user?.id;
    } catch {
      // Unauthenticated / guest metric
    }

    // Non-blocking asynchronous recording so response to client browser beacon is instantaneous
    void trackWebVitals({
      name: name as 'FCP' | 'LCP' | 'CLS' | 'TTFB' | 'FID' | 'INP',
      value,
      rating: rating as 'good' | 'needs-improvement' | 'poor',
      path: typeof path === 'string' ? path.slice(0, 300) : undefined,
      userId,
    }).catch((err) => {
      console.error('[Analytics API] Non-blocking Web Vitals recording error:', err);
    });

    return NextResponse.json({ success: true, metric: name }, { status: 200 });
  } catch (error) {
    console.error('[Analytics API] Error tracking web vitals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track web vitals' },
      { status: 500 }
    );
  }
}
