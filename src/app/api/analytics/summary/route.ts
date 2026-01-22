import { NextRequest, NextResponse } from 'next/server';
import { getUserAnalytics } from '@/lib/analytics';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get current user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      // Return empty analytics for non-authenticated users
      return NextResponse.json({
        period: '30 days',
        searches: 0,
        savedOffers: 0,
        projects: 0,
        apiCallsUsed: 0,
      });
    }

    // Get analytics from database
    const analytics = await getUserAnalytics(session.user.id, 30);

    if (!analytics) {
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      );
    }

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('[Analytics API] Error fetching summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
