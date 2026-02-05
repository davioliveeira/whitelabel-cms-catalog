'use client';

import * as React from 'react';
import { ThemeConfig } from '@cms/shared';

// Default matching the schema defaults
const defaultConfig: ThemeConfig = {
  colors: {
    primary: '#0f172a',
    secondary: '#64748b',
    background: '#ffffff',
    cardBackground: '#ffffff',
    textPrimary: '#020817',
    textSecondary: '#64748b'
  },
  typography: {
    fontHeading: 'Inter',
    fontBody: 'Inter',
    borderRadius: '0.5rem',
    buttonStyle: 'filled'
  },
  header: {
    style: 'simple',
    backgroundColor: '#ffffff',
    textColor: '#020817',
    showSearch: true,
    showPromo: true,
    menuPosition: 'center',
    height: 'normal',
    shadow: true
  },
  banner: {
    isActive: true,
    type: 'image',
    images: [],
    textPosition: 'center',
    overlayOpacity: 50,
    height: 'medium',
    autoplay: true,
    textColor: '#ffffff'
  }
};

const ThemeContext = React.createContext<{
  config: ThemeConfig;
  updateConfig: (newConfig: ThemeConfig) => void;
}>({
  config: defaultConfig,
  updateConfig: () => {},
});

export const useTheme = () => React.useContext(ThemeContext);

export function ThemeProvider({ 
  children,
  initialConfig 
}: { 
  children: React.ReactNode;
  initialConfig?: ThemeConfig;
}) {
  const [config, setConfig] = React.useState<ThemeConfig>(initialConfig || defaultConfig);

  const updateConfig = React.useCallback((newConfig: ThemeConfig) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  // Helper to convert hex to HSL for Tailwind variables
  const setHtmlStyle = (property: string, value: string) => {
    document.documentElement.style.setProperty(property, value);
  };

  const hexToHsl = (hex: string): string => {
    let c = hex.substring(1).split('');
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    const colorInt = parseInt(c.join(''), 16);
    const r = (colorInt >> 16) & 255;
    const g = (colorInt >> 8) & 255;
    const b = colorInt & 255;

    const red = r / 255;
    const green = g / 255;
    const blue = b / 255;

    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case red: h = (green - blue) / d + (green < blue ? 6 : 0); break;
        case green: h = (blue - red) / d + 2; break;
        case blue: h = (red - green) / d + 4; break;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  // Update CSS variables when config changes
  React.useEffect(() => {
    // Colors
    if (config.colors.primary) {
      const hsl = hexToHsl(config.colors.primary);
      setHtmlStyle('--primary', hsl);
      // Fallback for direct consumption
      setHtmlStyle('--color-primary', `hsl(${hsl})`);
    }
    
    if (config.colors.secondary) {
      const hsl = hexToHsl(config.colors.secondary);
      setHtmlStyle('--secondary', hsl);
      setHtmlStyle('--color-secondary', `hsl(${hsl})`);
    }
    
    if (config.colors.background) {
        const bgHsl = hexToHsl(config.colors.background);
        setHtmlStyle('--background', bgHsl);
        setHtmlStyle('--color-background', `hsl(${bgHsl})`);
    }
    
    if (config.colors.cardBackground) {
        const cardHsl = hexToHsl(config.colors.cardBackground);
        setHtmlStyle('--card', cardHsl);
        setHtmlStyle('--color-card', `hsl(${cardHsl})`);
    }
    
    if (config.colors.textPrimary) {
        const textHsl = hexToHsl(config.colors.textPrimary);
        setHtmlStyle('--foreground', textHsl);
        setHtmlStyle('--color-foreground', `hsl(${textHsl})`);
    }
    
    if (config.colors.textSecondary) {
        const mutedHsl = hexToHsl(config.colors.textSecondary);
        setHtmlStyle('--muted-foreground', mutedHsl);
        setHtmlStyle('--color-muted-foreground', `hsl(${mutedHsl})`);
    }
    
    // Typography
    if (config.typography) {
        if (config.typography.borderRadius) {
            setHtmlStyle('--radius', config.typography.borderRadius);
        }
        
        // Helper to load font
        const loadFont = (fontName: string) => {
          if (fontName === 'Inter') return; // Already loaded by Next.js
          
          const fontId = `google-font-${fontName.toLowerCase().replace(/\s+/g, '-')}`;
          if (document.getElementById(fontId)) return; // Already loaded

          const link = document.createElement('link');
          link.id = fontId;
          link.rel = 'stylesheet';
          link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
          document.head.appendChild(link);
        };

        if (config.typography.fontHeading) {
            const font = config.typography.fontHeading;
            loadFont(font);
            setHtmlStyle('--font-heading', `'${font}', system-ui, sans-serif`);
        }

        if (config.typography.fontBody) {
            const font = config.typography.fontBody;
            loadFont(font);
            setHtmlStyle('--font-sans', `'${font}', system-ui, sans-serif`);
        }
    }
  }, [config]);

  // Listen for postMessage from Editor (if in iframe)
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data === 'object' && event.data?.type === 'THEME_UPDATE') {
        console.log('🎨 Catalog received theme update:', event.data.payload);
        console.log('📦 Current config before update:', config);
        updateConfig(event.data.payload);
        console.log('✅ Config updated');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [updateConfig]);

  return (
    <ThemeContext.Provider value={{ config, updateConfig }}>
      {children}
    </ThemeContext.Provider>
  );
}


