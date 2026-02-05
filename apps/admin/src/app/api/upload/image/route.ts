// =============================================================================
// Image Upload API Route
// =============================================================================
// Handles product image uploads with validation and optimization
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { optimizeImage } from '@/lib/image-optimizer';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { auth } from '@/auth';

// =============================================================================
// Constants
// =============================================================================

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// =============================================================================
// POST /api/upload/image
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // 1. Get session for tenant ID
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'No tenant context found',
        },
        { status: 401 }
      );
    }

    const tenantId = session.user.storeId || 'system';

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          error: 'No file provided',
          message: 'Please select an image to upload',
        },
        { status: 400 }
      );
    }

    // 3. Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type',
          message: 'Only JPG, PNG, WebP allowed',
          allowedTypes: ALLOWED_TYPES,
        },
        { status: 400 }
      );
    }

    // 4. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'File too large',
          message: 'Image must be smaller than 5MB',
          maxSize: MAX_FILE_SIZE,
          actualSize: file.size,
        },
        { status: 400 }
      );
    }

    // 5. Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6. Optimize image (resize + WebP conversion)
    const optimized = await optimizeImage(buffer);

    // 7. Generate unique filename with tenant isolation
    const timestamp = Date.now();
    const uuid = crypto.randomUUID().split('-')[0];
    const filename = `${tenantId}_${timestamp}_${uuid}.webp`;

    // 8. Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public/uploads/products');

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 9. Save optimized image to storage (Admin)
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, optimized.buffer);

    // 9b. Sync to Catalog public directory (Local Dev Fix)
    // Assuming cwd is apps/admin or similar, try to reach apps/catalog
    try {
      const catalogDir = path.join(process.cwd(), '../catalog/public/uploads/products');
      if (!existsSync(catalogDir)) {
        await mkdir(catalogDir, { recursive: true });
      }
      await writeFile(path.join(catalogDir, filename), optimized.buffer);
    } catch (err) {
      console.warn('Failed to sync image to catalog:', err);
      // Don't fail the request, just warn
    }

    // 10. Return success response with public URL
    return NextResponse.json(
      {
        url: `/uploads/products/${filename}`,
        filename,
        size: optimized.size,
        dimensions: {
          width: optimized.width,
          height: optimized.height,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Image upload error:', error);

    return NextResponse.json(
      {
        error: 'Upload failed',
        message: 'An error occurred while uploading the image',
      },
      { status: 500 }
    );
  }
}
