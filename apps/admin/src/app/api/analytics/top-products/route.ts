// =============================================================================
// Top Products Analytics API
// =============================================================================
// GET /api/analytics/top-products - Get product performance metrics
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getProductPerformance } from '@cms/shared';
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

    const products = await getProductPerformance(session.user.storeId || '', {
      start: new Date(startDate),
      end: new Date(endDate),
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Top products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top products' },
      { status: 500 }
    );
  }
}
