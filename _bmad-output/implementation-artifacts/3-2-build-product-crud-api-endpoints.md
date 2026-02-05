# Story 3.2: Build Product CRUD API Endpoints

Status: review

## Story

As a **store owner**,
I want **API endpoints to create, read, update, and delete products**,
So that **I can manage my inventory programmatically**.

## Acceptance Criteria

### AC1: Create Product Endpoint
**Given** I am authenticated as a store owner
**When** I call `POST /api/products` with valid product data
**Then** a new product is created with my `tenant_id`
**And** the created product is returned with its ID

### AC2: List Products Endpoint
**Given** I want to list my products
**When** I call `GET /api/products`
**Then** only products matching my `tenant_id` are returned
**And** results can be filtered by `brand` or `category`

### AC3: Update Product Endpoint
**Given** I want to update a product
**When** I call `PUT /api/products/[id]` with new data
**Then** the product is updated if it belongs to my tenant
**And** a 404 is returned if the product doesn't exist or belongs to another tenant

### AC4: Delete Product Endpoint
**Given** I want to delete a product
**When** I call `DELETE /api/products/[id]`
**Then** the product is soft-deleted (or hard-deleted per business rules)

## Tasks / Subtasks

- [x] **Task 1: Create POST /api/products endpoint** (AC: #1)
  - [x] 1.1 Create route handler at `apps/admin/app/api/products/route.ts`
  - [x] 1.2 Extract tenantId from authenticated session/middleware
  - [x] 1.3 Validate request body with ProductCreateSchema
  - [x] 1.4 Call createProduct service with tenantId + validated data
  - [x] 1.5 Return 201 with created product or 400 with validation errors

- [x] **Task 2: Create GET /api/products endpoint** (AC: #2)
  - [x] 2.1 Add GET handler to `apps/admin/app/api/products/route.ts`
  - [x] 2.2 Extract tenantId from authenticated session/middleware
  - [x] 2.3 Parse query params: brand, category, search, page, limit
  - [x] 2.4 Call getProductsByTenant service with filters
  - [x] 2.5 Return 200 with ProductListResponse (data, total, pagination)

- [x] **Task 3: Create PUT /api/products/[id] endpoint** (AC: #3)
  - [x] 3.1 Create route handler at `apps/admin/app/api/products/[id]/route.ts`
  - [x] 3.2 Extract productId from params and tenantId from session
  - [x] 3.3 Validate request body with ProductUpdateSchema
  - [x] 3.4 Call updateProduct service (verifies tenant ownership internally)
  - [x] 3.5 Return 200 with updated product, 404 if not found/unauthorized, 400 for validation errors

- [x] **Task 4: CREATE DELETE /api/products/[id] endpoint** (AC: #4)
  - [x] 4.1 Add DELETE handler to `apps/admin/app/api/products/[id]/route.ts`
  - [x] 4.2 Extract productId from params and tenantId from session
  - [x] 4.3 Call deleteProduct service (verifies tenant ownership)
  - [x] 4.4 Return 204 on success, 404 if not found/unauthorized

- [x] **Task 5: Add Authentication Middleware** (AC: All)
  - [x] 5.1 Create or verify auth middleware for API routes
  - [x] 5.2 Ensure tenantId is attached to request context
  - [x] 5.3 Return 401 for unauthenticated requests
  - [x] 5.4 Return 403 for requests without tenant context

- [x] **Task 6: Test API Endpoints** (AC: All)
  - [x] 6.1 Write integration tests for POST endpoint
  - [x] 6.2 Write integration tests for GET endpoint with filters
  - [x] 6.3 Write integration tests for PUT endpoint (success + 404 cases)
  - [x] 6.4 Write integration tests for DELETE endpoint
  - [x] 6.5 Verify tenant isolation (cannot access other tenant's products)

## Dev Notes

### Architecture Compliance

**Source:** [docs/architecture.md#3 Estrutura do Monorepo]
- Admin app located at `apps/admin/`
- API routes use Next.js 14+ App Router: `app/api/products/route.ts`
- Shared services consumed from `libs/shared/src/services/product.service.ts`

**Source:** [docs/architecture.md#4.1 Isolamento de Dados]
- All queries MUST filter by `tenant_id`
- Middleware or session context provides authenticated tenantId
- Service functions already implement tenant isolation (from Story 3.1)

### Technical Requirements

| Component | Specification |
|-----------|---------------|
| Framework | Next.js 14+ App Router |
| API Pattern | RESTful with `/api/products` and `/api/products/[id]` |
| Validation | Zod schemas (ProductCreateSchema, ProductUpdateSchema, ProductFilterSchema) |
| Service Layer | Use existing product.service.ts functions from Story 3.1 |
| Auth | Session/middleware must provide tenantId |
| Response Format | JSON with proper HTTP status codes |

### API Endpoint Specifications

#### POST /api/products
```typescript
// Request
POST /api/products
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Perfume XYZ",
  "description": "Fragrância suave",
  "brand": "Brand A",
  "category": "Perfumes",
  "originalPrice": 150.00,
  "salePrice": 99.90,
  "imageUrl": "https://...",
  "isAvailable": true
}

// Response 201
{
  "id": "uuid-here",
  "tenantId": "tenant-uuid",
  "name": "Perfume XYZ",
  ...
  "createdAt": "2026-02-02T12:00:00Z",
  "updatedAt": "2026-02-02T12:00:00Z"
}

// Response 400 (validation error)
{
  "error": "Validation failed",
  "details": [
    { "field": "name", "message": "Name is required" }
  ]
}
```

#### GET /api/products
```typescript
// Request
GET /api/products?brand=Brand%20A&category=Perfumes&page=1&limit=20
Authorization: Bearer <token>

// Response 200
{
  "data": [
    {
      "id": "uuid-1",
      "name": "Perfume XYZ",
      "brand": "Brand A",
      "category": "Perfumes",
      "salePrice": 99.90,
      "isAvailable": true,
      ...
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

#### PUT /api/products/[id]
```typescript
// Request
PUT /api/products/uuid-here
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Updated Name",
  "salePrice": 89.90
}

// Response 200
{
  "id": "uuid-here",
  "name": "Updated Name",
  "salePrice": 89.90,
  ...
  "updatedAt": "2026-02-02T12:30:00Z"
}

// Response 404
{
  "error": "Product not found or access denied"
}
```

#### DELETE /api/products/[id]
```typescript
// Request
DELETE /api/products/uuid-here
Authorization: Bearer <token>

// Response 204 No Content

// Response 404
{
  "error": "Product not found or access denied"
}
```

### Previous Story Intelligence

From Story 3.1 (Create Product Data Model):
- Product model exists in `libs/database/prisma/schema.prisma`
- Service functions available in `libs/shared/src/services/product.service.ts`:
  - `createProduct(tenantId, data)` - creates product with tenant isolation
  - `getProductById(id, tenantId)` - retrieves single product
  - `getProductsByTenant(tenantId, filters)` - list with filters/pagination
  - `updateProduct(id, tenantId, data)` - updates if owned by tenant
  - `deleteProduct(id, tenantId)` - deletes if owned by tenant
- Zod schemas in `libs/shared/src/schemas/product.schema.ts`:
  - `ProductCreateSchema` - validates creation payload
  - `ProductUpdateSchema` - validates update payload (partial)
  - `ProductFilterSchema` - validates query filters
- Decimal handling: Prisma Decimal is converted to number in service responses
- All service functions enforce tenant isolation internally

**Key Takeaway:** DO NOT reimplement service logic. Use existing functions from libs/shared.

### File Structure Requirements

```
apps/admin/
├── app/
│   └── api/
│       └── products/
│           ├── route.ts              # POST, GET handlers
│           └── [id]/
│               └── route.ts          # PUT, DELETE handlers
└── middleware.ts                     # Auth middleware (if not exists)

libs/shared/src/
├── services/
│   └── product.service.ts           # ALREADY EXISTS from Story 3.1
├── schemas/
│   └── product.schema.ts            # ALREADY EXISTS from Story 3.1
└── index.ts                          # Already exports service + schemas
```

### Testing Requirements

- Write integration tests in `apps/admin/__tests__/api/products.test.ts`
- Use test database or mock Prisma client
- Test scenarios:
  1. Authenticated user creates product → success
  2. Unauthenticated request → 401
  3. Invalid data → 400 with validation errors
  4. GET filters work correctly (brand, category, search)
  5. Pagination works (page, limit)
  6. User cannot update/delete another tenant's product → 404
  7. Tenant isolation enforced (cannot see other tenant products)

### Authentication Context

**CRITICAL:** API routes MUST have access to authenticated user's `tenantId`.

Options (choose based on existing auth setup):
1. **Next-Auth:** `const session = await getServerSession(authOptions)` → session.user.tenantId
2. **Middleware:** `request.headers.get('x-tenant-id')` from auth middleware
3. **Custom Auth:** Use existing project auth pattern

If no auth exists yet, create a middleware that:
- Validates auth token
- Extracts tenantId from token/session
- Attaches to request context
- Returns 401 if invalid

### Decimal Price Handling

From Story 3.1 learnings:
- Service functions return prices as JavaScript `number`
- API responses automatically have correct number format
- No additional conversion needed in route handlers

### Error Handling Pattern

```typescript
// Consistent error response format
try {
  // ... operation
} catch (error) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    );
  }
  if (error.message === 'Not found') {
    return NextResponse.json(
      { error: 'Product not found or access denied' },
      { status: 404 }
    );
  }
  console.error('API Error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

### Dependencies

Already in project from Story 3.1:
- Prisma Client (via libs/database)
- Product service functions (libs/shared/src/services/product.service.ts)
- Zod schemas (libs/shared/src/schemas/product.schema.ts)
- TypeScript
- Next.js 14+

May need to verify/add:
- Authentication library (Next-Auth, Clerk, or custom)
- Testing library (Jest, Vitest)

### References

- [Source: docs/architecture.md#3 Estrutura do Monorepo]
- [Source: docs/architecture.md#4.1 Isolamento de Dados]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.2]
- [Source: _bmad-output/implementation-artifacts/3-1-create-product-data-model.md]
- [Next.js App Router API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma Client Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

- TypeScript path alias correction: Changed `@/libs/shared` to `@cms/shared`
- All API endpoints use Next.js 14+ App Router patterns
- Middleware configured for multi-tenant isolation

### Completion Notes List

1. **POST /api/products** - Create product endpoint implemented with Zod validation
2. **GET /api/products** - List products with filters (brand, category, search, pagination)
3. **GET /api/products/[id]** - Single product retrieval with tenant isolation
4. **PUT /api/products/[id]** - Update product endpoint with tenant ownership verification
5. **DELETE /api/products/[id]** - Delete product endpoint (hard delete) with 204 response
6. **Authentication middleware** - Created at apps/admin/middleware.ts for tenant context injection
7. **Comprehensive integration tests** - 70+ test scenarios covering all ACs and tenant isolation
8. **Error handling** - Consistent error responses for 400, 401, 404, 500 status codes
9. **Service layer reuse** - All endpoints leverage existing product.service.ts from Story 3.1
10. **Tenant isolation** - All operations filtered by tenantId from authenticated context

### File List

- `apps/admin/app/api/products/route.ts` - POST and GET handlers for product collection
- `apps/admin/app/api/products/[id]/route.ts` - GET, PUT, DELETE handlers for individual products
- `apps/admin/middleware.ts` - Authentication and tenant context middleware
- `apps/admin/__tests__/api/products.test.ts` - Comprehensive integration test suite (70+ tests)
