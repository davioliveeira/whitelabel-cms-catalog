// =============================================================================
// Admin Stores API - Platform overview (Super Admin only)
// =============================================================================
// GET /api/admin/stores - List all stores with metrics
// POST /api/admin/stores - Create new store
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, EventType } from '@prisma/client';
import { auth } from '@/auth';

const prisma = new PrismaClient();

// =============================================================================
// GET - List all stores with products count and analytics (last 30 days)
// =============================================================================
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Super Admin access required' },
        { status: 403 }
      );
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch stores with products count and users
    const stores = await prisma.store.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        onboardingComplete: true,
        createdAt: true,
        logoUrl: true,
        primaryColor: true,
        whatsappPrimary: true,
        _count: {
          select: { products: true, users: true },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch analytics counts per store (last 30 days) - single groupBy query
    const analyticsByStore = await prisma.analyticsEvent.groupBy({
      by: ['storeId', 'eventType'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
          lte: new Date(),
        },
      },
      _count: { id: true },
    });

    // Build analytics map: storeId -> { views, whatsappClicks }
    const analyticsMap = new Map<
      string,
      { views: number; whatsappClicks: number }
    >();

    for (const row of analyticsByStore) {
      const current = analyticsMap.get(row.storeId) ?? {
        views: 0,
        whatsappClicks: 0,
      };
      if (row.eventType === EventType.VIEW) {
        current.views = row._count.id;
      } else {
        current.whatsappClicks = row._count.id;
      }
      analyticsMap.set(row.storeId, current);
    }

    // Merge store data with analytics
    const storesWithAnalytics = stores.map((s) => {
      const analytics = analyticsMap.get(s.id) ?? {
        views: 0,
        whatsappClicks: 0,
      };
      return {
        id: s.id,
        name: s.name,
        slug: s.slug,
        isActive: s.isActive,
        onboardingComplete: s.onboardingComplete,
        createdAt: s.createdAt.toISOString(),
        logoUrl: s.logoUrl,
        primaryColor: s.primaryColor,
        whatsappPrimary: s.whatsappPrimary,
        productsCount: s._count.products,
        usersCount: s._count.users,
        users: s.users,
        analytics: {
          views: analytics.views,
          whatsappClicks: analytics.whatsappClicks,
        },
      };
    });

    return NextResponse.json({ stores: storesWithAnalytics }, { status: 200 });
  } catch (error) {
    console.error('Stores list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST - Create new store (SUPER_ADMIN only)
// =============================================================================
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Super Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, slug, whatsappPrimary } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields: name, slug' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.store.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Slug já está em uso' },
        { status: 400 }
      );
    }

    // Create store
    const store = await prisma.store.create({
      data: {
        name,
        slug,
        whatsappPrimary: whatsappPrimary || null,
        isActive: true,
        onboardingComplete: false,
      },
    });

    return NextResponse.json(
      {
        id: store.id,
        name: store.name,
        slug: store.slug,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Store creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create store' },
      { status: 500 }
    );
  }
}
