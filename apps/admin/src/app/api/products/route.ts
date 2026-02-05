// =============================================================================
// Products API - List and Create
// =============================================================================
// GET  /api/products - List products (with filters)
// POST /api/products - Create new product
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  getProductsByTenant,
  createProduct,
  ProductCreateSchema,
} from '@cms/shared';
import { auth } from '@/auth';

// =============================================================================
// GET - List products
// =============================================================================
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const storeId = session.user.storeId;

    if (!storeId) {
      return NextResponse.json(
        { error: 'Store not found for user' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const brand = searchParams.get('brand') || undefined;
    const category = searchParams.get('category') || undefined;
    const isAvailable = searchParams.get('isAvailable') === 'true' ? true :
                        searchParams.get('isAvailable') === 'false' ? false : undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await getProductsByTenant(storeId, {
      search,
      brand,
      category,
      isAvailable,
      page,
      limit,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Products list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST - Create product
// =============================================================================
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const storeId = session.user.storeId;

    if (!storeId) {
      return NextResponse.json(
        { error: 'Store not found for user' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = ProductCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const product = await createProduct(storeId, validation.data);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
