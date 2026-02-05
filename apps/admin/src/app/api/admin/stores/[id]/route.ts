
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { auth } from '@/auth';

const prisma = new PrismaClient();

// Validation schema for updating stores
const UpdateStoreSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
  whatsappPrimary: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

// =============================================================================
// GET - Get store details
// =============================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Store not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ store }, { status: 200 });
  } catch (error) {
    console.error('Store details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch store details' },
      { status: 500 }
    );
  }
}

// =============================================================================
// PATCH - Update store
// =============================================================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const validation = UpdateStoreSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { name, slug, whatsappPrimary } = validation.data;

    // Check if store exists
    const existingStore = await prisma.store.findUnique({
      where: { id },
    });

    if (!existingStore) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Store not found' },
        { status: 404 }
      );
    }

    // Check slug uniqueness if changed
    if (slug && slug !== existingStore.slug) {
      const slugExists = await prisma.store.findUnique({
        where: { slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 409 }
        );
      }
    }

    const updatedStore = await prisma.store.update({
      where: { id },
      data: {
        name,
        slug,
        whatsappPrimary,
      },
    });

    return NextResponse.json({ store: updatedStore }, { status: 200 });
  } catch (error) {
    console.error('Store update error:', error);
    return NextResponse.json(
      { error: 'Failed to update store' },
      { status: 500 }
    );
  }
}

// =============================================================================
// DELETE - Delete store
// =============================================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Check if store exists
    const existingStore = await prisma.store.findUnique({
      where: { id },
    });

    if (!existingStore) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Store not found' },
        { status: 404 }
      );
    }

    // Delete store
    await prisma.store.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Store deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Store delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete store' },
      { status: 500 }
    );
  }
}
