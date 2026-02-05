// =============================================================================
// Product Service
// =============================================================================
// Service functions for product-related operations.
// All functions filter by storeId for multi-tenant isolation.
// =============================================================================

import { PrismaClient, Prisma } from '@prisma/client';

// =============================================================================
// Prisma Client Singleton (for shared lib)
// =============================================================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env['NODE_ENV'] === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;
}
import type {
  ProductCreateInput,
  ProductUpdateInput,
  ProductFilterInput,
  ProductPublicData,
  ProductListResponse,
  BrandCategoryListResponse,
} from '../schemas/product.schema';

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Convert Prisma Decimal to number for API responses.
 */
function decimalToNumber(decimal: Prisma.Decimal | null): number | null {
  if (decimal === null) return null;
  return decimal.toNumber();
}

/**
 * Map Prisma Product to ProductPublicData.
 */
function mapToPublicData(product: {
  id: string;
  name: string;
  description: string | null;
  brand: string | null;
  category: string | null;
  originalPrice: Prisma.Decimal | null;
  salePrice: Prisma.Decimal;
  imageUrl: string | null;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}): ProductPublicData {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    brand: product.brand,
    category: product.category,
    originalPrice: decimalToNumber(product.originalPrice),
    salePrice: product.salePrice.toNumber(),
    imageUrl: product.imageUrl,
    isAvailable: product.isAvailable,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

// =============================================================================
// CRUD Operations
// =============================================================================

/**
 * Create a new product for a tenant.
 * 
 * @param storeId - The tenant ID
 * @param data - Product creation data
 * @returns Created product
 */
export async function createProduct(
  storeId: string,
  data: ProductCreateInput
): Promise<ProductPublicData> {
  const product = await prisma.product.create({
    data: {
      storeId,
      name: data.name,
      description: data.description,
      brand: data.brand,
      category: data.category,
      originalPrice: data.originalPrice ?? null,
      salePrice: data.salePrice,
      imageUrl: data.imageUrl,
      isAvailable: data.isAvailable ?? true,
    },
  });

  return mapToPublicData(product);
}

/**
 * Get a product by ID (with tenant isolation).
 * 
 * @param storeId - The tenant ID
 * @param productId - The product ID
 * @returns Product or null if not found
 */
export async function getProductById(
  storeId: string,
  productId: string
): Promise<ProductPublicData | null> {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      storeId,
    },
  });

  if (!product) return null;
  return mapToPublicData(product);
}

/**
 * Get products for a tenant with filtering and pagination.
 * 
 * @param storeId - The tenant ID
 * @param filters - Filter and pagination options
 * @returns Paginated product list
 */
export async function getProductsByTenant(
  storeId: string,
  filters: ProductFilterInput = { page: 1, limit: 20 }
): Promise<ProductListResponse> {
  const { brand, category, isAvailable, search, page, limit } = filters;

  // Build where clause
  const where: Prisma.ProductWhereInput = {
    storeId,
    ...(brand && { brand }),
    ...(category && { category }),
    ...(isAvailable !== undefined && { isAvailable }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  // Get total count
  const total = await prisma.product.count({ where });

  // Get paginated products
  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    products: products.map(mapToPublicData),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get available products for a tenant's public catalog.
 * 
 * @param storeId - The tenant ID
 * @param filters - Filter options
 * @returns List of available products
 */
export async function getAvailableProducts(
  storeId: string,
  filters: Omit<ProductFilterInput, 'isAvailable'> = { page: 1, limit: 50 }
): Promise<ProductListResponse> {
  return getProductsByTenant(storeId, {
    ...filters,
    isAvailable: true,
  });
}

/**
 * Update a product (with tenant isolation).
 * 
 * @param storeId - The tenant ID
 * @param productId - The product ID
 * @param data - Update data
 * @returns Updated product or null if not found
 */
export async function updateProduct(
  storeId: string,
  productId: string,
  data: ProductUpdateInput
): Promise<ProductPublicData | null> {
  // Verify product belongs to tenant
  const existing = await prisma.product.findFirst({
    where: { id: productId, storeId },
  });

  if (!existing) return null;

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.brand !== undefined && { brand: data.brand }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.originalPrice !== undefined && { originalPrice: data.originalPrice }),
      ...(data.salePrice !== undefined && { salePrice: data.salePrice }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
    },
  });

  return mapToPublicData(product);
}

/**
 * Delete a product (with tenant isolation).
 * 
 * @param storeId - The tenant ID
 * @param productId - The product ID
 * @returns True if deleted, false if not found
 */
export async function deleteProduct(
  storeId: string,
  productId: string
): Promise<boolean> {
  // Verify product belongs to tenant
  const existing = await prisma.product.findFirst({
    where: { id: productId, storeId },
  });

  if (!existing) return false;

  await prisma.product.delete({
    where: { id: productId },
  });

  return true;
}

/**
 * Bulk update product availability.
 * 
 * @param storeId - The tenant ID
 * @param productIds - List of product IDs
 * @param isAvailable - New availability status
 * @returns Number of updated products
 */
export async function bulkUpdateAvailability(
  storeId: string,
  productIds: string[],
  isAvailable: boolean
): Promise<number> {
  const result = await prisma.product.updateMany({
    where: {
      id: { in: productIds },
      storeId,
    },
    data: { isAvailable },
  });

  return result.count;
}

/**
 * Get distinct brands and categories for a tenant.
 * Useful for building filter dropdowns.
 * 
 * @param storeId - The tenant ID
 * @returns List of brands and categories
 */
export async function getBrandsAndCategories(
  storeId: string
): Promise<BrandCategoryListResponse> {
  const [brandsResult, categoriesResult] = await Promise.all([
    prisma.product.findMany({
      where: { storeId, brand: { not: null } },
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' },
    }),
    prisma.product.findMany({
      where: { storeId, category: { not: null } },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    }),
  ]);

  return {
    brands: brandsResult.map((b) => b.brand).filter((brand): brand is string => brand !== null),
    categories: categoriesResult.map((c) => c.category).filter((category): category is string => category !== null),
  };
}

/**
 * Count products for a tenant.
 * 
 * @param storeId - The tenant ID
 * @returns Product count
 */
export async function countProducts(storeId: string): Promise<number> {
  return prisma.product.count({
    where: { storeId },
  });
}
