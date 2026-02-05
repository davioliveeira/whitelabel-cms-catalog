# Story 2.5: Implement Multi-tenant Middleware and Slug Routing

Status: review

## Story

As a **customer**,
I want **to access a store's catalog via its unique URL**,
So that **I see only that store's products and branding**.

## Acceptance Criteria

### AC1: Catalog Access via Slug
**Given** a tenant with slug `perfumaria-elegance` exists
**When** I visit `/perfumaria-elegance`
**Then** the catalog app loads with that tenant's branding
**And** only products belonging to that tenant are shown
**And** the tenant's logo appears in the header

### AC2: 404 for Invalid Slugs
**Given** I visit a non-existent slug `/invalid-store`
**When** the page loads
**Then** a friendly 404 page is displayed
**And** I am not shown any other tenant's data

### AC3: Tenant Context in Middleware
**Given** the middleware processes a request
**When** the tenant is identified
**Then** the `tenant_id` is available in the request context
**And** all database queries are automatically filtered by `tenant_id`

### AC4: Root Path Handling
**Given** I visit the root path `/`
**When** the page loads
**Then** I see a landing page or redirect instruction
**And** no tenant-specific data is exposed

### AC5: Tenant Data in Components
**Given** a valid tenant slug in the URL
**When** components render
**Then** they have access to tenant data (id, name, slug, theme)
**And** the data is available without additional API calls

## Tasks / Subtasks

