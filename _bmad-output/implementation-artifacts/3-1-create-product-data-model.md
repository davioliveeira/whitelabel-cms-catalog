# Story 3.1: Create Product Data Model

Status: review

## Story

As a **developer**,
I want **a Product model with all required fields**,
So that **products can be stored and retrieved with full details**.

## Acceptance Criteria

### AC1: Product Model Fields
**Given** the database schema
**When** I review the Product model
**Then** it contains the following fields:
  - `id` (UUID, primary key)
  - `tenantId` (UUID, foreign key to Tenant)
  - `name` (string, required)
  - `description` (text, optional)
  - `brand` (string, optional)
  - `category` (string, optional)
  - `originalPrice` (decimal, "De" price, optional)
  - `salePrice` (decimal, "Por" price, required)
  - `imageUrl` (string, optional)
  - `isAvailable` (boolean, default true)
  - `createdAt`, `updatedAt` (timestamps)

### AC2: Tenant Relationship
**Given** the Product model
**When** I create a product
**Then** it must have a valid `tenantId` reference
**And** cascade delete is configured appropriately
**And** products are isolated per tenant

### AC3: Performance Indexes
**Given** the database schema
**When** I review the indexes
**Then** an index exists on `tenantId` for fast queries
**And** an index exists on `brand` for filtering
**And** an index exists on `category` for filtering
**And** a composite index exists on `tenantId + isAvailable` for catalog queries

### AC4: Type-safe Service Functions
**Given** the Prisma Client is generated
**When** I use product service functions
**Then** TypeScript types are available for all operations
**And** validation schemas exist for create/update operations

## Tasks / Subtasks

- [x] **Task 1: Create Product Prisma Model** (AC: #1, #2, #3)
  - [x] 1.1 Add Product model to schema.prisma
  - [x] 1.2 Define all required fields with Decimal for prices
  - [x] 1.3 Add relation to Tenant with onDelete: Cascade
  - [x] 1.4 Create indexes for tenantId, brand, category, tenantId+isAvailable
  - [x] 1.5 Run db push to apply schema

- [x] **Task 2: Create Product Zod Schemas** (AC: #4)
  - [x] 2.1 Create ProductCreateSchema
  - [x] 2.2 Create ProductUpdateSchema
  - [x] 2.3 Create ProductFilterSchema with pagination
  - [x] 2.4 Export types (ProductPublicData, ProductListResponse, etc.)

- [x] **Task 3: Create Product Service Functions** (AC: #4)
  - [x] 3.1 Create createProduct function
  - [x] 3.2 Create getProductById function
  - [x] 3.3 Create getProductsByTenant with filters/pagination
  - [x] 3.4 Create updateProduct function
  - [x] 3.5 Create deleteProduct function
  - [x] 3.6 Create helper functions (getAvailableProducts, getBrandsAndCategories, bulkUpdateAvailability)

- [x] **Task 4: Test Product Model** (AC: #1-#4)
  - [x] 4.1 Verify schema push runs correctly
  - [x] 4.2 Test all CRUD operations
  - [x] 4.3 Verify shared lib build

## Dev Notes

### Architecture Compliance

**Source:** [docs/architecture.md#4.1 Isolamento de Dados]
- Todas tabelas sensíveis possuem coluna tenant_id
- Acesso filtrado por tenant_id em todas as queries

### Technical Requirements

| Component | Specification |
|-----------|---------------|
| Database | PostgreSQL 16 via Prisma |
| ORM | Prisma 5.x |
| Validation | Zod schemas |
| Decimal | Prisma Decimal type for prices |

### Product Model Schema

```prisma
model Product {
  id          String   @id @default(uuid())
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Product Info
  name        String
  description String?  @db.Text
  brand       String?
  category    String?
  
  // Pricing
  originalPrice Decimal? @db.Decimal(10, 2)
  salePrice     Decimal  @db.Decimal(10, 2)
  
  // Image
  imageUrl    String?
  
  // Status
  isAvailable Boolean  @default(true)
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Indexes
  @@index([tenantId])
  @@index([tenantId, isAvailable])
  @@index([brand])
  @@index([category])
}
```

### Zod Schema Examples

```typescript
export const ProductCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  brand: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  originalPrice: z.number().positive().optional(),
  salePrice: z.number().positive(),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().default(true),
});

export const ProductFilterSchema = z.object({
  brand: z.string().optional(),
  category: z.string().optional(),
  isAvailable: z.boolean().optional(),
  search: z.string().optional(),
});
```

### Dependencies

Already in project:
- Prisma (libs/database)
- Zod (libs/shared)
- TypeScript

### Previous Story Learnings

From Story 2.5:
- Tenant model has `id` field for relations
- Multi-tenant queries filter by `tenantId`
- Service functions in `libs/shared/src/services/`
- Schemas in `libs/shared/src/schemas/`

### Project Structure After Implementation

```
libs/database/prisma/
├── schema.prisma          # Product model added
└── migrations/
    └── 20260202_add_product_model/  # New migration

libs/shared/src/
├── schemas/
│   └── product.schema.ts  # Zod schemas
├── services/
│   └── product.service.ts # CRUD functions
└── index.ts               # Updated exports
```

### Decimal Handling

Use Prisma's Decimal type for price fields:
- `Decimal(10, 2)` allows values up to 99,999,999.99
- Convert to number for API responses
- Validate with `z.number().positive()` in Zod

### References

- [Source: docs/architecture.md#4.1 Isolamento de Dados]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.1]
- [Prisma Decimal Documentation]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

- Prisma db push: Schema synced in 128ms
- Prisma Client generated in 58ms
- All CRUD tests passed

### Completion Notes List

1. Product model added to Prisma schema with all required fields
2. Decimal(10,2) used for price fields (supports up to R$ 99,999,999.99)
3. Indexes created for tenantId, brand, category, and composite tenantId+isAvailable
4. Zod schemas created with validation for create/update/filter operations
5. Service functions include pagination, search, and bulk operations
6. Helper function maps Prisma Decimal to JavaScript number for API responses

### File List

- `libs/database/prisma/schema.prisma` - Product model added
- `libs/shared/src/schemas/product.schema.ts` - Zod validation schemas
- `libs/shared/src/services/product.service.ts` - CRUD service functions
- `libs/shared/src/index.ts` - Updated exports
