// =============================================================================
// Tenant Service
// =============================================================================
// Business logic for tenant management operations including registration,
// unique slug generation, and password hashing.
// =============================================================================

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';
import type { TenantPublicData, RegisterTenantInput, BrandConfigInput, BrandSettingsData, WhatsAppConfigInput, WhatsAppSettingsData } from '../schemas/tenant.schema';

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

// =============================================================================
// Constants
// =============================================================================

const BCRYPT_SALT_ROUNDS = 12;

// =============================================================================
// Password Hashing
// =============================================================================

/**
 * Hash a password using bcrypt.
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Verify a password against a hash.
 * @param password - Plain text password
 * @param hash - Stored hash
 * @returns True if password matches
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// =============================================================================
// Slug Generation
// =============================================================================

/**
 * Generate a URL-safe slug from a store name.
 * @param name - Store name
 * @returns Slugified version of the name
 */
function createSlug(name: string): string {
  return slugify(name, {
    lower: true,
    strict: true,
    locale: 'pt',
  });
}

/**
 * Generate a unique slug for a tenant.
 * If the base slug already exists, appends a counter (e.g., "loja-2").
 * 
 * @param name - Store name to slugify
 * @returns Unique slug string
 */
export async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = createSlug(name);

  if (!baseSlug) {
    throw new Error('Nome da loja inválido para gerar URL');
  }

  let slug = baseSlug;
  let counter = 1;
  const maxAttempts = 100;

  while (counter <= maxAttempts) {
    const existing = await prisma.store.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Fallback: append timestamp if max attempts reached
  return `${baseSlug}-${Date.now()}`;
}

// =============================================================================
// Tenant Queries
// =============================================================================

/**
 * Find a user by email address.
 * @param email - Email address to search
 * @returns User or null
 */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

/**
 * Find a tenant by slug.
 * @param slug - Slug to search
 * @returns Tenant or null
 */
export async function findTenantBySlug(slug: string) {
  return prisma.store.findUnique({
    where: { slug },
  });
}

/**
 * Find a tenant by ID.
 * @param id - Tenant ID
 * @returns Tenant or null
 */
export async function findTenantById(id: string) {
  return prisma.store.findUnique({
    where: { id },
  });
}

// =============================================================================
// Tenant Creation
// =============================================================================

/**
 * Create a new tenant with the given registration data.
 * Handles slug generation, password hashing, and user creation.
 * 
 * @param input - Registration input (storeName, email, password)
 * @returns Public tenant data
 * @throws Error if email already exists or creation fails
 */
