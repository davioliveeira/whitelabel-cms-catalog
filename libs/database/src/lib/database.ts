// =============================================================================
// CMS Catalogo White Label - Prisma Client Singleton
// =============================================================================
// This module exports a singleton Prisma client instance to ensure connection
// pooling is properly managed across the application.
// =============================================================================

import { PrismaClient } from '@prisma/client';

// Extend globalThis to store the Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Singleton Prisma client instance.
 * 
 * In development, we store the client on globalThis to prevent
 * multiple instances during hot-reloading (Next.js dev server).
 * 
 * In production, we create a single instance per process.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env['NODE_ENV'] === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

// Store the client on globalThis in non-production environments
if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Re-export all Prisma types for convenience
export * from '@prisma/client';

// Export a type for the Prisma client instance
export type PrismaInstance = typeof prisma;