- [x] **Task 1: Create Tenant Context Provider** (AC: #3, #5)
  - [x] 1.1 Create TenantContext types in catalog lib
  - [x] 1.2 Create TenantProvider component
  - [x] 1.3 Create useTenant and useTenantData hooks
  - [x] 1.4 Create getTenantBySlug service function

- [x] **Task 2: Implement Next.js Middleware** (AC: #1, #3)
  - [x] 2.1 Create middleware.ts in catalog app
  - [x] 2.2 Extract slug from URL path
  - [x] 2.3 Set x-tenant-slug in request headers
  - [x] 2.4 Handle root path and static files

- [x] **Task 3: Create Custom 404 Page** (AC: #2)
  - [x] 3.1 Create apps/catalog/src/app/[slug]/not-found.tsx
  - [x] 3.2 Style with brand-neutral design
  - [x] 3.3 Add "Voltar para início" button

- [x] **Task 4: Update Catalog Layout with Context** (AC: #1, #5)
  - [x] 4.1 Wrap layout with TenantProvider
  - [x] 4.2 Pass full tenant data to provider
  - [x] 4.3 Create CatalogHeader with WhatsApp integration

- [x] **Task 5: Create Landing/Root Page** (AC: #4)
  - [x] 5.1 Update apps/catalog/src/app/page.tsx
  - [x] 5.2 Show instructions and demo store link
  - [x] 5.3 No tenant data exposed

- [x] **Task 6: Test Multi-tenant Routing** (AC: #1-#5)
  - [x] 6.1 Test valid slug routing (HTTP 200)
  - [x] 6.2 Test invalid slug 404
  - [x] 6.3 Test root path landing page
  - [x] 6.4 Test tenant context (ID, WhatsApp URL)

## Dev Notes

### Architecture Compliance

**Source:** [docs/architecture.md#4.1 Isolamento de Dados]
- Todas tabelas sensíveis possuem coluna tenant_id
- Acesso filtrado por políticas no backend/ORM baseadas no slug da URL

### Technical Requirements

| Component | Specification |
|-----------|---------------|
| Middleware | Next.js middleware.ts at app root |
| Context | React Context for tenant data |
| Routing | Dynamic [slug] route |
| 404 | Custom not-found.tsx |

### Tenant Context Interface

```typescript
interface TenantContextValue {
  tenant: {
    id: string;
    slug: string;
    name: string;
    logoUrl: string | null;
    whatsappPrimary: string | null;
    whatsappSecondary: string | null;
  } | null;
  isLoading: boolean;
}
```

### Middleware Flow

```
1. Request to /perfumaria-elegance
2. Middleware extracts slug from path
3. Middleware sets x-tenant-slug header
4. [slug]/layout.tsx fetches tenant by slug
5. TenantProvider wraps children with context
6. Components access tenant via useTenant()
```

### Middleware Implementation

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip API routes and static files
  if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }
  
  // Extract slug (first path segment)
  const slug = pathname.split('/')[1];
  
  if (slug) {
    // Add slug to headers for downstream use
    const headers = new Headers(request.headers);
    headers.set('x-tenant-slug', slug);
    return NextResponse.next({ headers });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### Context Provider Pattern

```tsx
// In [slug]/layout.tsx
const tenant = await getThemeBySlug(slug);

return (
  <TenantProvider tenant={tenant}>
    {children}
  </TenantProvider>
);
```

### 404 Page Design

- Brand-neutral (no tenant colors)
- Clear error message
- "Voltar para início" button
- No sensitive data exposed

### Dependencies

Already in project:
- Next.js (middleware support)
- Theme Engine (getThemeBySlug)
- React Context

### Previous Story Learnings

From Story 2.4:
- Dynamic [slug] route exists at `apps/catalog/src/app/[slug]/`
- `getThemeBySlug` function in `apps/catalog/src/lib/theme.ts`
- ThemeStyle injected in layout for SSR
- Catalog header shows tenant name and logo

### Integration Points

The tenant context will be used by:
- Header (already shows tenant.name, tenant.logoUrl)
- WhatsApp button (needs tenant.whatsappPrimary)
- Product queries (need tenant.id for filtering)
- Analytics (need tenant.id for tracking)

### Project Structure After Implementation

```
apps/catalog/src/
├── middleware.ts                   # Slug extraction
├── app/
│   ├── page.tsx                    # Root landing page
│   └── [slug]/
│       ├── layout.tsx              # TenantProvider wrapper
│       ├── page.tsx                # Catalog page
│       └── not-found.tsx           # 404 page
├── components/
│   └── tenant/
│       └── TenantProvider.tsx      # Context provider
└── lib/
    └── tenant-context.ts           # Context definition
```

### Testing Requirements

1. **Valid Slug Test:** Visit /perfumaria-elegance, verify branding
2. **Invalid Slug Test:** Visit /invalid-store, verify 404
3. **Root Path Test:** Visit /, verify no tenant data
4. **Context Test:** Verify useTenant returns tenant data
5. **Header Test:** Verify WhatsApp button uses tenant.whatsappPrimary

### References

- [Source: docs/architecture.md#4.1 Isolamento de Dados]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.5]
- [Previous: Story 2.4 Theme Engine implementation]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

- Middleware includes 34.2 kB in build
- All routes work correctly
- WhatsApp URL generated with pre-filled message

### Completion Notes List

1. All 6 tasks completed successfully
2. TenantProvider wraps [slug] layout with full tenant data
3. CatalogHeader uses useTenantData() for WhatsApp integration
4. Middleware extracts slug and sets x-tenant-slug header
5. Custom 404 page with brand-neutral design
6. Landing page with demo store link

### File List

- `apps/catalog/src/middleware.ts` - Next.js middleware
- `apps/catalog/src/lib/tenant-context.ts` - TenantData types
- `apps/catalog/src/lib/theme.ts` - Added getTenantBySlug
- `apps/catalog/src/components/tenant/TenantProvider.tsx` - Context provider
- `apps/catalog/src/components/tenant/CatalogHeader.tsx` - Header with WhatsApp
- `apps/catalog/src/app/page.tsx` - Landing page
- `apps/catalog/src/app/[slug]/layout.tsx` - Updated with TenantProvider
- `apps/catalog/src/app/[slug]/page.tsx` - Updated with tenant info
- `apps/catalog/src/app/[slug]/not-found.tsx` - 404 page

