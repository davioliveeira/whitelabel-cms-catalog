// =============================================================================
// WhatsApp Settings API Route
// =============================================================================
// GET /api/tenant/whatsapp - Get current WhatsApp settings
// PATCH /api/tenant/whatsapp - Update WhatsApp numbers
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import {
  WhatsAppConfigSchema,
  getWhatsAppSettings,
  updateWhatsAppSettings,
  TenantNotFoundError,
  type WhatsAppSettingsData,
} from '@cms/shared';

// =============================================================================
// Types
// =============================================================================

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};

// =============================================================================
// Temporary: Get tenant ID from query param (until auth is implemented)
// In production, this would come from the authenticated session
// =============================================================================

function getTenantId(request: NextRequest): string | null {
  const url = new URL(request.url);
  return url.searchParams.get('tenantId');
}

// =============================================================================
// GET Handler - Get current WhatsApp settings
// =============================================================================

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<WhatsAppSettingsData>>> {
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

    const settings = await getWhatsAppSettings(tenantId);

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

    console.error('Get WhatsApp settings error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao buscar configurações de WhatsApp',
        },
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// PATCH Handler - Update WhatsApp settings
// =============================================================================

export async function PATCH(
  request: NextRequest
): Promise<NextResponse<ApiResponse<WhatsAppSettingsData>>> {
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
    const validatedData = WhatsAppConfigSchema.parse(body);

    const settings = await updateWhatsAppSettings(tenantId, validatedData);

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
            message: 'Número de WhatsApp inválido',
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

    console.error('Update WhatsApp settings error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao atualizar configurações de WhatsApp',
        },
      },
      { status: 500 }
    );
  }
}
