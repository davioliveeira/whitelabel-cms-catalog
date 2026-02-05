// =============================================================================
// Admin Stats API
// =============================================================================
// Endpoint for SUPER_ADMIN to get system-wide statistics
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Get system-wide statistics (SUPER_ADMIN only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Super Admin access required' },
        { status: 403 }
      );
    }

    // Get current date and 7 days ago for recent activity
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch all stats in parallel
    const [
      totalStores,
      activeStores,
      totalProducts,
      newStores,
      newProducts,
      distinctBrands,
      distinctCategories,
    ] = await Promise.all([
      // Total stores
      prisma.tenant.count(),

      // Active stores
      prisma.tenant.count({
        where: { isActive: true },
      }),

      // Total products
      prisma.product.count(),

      // New stores in last 7 days
      prisma.tenant.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),

      // New products in last 7 days
      prisma.product.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),

      // Count distinct brands (using groupBy)
      prisma.product.groupBy({
        by: ['brand'],
        where: {
          brand: { not: null },
        },
      }),

      // Count distinct categories (using groupBy)
      prisma.product.groupBy({
        by: ['category'],
        where: {
          category: { not: null },
        },
      }),
    ]);

    return NextResponse.json({
      totalStores,
      activeStores,
      totalUsers: totalStores, // Each store has one user
      totalProducts,
      totalCategories: distinctCategories.length,
      totalBrands: distinctBrands.length,
      recentActivity: {
        newStores,
        newProducts,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
