// =============================================================================
// Registration API Route
// =============================================================================
// POST /api/auth/register
// Creates a new tenant with the provided store name, email, and password.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import {
  RegisterTenantSchema,
  createTenant,
  TenantEmailExistsError,
  type ApiResponse,
  type TenantPublicData,
} from '@cms/shared';

// =============================================================================
// POST Handler
// =============================================================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<TenantPublicData>>> {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = RegisterTenantSchema.parse(body);

    // Create tenant
    const tenant = await createTenant({
      storeName: validatedData.storeName,
      email: validatedData.email,
      password: validatedData.password,
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: tenant,
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados de registro inválidos',
            details: error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    // Handle duplicate email error
    if (error instanceof TenantEmailExistsError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: 409 }
      );
    }

    // Handle unexpected errors
    console.error('Registration error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao criar conta. Tente novamente mais tarde.',
        },
      },
      { status: 500 }
    );
  }
}
