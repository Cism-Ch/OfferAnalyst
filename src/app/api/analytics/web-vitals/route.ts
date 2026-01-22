import { NextRequest, NextResponse } from 'next/server';
import { trackWebVitals } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, value, rating, path } = body;

    // Validate required fields
    if (!name || typeof value !== 'number' || !rating) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate metric name
    const validMetrics = ['FCP', 'LCP', 'CLS', 'TTFB', 'FID', 'INP'];
    if (!validMetrics.includes(name)) {
      return NextResponse.json(
        { success: false, error: 'Invalid metric name' },
        { status: 400 }
      );
    }

    // Validate rating
    const validRatings = ['good', 'needs-improvement', 'poor'];
    if (!validRatings.includes(rating)) {
      return NextResponse.json(
        { success: false, error: 'Invalid rating' },
        { status: 400 }
      );
    }

    // Track the web vitals metric
    await trackWebVitals({
      name,
      value,
      rating,
      path,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Analytics API] Error tracking web vitals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track web vitals' },
      { status: 500 }
    );
  }
}
