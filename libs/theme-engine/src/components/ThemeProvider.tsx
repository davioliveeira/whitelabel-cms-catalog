'use client';

// =============================================================================
// ThemeProvider Component (Client)
// =============================================================================
// Client-side theme provider with context for dynamic updates.
// Use ThemeStyle for SSR-only scenarios.
// =============================================================================

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { ThemeConfig } from '../types/theme.types';
import { DEFAULT_THEME } from '../constants/default-theme';
import { themeToStyleObject } from '../utils/css-variables';

// =============================================================================
// Context
// =============================================================================

interface ThemeContextValue {
  theme: ThemeConfig;
  cssVariables: Record<string, string>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to access the current theme.
 * @returns Theme context value
 * @throws Error if used outside ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// =============================================================================
// Provider
// =============================================================================

interface ThemeProviderProps {
  /** Theme configuration */
  theme: Partial<ThemeConfig>;
  /** Child components */
  children: ReactNode;
}

/**
 * ThemeProvider component.
 * Provides theme context and injects CSS variables via inline styles.
 * 
 * @example
 * ```tsx
 * <ThemeProvider theme={{ primaryColor: '#dc2626' }}>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const mergedTheme: ThemeConfig = useMemo(
    () => ({
      ...DEFAULT_THEME,
      ...theme,
    }),
    [theme]
  );

  const cssVariables = useMemo(
    () => themeToStyleObject(mergedTheme),
    [mergedTheme]
  );

  const contextValue = useMemo(
    () => ({ theme: mergedTheme, cssVariables }),
    [mergedTheme, cssVariables]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <div style={cssVariables} className="contents">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
