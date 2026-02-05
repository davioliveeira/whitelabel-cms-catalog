// =============================================================================
// Brand Settings API Route
// =============================================================================
// GET /api/tenant/brand - Get current brand settings
// PATCH /api/tenant/brand - Update brand settings
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import {
  BrandConfigSchema,
  getBrandSettings,
  updateBrandSettings,
  TenantNotFoundError,
  type ApiResponse,
  type BrandSettingsData,
} from '@cms/shared';

// =============================================================================
// Temporary: Get tenant ID from query param (until auth is implemented)
// In production, this would come from the authenticated session
// =============================================================================

function getTenantId(request: NextRequest): string | null {
  const url = new URL(request.url);
  return url.searchParams.get('tenantId');
}

// =============================================================================
// GET Handler - Get current brand settings
// =============================================================================

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<BrandSettingsData>>> {
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

    const settings = await getBrandSettings(tenantId);

    return NextResponse.json({
      success: true,
      data: settings,
    });
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

    console.error('Get brand settings error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao buscar configurações de marca',
        },
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// PATCH Handler - Update brand settings
// =============================================================================

export async function PATCH(
  request: NextRequest
): Promise<NextResponse<ApiResponse<BrandSettingsData>>> {
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

    const body = await request.json();
    const validatedData = BrandConfigSchema.parse(body);

    const settings = await updateBrandSettings(tenantId, validatedData);

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados de marca inválidos',
            details: error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

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

    console.error('Update brand settings error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao atualizar configurações de marca',
        },
      },
      { status: 500 }
    );
  }
}
