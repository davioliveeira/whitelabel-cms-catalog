// =============================================================================
// Logo Upload API Route
// =============================================================================
// POST /api/tenant/logo - Upload logo image
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import {
  updateTenantLogo,
  TenantNotFoundError,
  type ApiResponse,
} from '@cms/shared';

// =============================================================================
// Constants
// =============================================================================

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

// =============================================================================
// Temporary: Get tenant ID from query param (until auth is implemented)
// =============================================================================

function getTenantId(request: NextRequest): string | null {
  const url = new URL(request.url);
  return url.searchParams.get('tenantId');
}

// =============================================================================
// POST Handler - Upload logo
// =============================================================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ logoUrl: string }>>> {
  try {
    const tenantId = getTenantId(request);

    if (!tenantId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_TENANT_ID',
            message: 'ID do tenant é obrigatório',
          },
        },
        { status: 400 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_FILE',
            message: 'Nenhum arquivo enviado',
          },
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: 'Tipo de arquivo não permitido. Use PNG ou JPG.',
          },
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'Arquivo muito grande. Máximo 2MB.',
          },
        },
        { status: 400 }
      );
    }

    // Get file extension
    const extension = file.type === 'image/png' ? 'png' : 'jpg';
    const filename = `logo.${extension}`;

    // Create upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', tenantId);
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const filepath = join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Generate public URL
    const logoUrl = `/uploads/${tenantId}/${filename}`;

    // Update tenant record
    await updateTenantLogo(tenantId, logoUrl);

    return NextResponse.json(
      {
        success: true,
        data: { logoUrl },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof TenantNotFoundError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: 404 }
      );
    }

    console.error('Logo upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao fazer upload do logo',
        },
      },
      { status: 500 }
    );
  }
}
