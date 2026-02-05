// =============================================================================
// Tenant Settings Schemas
// =============================================================================

import { z } from 'zod';

// =============================================================================
// Update Tenant Settings Schema
// =============================================================================

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const TenantSettingsUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome da marca é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional(),
  logoUrl: z
    .string()
    .refine(
      (val) => !val || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/'),
      { message: 'URL da logo inválida' }
    )
    .optional()
    .nullable(),
  faviconUrl: z
    .string()
    .refine(
      (val) => !val || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/'),
      { message: 'URL do favicon inválida' }
    )
    .optional()
    .nullable(),
  whatsappPrimary: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Número de WhatsApp inválido (formato: +5511999999999)')
    .optional()
    .nullable(),
  whatsappSecondary: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Número de WhatsApp inválido (formato: +5511999999999)')
    .optional()
    .nullable(),
  primaryColor: z
    .string()
    .regex(hexColorRegex, 'Cor primária inválida. Use formato #RRGGBB')
    .optional()
    .nullable(),
  secondaryColor: z
    .string()
    .regex(hexColorRegex, 'Cor secundária inválida. Use formato #RRGGBB')
    .optional()
    .nullable(),
  borderRadius: z
    .string()
    .optional()
    .nullable(),
});

export type TenantSettingsUpdateInput = z.infer<typeof TenantSettingsUpdateSchema>;

// =============================================================================
// Tenant Public Data Interface
// =============================================================================

export interface TenantPublicData {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  whatsappPrimary: string | null;
  whatsappSecondary: string | null;
  createdAt: Date;
  updatedAt: Date;
}
