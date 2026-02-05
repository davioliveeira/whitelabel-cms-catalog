// =============================================================================
// Default Theme Constants
// =============================================================================
// Fallback theme values when tenant has not configured their brand.
// =============================================================================

import type { ThemeConfig } from '../types/theme.types';

/**
 * Default theme configuration.
 * Used as fallback when tenant settings are not available.
 */
export const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#0f172a',
  secondaryColor: '#64748b',
  borderRadius: '0.5rem',
  logoUrl: null,
  name: 'Catálogo',
  slug: '',
};

/**
 * Default CSS variable values.
 */
export const DEFAULT_CSS_VARIABLES = {
  '--primary': DEFAULT_THEME.primaryColor,
  '--secondary': DEFAULT_THEME.secondaryColor,
  '--radius': DEFAULT_THEME.borderRadius,
} as const;
