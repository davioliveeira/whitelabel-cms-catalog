// =============================================================================
// Customize API - Catalog Customization
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT - Update catalog customization
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { catalogConfig } = body;

    if (!catalogConfig) {
      return NextResponse.json(
        { error: 'catalogConfig is required' },
        { status: 400 }
      );
    }

    if (!session.user.storeId) {
      return NextResponse.json({ error: 'Store context required' }, { status: 400 });
    }

    // Update tenant with new catalog configuration
    const tenant = await prisma.store.update({
      where: { id: session.user.storeId },
      data: {
        catalogConfig: catalogConfig,
        // Also update legacy color fields for backward compatibility
        primaryColor: catalogConfig.colors?.primary || undefined,
        secondaryColor: catalogConfig.colors?.secondary || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      catalogConfig: tenant.catalogConfig,
    });
  } catch (error) {
    console.error('Customize update error:', error);

    // Return more detailed error info
    const errorMessage = error instanceof Error ? error.message : 'Failed to update customization';

    return NextResponse.json(
      {
        error: 'Failed to update customization',
        details: errorMessage,
        hint: 'Execute: npx prisma migrate dev --name add-catalog-config'
      },
      { status: 500 }
    );
  }
}
