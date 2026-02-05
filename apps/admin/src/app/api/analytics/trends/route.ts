// =============================================================================
// Analytics Trends API
// =============================================================================
// GET /api/analytics/trends - Get daily analytics trends
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getDailyTrends } from '@cms/shared';
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const trends = await getDailyTrends(session.user.storeId || '', {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return NextResponse.json(trends);
  } catch (error) {
    console.error('Analytics trends error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics trends' },
      { status: 500 }
    );
  }
}
