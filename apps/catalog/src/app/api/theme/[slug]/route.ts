// =============================================================================
// Theme API Route
// =============================================================================
// GET /api/theme/[slug] - Get theme by tenant slug
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { findTenantBySlug } from '@cms/shared';
import type { ThemeApiResponse, ThemeConfig } from '@cms/theme-engine';

// =============================================================================
// GET Handler
// =============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<ThemeApiResponse>> {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_SLUG',
            message: 'Slug é obrigatório',
          },
        },
        { status: 400 }
      );
    }

    const tenant = await findTenantBySlug(slug);

    if (!tenant) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TENANT_NOT_FOUND',
            message: `Loja não encontrada: ${slug}`,
          },
        },
        { status: 404 }
      );
    }

    // Use catalogConfig if available, otherwise fall back to legacy fields
    const catalogConfig = tenant.catalogConfig as any;

    const theme: ThemeConfig = catalogConfig && Object.keys(catalogConfig).length > 0
      ? {
        // Use catalogConfig as primary source
        ...catalogConfig,
        // Add store metadata
        name: tenant.name,
        slug: tenant.slug,
        logoUrl: tenant.logoUrl,
      }
      : {
        // Fallback to legacy fields for backward compatibility
        colors: {
          primary: tenant.primaryColor || '#0f172a',
          secondary: tenant.secondaryColor || '#64748b',
          background: '#ffffff',
          cardBackground: '#ffffff',
          textPrimary: '#020817',
          textSecondary: '#64748b',
        },
        typography: {
          fontHeading: 'Inter',
          fontBody: 'Inter',
          borderRadius: tenant.borderRadius || '0.5rem',
          buttonStyle: 'filled' as const,
        },
        header: {
          style: 'simple' as const,
          backgroundColor: '#ffffff',
          textColor: '#020817',
          showSearch: true,
          showPromo: true,
          menuPosition: 'center' as const,
          height: 'normal' as const,
          shadow: true,
        },
        banner: {
          isActive: false,
          type: 'image' as const,
          images: [],
          textPosition: 'center' as const,
          overlayOpacity: 50,
          height: 'medium' as const,
          autoplay: true,
          textColor: '#ffffff',
        },
        name: tenant.name,
        slug: tenant.slug,
        logoUrl: tenant.logoUrl,
      };

    // Set cache headers for performance
    // Short TTL with revalidation to balance freshness and performance
    const response = NextResponse.json(
      {
        success: true,
        data: theme,
      },
      { status: 200 }
    );

    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    );

    return response;
  } catch (error) {
    console.error('Theme API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao buscar tema',
        },
      },
      { status: 500 }
    );
  }
}
