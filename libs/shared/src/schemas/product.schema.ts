// =============================================================================
// Product Validation Schemas
// =============================================================================
// Zod schemas for product-related operations.
// =============================================================================

import { z } from 'zod';

// =============================================================================
// Create Product Schema
// =============================================================================

export const ProductCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome do produto é obrigatório')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  description: z
    .string()
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
    .optional()
    .nullable(),
  brand: z
    .string()
    .max(100, 'Marca deve ter no máximo 100 caracteres')
    .optional()
    .nullable(),
  category: z
    .string()
    .max(100, 'Categoria deve ter no máximo 100 caracteres')
    .optional()
    .nullable(),
  originalPrice: z
    .number()
    .positive('Preço original deve ser positivo')
    .max(99999999.99, 'Preço máximo excedido')
    .optional()
    .nullable(),
  salePrice: z
    .number()
    .positive('Preço de venda deve ser positivo')
    .max(99999999.99, 'Preço máximo excedido'),
  imageUrl: z
    .string()
    .refine(
      (val) => !val || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/'),
      { message: 'URL da imagem inválida' }
    )
    .optional()
    .nullable(),
  isAvailable: z.boolean(),
  stockQuantity: z.number().int('Quantidade deve ser um número inteiro').min(0, 'Quantidade não pode ser negativa').default(0),
});

export type ProductCreateInput = z.infer<typeof ProductCreateSchema>;

// =============================================================================
// Update Product Schema
// =============================================================================

export const ProductUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome do produto é obrigatório')
    .max(200, 'Nome deve ter no máximo 200 caracteres')
    .optional(),
  description: z
    .string()
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
    .optional()
    .nullable(),
  brand: z
    .string()
    .max(100, 'Marca deve ter no máximo 100 caracteres')
    .optional()
    .nullable(),
  category: z
    .string()
    .max(100, 'Categoria deve ter no máximo 100 caracteres')
    .optional()
    .nullable(),
  originalPrice: z
    .number()
    .positive('Preço original deve ser positivo')
    .max(99999999.99, 'Preço máximo excedido')
    .optional()
    .nullable(),
  salePrice: z
    .number()
    .positive('Preço de venda deve ser positivo')
    .max(99999999.99, 'Preço máximo excedido')
    .optional(),
  imageUrl: z
    .string()
    .refine(
      (val) => !val || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/'),
      { message: 'URL da imagem inválida' }
    )
    .optional()
    .nullable(),
  isAvailable: z.boolean().optional(),
  stockQuantity: z.number().int().min(0).optional(),
});

export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;

// =============================================================================
// Product Filter Schema
// =============================================================================

export const ProductFilterSchema = z.object({
  brand: z.string().optional(),
  category: z.string().optional(),
  isAvailable: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type ProductFilterInput = z.infer<typeof ProductFilterSchema>;

// =============================================================================
// Product Public Data Interface
// =============================================================================

export interface ProductPublicData {
  id: string;
  name: string;
  description: string | null;
  brand: string | null;
  category: string | null;
  originalPrice: number | null;
  salePrice: number;
  imageUrl: string | null;
  isAvailable: boolean;
  stockQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// Product List Response Interface
// =============================================================================

export interface ProductListResponse {
  products: ProductPublicData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// =============================================================================
// Brands/Categories List Response
// =============================================================================

export interface BrandCategoryListResponse {
  brands: string[];
  categories: string[];
}
