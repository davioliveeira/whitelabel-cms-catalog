// =============================================================================
// ThemeStyle Component
// =============================================================================
// Injects CSS variables into the document via a <style> tag.
// Can be used in Server Components for SSR support.
// =============================================================================

import type { ThemeConfig } from '../types/theme.types';
import { generateRootCSS } from '../utils/css-variables';

interface ThemeStyleProps {
  /** Theme configuration */
  theme: Partial<ThemeConfig>;
}

/**
 * ThemeStyle component.
 * Renders a <style> tag with CSS variables for the theme.
 * This is a Server Component compatible approach.
 * 
 * @example
 * ```tsx
 * // In your layout.tsx
 * <ThemeStyle theme={{ primaryColor: '#dc2626', secondaryColor: '#facc15', borderRadius: '1rem' }} />
 * ```
 */
export function ThemeStyle({ theme }: ThemeStyleProps) {
  const css = generateRootCSS(theme);

  return (
    <style
      id="theme-variables"
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}

export default ThemeStyle;
