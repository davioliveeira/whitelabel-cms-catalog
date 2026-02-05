// =============================================================================
// Theme Service for Catalog
// =============================================================================
// Functions to fetch tenant and theme data for server-side rendering.
// =============================================================================

import { findTenantBySlug } from '@cms/shared';
import { DEFAULT_THEME, type ThemeConfig } from '@cms/theme-engine';
import type { TenantData } from './tenant-context';

/**
 * Get full tenant data by slug.
 * Returns null if tenant not found.
 * 
 * @param slug - Tenant slug
 * @returns Full tenant data including WhatsApp numbers
 */
export async function getTenantBySlug(slug: string): Promise<TenantData | null> {
  try {
    const tenant = await findTenantBySlug(slug);

    if (!tenant || !tenant.isActive) {
      return null;
    }

    return {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      logoUrl: tenant.logoUrl,
      primaryColor: tenant.primaryColor,
      secondaryColor: tenant.secondaryColor,
      borderRadius: tenant.borderRadius,
      whatsappPrimary: tenant.whatsappPrimary,
      whatsappSecondary: tenant.whatsappSecondary,
      isActive: tenant.isActive,
      catalogConfig: tenant.catalogConfig,
    };
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return null;
  }
}

/**
 * Get theme configuration by tenant slug.
 * Returns null if tenant not found.
 * 
 * @param slug - Tenant slug
 * @returns Theme configuration
 */
export async function getThemeBySlug(slug: string): Promise<ThemeConfig | null> {
  const tenant = await getTenantBySlug(slug);

  if (!tenant) {
    return null;
  }

  return {
    primaryColor: tenant.primaryColor,
    secondaryColor: tenant.secondaryColor,
    borderRadius: tenant.borderRadius,
    logoUrl: tenant.logoUrl,
    name: tenant.name,
    slug: tenant.slug,
  };
}

/**
 * Get theme configuration with fallback to defaults.
 * 
 * @param slug - Tenant slug
 * @returns Theme configuration (never null)
 */
export async function getThemeBySlugOrDefault(slug: string): Promise<ThemeConfig> {
  const theme = await getThemeBySlug(slug);
  return theme ?? DEFAULT_THEME;
}
