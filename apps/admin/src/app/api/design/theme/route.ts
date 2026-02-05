// =============================================================================
// Theme API - Design Playground Theme Configuration
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';
import { ThemeConfigSchema } from '@cms/shared';

const prisma = new PrismaClient();

// GET - Fetch current theme configuration
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const store = await prisma.store.findUnique({
      where: { id: session.user.storeId! },
      select: { catalogConfig: true },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      config: store.catalogConfig || {},
    });
  } catch (error) {
    console.error('Theme fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch theme configuration' },
      { status: 500 }
    );
  }
}

// PUT - Save theme configuration
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json(
        { error: 'config is required' },
        { status: 400 }
      );
    }

    // Validate the config against the schema
    const validationResult = ThemeConfigSchema.safeParse(config);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid theme configuration',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    // Update store with new theme configuration
    const store = await prisma.store.update({
      where: { id: session.user.storeId! },
      data: {
        catalogConfig: config,
        // Update legacy color fields for backward compatibility
        primaryColor: config.colors?.primary || undefined,
        secondaryColor: config.colors?.secondary || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      config: store.catalogConfig,
    });
  } catch (error) {
    console.error('Theme save error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to save theme';

    return NextResponse.json(
      {
        error: 'Failed to save theme configuration',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
