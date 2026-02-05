// =============================================================================
// Analytics Summary API
// =============================================================================
// GET /api/analytics/summary - Get analytics summary (views, clicks, conversion)
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { countEvents } from '@cms/shared';
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

    const data = await countEvents(session.user.storeId || '', {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    // Calculate conversion rate
    const conversionRate = data.views > 0 ? (data.whatsappClicks / data.views) * 100 : 0;

    return NextResponse.json({
      ...data,
      conversionRate: Math.round(conversionRate * 10) / 10,
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics summary' },
      { status: 500 }
    );
  }
}
