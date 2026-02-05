// =============================================================================
// Tenant Context Types
// =============================================================================
// Type definitions for tenant context.
// =============================================================================

/**
 * Full tenant data available in context.
 */
export interface TenantData {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  borderRadius: string;
  whatsappPrimary: string | null;
  whatsappSecondary: string | null;
  isActive: boolean;
  catalogConfig?: any; // ThemeConfig type can be imported if needed, but any is safe for context
}

/**
 * Tenant context value interface.
 */
export interface TenantContextValue {
  tenant: TenantData | null;
}
