// =============================================================================
// Recent Events Analytics API
// =============================================================================
// GET /api/analytics/recent-events - Get recent analytics events
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getRecentEvents } from '@cms/shared';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const events = await getRecentEvents(session.user.storeId || '', { limit });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Recent events error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent events' },
      { status: 500 }
    );
  }
}
