// =============================================================================
// Settings API - Tenant Configuration
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { findTenantById, updateBrandSettings, updateWhatsAppSettings } from '@cms/shared';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Get tenant settings
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    console.log('Settings API - Session:', session?.user);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Settings API - Fetching tenant:', session.user.storeId);
    const tenant = await findTenantById(session.user.storeId || '');
    console.log('Settings API - Tenant found:', tenant ? 'yes' : 'no');

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json({
      name: tenant.name,
      slug: tenant.slug,
      logoUrl: tenant.logoUrl,
      whatsappPrimary: tenant.whatsappPrimary,
      whatsappSecondary: tenant.whatsappSecondary,
      primaryColor: tenant.primaryColor,
      secondaryColor: tenant.secondaryColor,
      borderRadius: tenant.borderRadius,
      catalogConfig: tenant.catalogConfig,
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT - Update tenant settings
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const tenantId = session.user.storeId;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID missing in session' }, { status: 400 });
    }

    // Update brand settings if provided
    if (body.logoUrl !== undefined || body.primaryColor || body.secondaryColor || body.borderRadius !== undefined) {
      await updateBrandSettings(tenantId, {
        logoUrl: body.logoUrl,
        primaryColor: body.primaryColor,
        secondaryColor: body.secondaryColor,
        borderRadius: body.borderRadius,
      });

      // Sync appearance changes to catalogConfig
      if (body.primaryColor || body.secondaryColor || body.borderRadius !== undefined) {
        const store = await prisma.store.findUnique({
          where: { id: tenantId },
          select: { catalogConfig: true },
        });

        const currentConfig = (store?.catalogConfig as any) || {};
        const updatedConfig = {
          ...currentConfig,
          colors: {
            ...(currentConfig.colors || {}),
            ...(body.primaryColor && { primary: body.primaryColor }),
            ...(body.secondaryColor && { secondary: body.secondaryColor }),
          },
          typography: {
            ...(currentConfig.typography || {}),
            ...(body.borderRadius !== undefined && {
              borderRadius: `${body.borderRadius}px`
            }),
          },
        };

        await prisma.store.update({
          where: { id: tenantId },
          data: { catalogConfig: updatedConfig },
        });
      }
    }

    // Update WhatsApp settings if provided
    if (body.whatsappPrimary !== undefined || body.whatsappSecondary !== undefined) {
      await updateWhatsAppSettings(tenantId, {
        whatsappPrimary: body.whatsappPrimary,
        whatsappSecondary: body.whatsappSecondary,
      });
    }

    const updated = await findTenantById(tenantId);
    return NextResponse.json({
      name: updated?.name,
      slug: updated?.slug,
      logoUrl: updated?.logoUrl,
      whatsappPrimary: updated?.whatsappPrimary,
      whatsappSecondary: updated?.whatsappSecondary,
      primaryColor: updated?.primaryColor,
      secondaryColor: updated?.secondaryColor,
      borderRadius: updated?.borderRadius,
    });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