export async function createTenant(
  input: Omit<RegisterTenantInput, 'confirmPassword'>
): Promise<TenantPublicData> {
  const { storeName, email, password } = input;

  // Check if email already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new TenantEmailExistsError(email);
  }

  // Generate unique slug and hash password in parallel
  const [slug, passwordHash] = await Promise.all([
    generateUniqueSlug(storeName),
    hashPassword(password),
  ]);

  // Create tenant and user in transaction
  const [store] = await prisma.$transaction([
    prisma.store.create({
      data: {
        name: storeName.trim(),
        slug,
        // Default brand values are set in the schema
        // Default status values are set in the schema
        users: {
          create: {
            email: email.toLowerCase().trim(),
            passwordHash,
            role: Role.STORE_OWNER,
            name: storeName.trim(), // Determine appropriate name or extract from input if added
          },
        },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        logoUrl: true,
        faviconUrl: true,
        whatsappPrimary: true,
        whatsappSecondary: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  return store;
}

// =============================================================================
// Brand Settings
// =============================================================================

/**
 * Get brand settings for a tenant.
 * @param tenantId - Tenant ID
 * @returns Brand settings data
 */
export async function getBrandSettings(tenantId: string): Promise<BrandSettingsData> {
  const tenant = await prisma.store.findUnique({
    where: { id: tenantId },
    select: {
      logoUrl: true,
      primaryColor: true,
      secondaryColor: true,
      borderRadius: true,
      name: true,
      slug: true,
    },
  });

  if (!tenant) {
    throw new TenantNotFoundError(tenantId);
  }

  return tenant;
}

/**
 * Update brand settings for a tenant.
 * @param tenantId - Tenant ID
 * @param settings - Brand settings to update
 * @returns Updated brand settings
 */
export async function updateBrandSettings(
  tenantId: string,
  settings: BrandConfigInput
): Promise<BrandSettingsData> {
  const tenant = await prisma.store.update({
    where: { id: tenantId },
    data: {
      logoUrl: settings.logoUrl,
      ...(settings.primaryColor ? { primaryColor: settings.primaryColor } : {}),
      ...(settings.secondaryColor ? { secondaryColor: settings.secondaryColor } : {}),
      ...(settings.borderRadius ? { borderRadius: settings.borderRadius } : {}),
      onboardingComplete: true,
    },
    select: {
      logoUrl: true,
      primaryColor: true,
      secondaryColor: true,
      borderRadius: true,
      name: true,
      slug: true,
    },
  });

  return tenant;
}

/**
 * Update tenant logo URL.
 * @param tenantId - Tenant ID
 * @param logoUrl - New logo URL
 */
export async function updateTenantLogo(
  tenantId: string,
  logoUrl: string
): Promise<void> {
  await prisma.store.update({
    where: { id: tenantId },
    data: { logoUrl },
  });
}

// =============================================================================
// WhatsApp Settings
// =============================================================================

/**
 * Get WhatsApp settings for a tenant.
 * @param tenantId - Tenant ID
 * @returns WhatsApp settings data
 */
export async function getWhatsAppSettings(tenantId: string): Promise<WhatsAppSettingsData> {
  const tenant = await prisma.store.findUnique({
    where: { id: tenantId },
    select: {
      whatsappPrimary: true,
      whatsappSecondary: true,
      name: true,
      slug: true,
    },
  });

  if (!tenant) {
    throw new TenantNotFoundError(tenantId);
  }

  return tenant;
}

/**
 * Update WhatsApp settings for a tenant.
 * @param tenantId - Tenant ID
 * @param settings - WhatsApp settings to update
 * @returns Updated WhatsApp settings
 */
export async function updateWhatsAppSettings(
  tenantId: string,
  settings: WhatsAppConfigInput
): Promise<WhatsAppSettingsData> {
  const tenant = await prisma.store.update({
    where: { id: tenantId },
    data: {
      whatsappPrimary: settings.whatsappPrimary || null,
      whatsappSecondary: settings.whatsappSecondary || null,
    },
    select: {
      whatsappPrimary: true,
      whatsappSecondary: true,
      name: true,
      slug: true,
    },
  });

  return tenant;
}

/**
 * Format phone number for display (with spaces).
 * @param phone - Phone number in E.164 format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string | null): string {
  if (!phone) return '';
  // +5511999999999 -> +55 11 99999-9999
  const match = phone.match(/^\+(\d{2})(\d{2})(\d{5})(\d{4})$/);
  if (match) {
    return `+${match[1]} ${match[2]} ${match[3]}-${match[4]}`;
  }
  return phone;
}

// =============================================================================
// Custom Errors
// =============================================================================

/**
 * Error thrown when email already exists during registration.
 */
export class TenantEmailExistsError extends Error {
  public readonly code = 'EMAIL_EXISTS';

  constructor(email: string) {
    super(`Email ${email} já está cadastrado`);
    this.name = 'TenantEmailExistsError';
  }
}

/**
 * Error thrown when tenant is not found.
 */
export class TenantNotFoundError extends Error {
  public readonly code = 'TENANT_NOT_FOUND';

  constructor(identifier: string) {
    super(`Loja não encontrada: ${identifier}`);
    this.name = 'TenantNotFoundError';
  }
}
