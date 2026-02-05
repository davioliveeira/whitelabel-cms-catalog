import { z } from 'zod';

export const ThemeColorsSchema = z.object({
  primary: z.string().default('#0f172a'),
  secondary: z.string().default('#64748b'),
  background: z.string().default('#ffffff'),
  cardBackground: z.string().default('#ffffff'),
  textPrimary: z.string().default('#020817'),
  textSecondary: z.string().default('#64748b'),
});

export const ThemeTypographySchema = z.object({
  fontHeading: z.string().default('Inter'),
  fontBody: z.string().default('Inter'),
  borderRadius: z.string().default('0.5rem'), // stored as string e.g. "0.5rem" or "8px"
  buttonStyle: z.enum(['filled', 'outlined', 'ghost']).default('filled'),
});

export const ThemeHeaderSchema = z.object({
  style: z.enum(['simple', 'centered', 'minimal']).default('simple'),
  backgroundColor: z.string().default('#ffffff'),
  textColor: z.string().default('#020817'),
  showSearch: z.boolean().default(true),
  showPromo: z.boolean().default(true),
  menuPosition: z.enum(['center', 'left', 'right']).default('center'),
  height: z.enum(['small', 'normal', 'large']).default('normal'),
  shadow: z.boolean().default(true),
});

export const ThemeBannerSchema = z.object({
  isActive: z.boolean().default(true),
  type: z.enum(['image', 'carousel']).default('image'),
  images: z.array(z.string()).default([]),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  textColor: z.string().default('#ffffff'),
  textPosition: z.enum(['left', 'center', 'right']).default('center'),
  overlayOpacity: z.number().min(0).max(100).default(50), // 0-100
  ctaText: z.string().optional(),
  height: z.enum(['small', 'medium', 'large', 'full']).default('medium'),
  autoplay: z.boolean().default(true),
});

export const ThemeConfigSchema = z.object({
  colors: ThemeColorsSchema,
  typography: ThemeTypographySchema,
  header: ThemeHeaderSchema,
  banner: ThemeBannerSchema,
});

export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;
export type ThemeColors = z.infer<typeof ThemeColorsSchema>;
export type ThemeHeader = z.infer<typeof ThemeHeaderSchema>;
export type ThemeBanner = z.infer<typeof ThemeBannerSchema>;
