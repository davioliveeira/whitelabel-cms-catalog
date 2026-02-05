// =============================================================================
// Users API - List and Create (Super Admin only)
// =============================================================================
// GET  /api/users - List all users
// POST /api/users - Create new user
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { auth } from '@/auth';
import { hashPassword } from '@cms/shared';

const prisma = new PrismaClient();

// Validation schema for creating users
const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  storeId: z.string().uuid().optional(),
  role: z.enum(['SUPER_ADMIN', 'STORE_OWNER']).default('STORE_OWNER'),
});

// =============================================================================
// GET - List all users
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

    let users;

    // SUPER_ADMIN can see all users
    if (session.user.role === 'SUPER_ADMIN') {
      users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          storeId: true,
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      // STORE_OWNER and ATTENDANT can only see users from their own store
      if (!session.user.storeId) {
        return NextResponse.json(
          { error: 'No store associated with user' },
          { status: 400 }
        );
      }

      users = await prisma.user.findMany({
        where: {
          storeId: session.user.storeId,
          isActive: true, // Only show active users
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          storeId: true,
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    }

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Users list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST - Create new user
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
    const validation = CreateUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { email, password, name, storeId, role } = validation.data;

    // STORE_OWNER requires a store
    if (role === 'STORE_OWNER' && !storeId) {
      return NextResponse.json(
        { error: 'Store is required for STORE_OWNER role' },
        { status: 400 }
      );
    }

    // Verify store exists if storeId is provided
    if (storeId) {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
      });

      if (!store) {
        return NextResponse.json(
          { error: 'Store not found' },
          { status: 404 }
        );
      }
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        storeId: role === 'SUPER_ADMIN' ? null : storeId,
        role,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        storeId: true,
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
