// =============================================================================
// Theme Engine Exports
// =============================================================================
// Public API for the Theme Engine library.
// =============================================================================

// Types
export type { ThemeConfig, CSSVariables, ThemeApiResponse } from './types/theme.types';

// Constants
export { DEFAULT_THEME, DEFAULT_CSS_VARIABLES } from './constants/default-theme';

// Utilities
export {
  isValidHexColor,
  sanitizeColor,
  themeToCSSVariables,
  cssVariablesToString,
  generateRootCSS,
  themeToStyleObject,
} from './utils/css-variables';

// Components
export { ThemeStyle } from './components/ThemeStyle';
export { ThemeProvider, useTheme } from './components/ThemeProvider';
