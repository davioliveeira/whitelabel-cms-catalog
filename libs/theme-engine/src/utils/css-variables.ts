// =============================================================================
// CSS Variables Utilities
// =============================================================================
// Functions to convert theme config to CSS variables.
// =============================================================================

import type { ThemeConfig, CSSVariables } from '../types/theme.types';
import { DEFAULT_THEME } from '../constants/default-theme';

/**
 * Validate hex color format.
 * @param color - Color string to validate
 * @returns True if valid hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Sanitize color value, returning default if invalid.
 * @param color - Color to sanitize
 * @param defaultColor - Fallback color
 * @returns Valid hex color
 */
export function sanitizeColor(color: string | undefined | null, defaultColor: string): string {
  if (!color || !isValidHexColor(color)) {
    return defaultColor;
  }
  return color;
}

/**
 * Convert theme config to CSS variables object.
 * @param theme - Theme configuration (partial allowed)
 * @returns CSS variables object
 */
export function themeToCSSVariables(theme: Partial<ThemeConfig> = {}): CSSVariables {
  const variables: CSSVariables = {
    '--primary': sanitizeColor(theme.primaryColor, DEFAULT_THEME.primaryColor),
    '--secondary': sanitizeColor(theme.secondaryColor, DEFAULT_THEME.secondaryColor),
    '--radius': theme.borderRadius || DEFAULT_THEME.borderRadius,
  };

  if (theme.logoUrl) {
    variables['--logo-url'] = `url(${theme.logoUrl})`;
  }

  return variables;
}

/**
 * Convert CSS variables object to inline style string.
 * @param variables - CSS variables object
 * @returns CSS string for style attribute or style tag
 */
export function cssVariablesToString(variables: CSSVariables): string {
  return Object.entries(variables)
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ');
}

/**
 * Generate :root CSS rule string.
 * @param theme - Theme configuration
 * @returns CSS rule string
 */
export function generateRootCSS(theme: Partial<ThemeConfig> = {}): string {
  const variables = themeToCSSVariables(theme);
  const cssString = cssVariablesToString(variables);
  return `:root { ${cssString} }`;
}

/**
 * Convert CSS variables to React inline style object.
 * @param theme - Theme configuration
 * @returns React CSSProperties compatible object
 */
export function themeToStyleObject(theme: Partial<ThemeConfig> = {}): Record<string, string> {
  const variables = themeToCSSVariables(theme);
  return variables as Record<string, string>;
}
