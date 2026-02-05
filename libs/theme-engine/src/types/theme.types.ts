// =============================================================================
// Theme Types
// =============================================================================
// Type definitions for the Theme Engine.
// =============================================================================

/**
 * Theme configuration interface.
 * Represents the brand identity settings for a tenant.
 */
export interface ThemeConfig {
  /** Primary brand color in hex format (#RRGGBB) */
  primaryColor: string;
  /** Secondary brand color in hex format (#RRGGBB) */
  secondaryColor: string;
  /** Border radius CSS value (e.g., 0rem, 0.5rem, 1rem, 9999px) */
  borderRadius: string;
  /** Optional logo URL */
  logoUrl?: string | null;
  /** Store name for display */
  name?: string;
  /** Store slug for routing */
  slug?: string;
}

/**
 * CSS variables object type.
 */
export type CSSVariables = {
  '--primary': string;
  '--secondary': string;
  '--radius': string;
  '--logo-url'?: string;
};

/**
 * Theme API response type.
 */
export interface ThemeApiResponse {
  success: boolean;
  data?: ThemeConfig;
  error?: {
    code: string;
    message: string;
  };
}
