// =============================================================================
// Brands and Categories API Endpoint
// =============================================================================
// GET /api/products/brands-categories
// Returns distinct brands and categories for filter dropdowns
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getBrandsAndCategories } from '@cms/shared';

// =============================================================================
// Route Handler
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    // Get tenant ID from header (set by middleware)
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Tenant ID not found',
        },
        { status: 401 }
      );
    }

    // Fetch brands and categories
    const data = await getBrandsAndCategories(tenantId);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Brands/categories fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch brands and categories',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
