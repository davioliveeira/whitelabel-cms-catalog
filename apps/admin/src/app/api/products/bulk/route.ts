// =============================================================================
// Bulk Product Update API Endpoint
// =============================================================================
// PATCH /api/products/bulk
// Handles bulk updates for product availability
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { bulkUpdateAvailability } from '@cms/shared';

// =============================================================================
// Validation Schema
// =============================================================================

const BulkUpdateSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1, 'At least one product ID is required'),
  isAvailable: z.boolean(),
});

// =============================================================================
// Route Handler
// =============================================================================

export async function PATCH(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    const validation = BulkUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Invalid request data',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { productIds, isAvailable } = validation.data;

    // Update products with tenant isolation
    const updatedCount = await bulkUpdateAvailability(
      tenantId,
      productIds,
      isAvailable
    );

    return NextResponse.json(
      {
        success: true,
        updated: updatedCount,
        message: `Successfully updated ${updatedCount} product(s)`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Bulk update error:', error);
    return NextResponse.json(
      {
        error: 'Bulk update failed',
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
