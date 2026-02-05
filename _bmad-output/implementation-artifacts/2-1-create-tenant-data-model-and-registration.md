# Story 2.1: Create Tenant Data Model and Registration

Status: review

## Story

As a **store owner**,
I want **to register my store in the system**,
So that **I have a dedicated space to manage my catalog**.

## Acceptance Criteria

### AC1: Tenant Registration Form
**Given** I am a new store owner
**When** I access the admin registration page
**Then** I can create an account with email and password
**And** I can provide my store name
**And** form validation is applied to all fields

### AC2: Tenant Record Creation
**Given** I submit a valid registration form
**When** the registration is processed
**Then** a new Tenant record is created in the database
**And** a unique slug is generated from my store name
**And** password is securely hashed before storage

### AC3: Unique Slug Generation
**Given** a tenant slug already exists (e.g., "perfumaria-elegance")
**When** I try to register with the same store name
**Then** a unique slug variant is generated (e.g., "perfumaria-elegance-2")

### AC4: Post-Registration Flow
**Given** registration is successful
**When** the tenant record is created
**Then** I am redirected to the onboarding/brand configuration page
**And** a success message is displayed

### AC5: Expanded Tenant Model
**Given** the database schema
**When** I review the Tenant model
**Then** it includes fields for:
- Authentication (email, passwordHash)
- Brand configuration (primaryColor, secondaryColor, logoUrl, borderRadius)
- WhatsApp configuration (whatsappPrimary, whatsappSecondary)
- Status (isActive, onboardingComplete)

## Tasks / Subtasks

- [x] **Task 1: Expand Prisma Tenant Model** (AC: #5)
  - [x] 1.1 Add authentication fields (email, passwordHash)
  - [x] 1.2 Add brand configuration fields (colors, logo, radius)
  - [x] 1.3 Add WhatsApp fields (primary, secondary numbers)
  - [x] 1.4 Add status fields (isActive, onboardingComplete)
  - [x] 1.5 Create and apply migration

- [x] **Task 2: Create Tenant Service** (AC: #2, #3)
  - [x] 2.1 Create `libs/shared/src/services/tenant.service.ts`
  - [x] 2.2 Implement `createTenant()` function
  - [x] 2.3 Implement `generateUniqueSlug()` function
  - [x] 2.4 Implement `hashPassword()` function
  - [x] 2.5 Implement `findTenantByEmail()` function

- [x] **Task 3: Create Registration API Route** (AC: #1, #2, #4)
  - [x] 3.1 Create `apps/admin/src/app/api/auth/register/route.ts`
  - [x] 3.2 Implement POST handler with validation
  - [x] 3.3 Handle errors and return appropriate responses
  - [x] 3.4 Add rate limiting consideration

- [x] **Task 4: Create Registration Page UI** (AC: #1)
  - [x] 4.1 Create `apps/admin/src/app/(auth)/register/page.tsx`
  - [x] 4.2 Build registration form with shadcn/ui components
  - [x] 4.3 Add form validation with Zod
  - [x] 4.4 Handle form submission and errors

- [x] **Task 5: Create Auth Layout** (AC: #4)
  - [x] 5.1 Create `apps/admin/src/app/(auth)/layout.tsx`
  - [x] 5.2 Style centered auth layout
  - [x] 5.3 Add navigation to login page

- [x] **Task 6: Verify Registration Flow** (AC: #1, #2, #3, #4)
  - [x] 6.1 Test form validation
  - [x] 6.2 Test tenant creation in database
  - [x] 6.3 Test unique slug generation
  - [x] 6.4 Test redirect after registration

## Dev Notes

### Architecture Compliance

**Source:** [docs/architecture.md#4. Multi-tenancy & Whitelabel]
- Isolamento em Nível de Aplicação
- Todas as tabelas sensíveis possuem coluna tenant_id
- Acesso filtrado por contexto do lojista logado ou slug da URL

**Source:** [docs/architecture.md#4.2 Engine de Temas Dinâmicos]
- Lojista define cores e logos no admin
- App catalog busca dados via slug

### Technical Requirements

| Component | Specification |
|-----------|---------------|
| Password Hashing | bcrypt with salt rounds 12 |
| Slug Generation | slugify with lowercase, dash separator |
| Validation | Zod schemas |
| Form | React Hook Form + Zod resolver |

### Expanded Tenant Schema

```prisma
model Tenant {
  id        String   @id @default(uuid())
  
  // Core Identity
  slug      String   @unique
  name      String
  
  // Authentication
  email         String   @unique
  passwordHash  String
  
  // Brand Configuration
  logoUrl       String?
  primaryColor  String   @default("#0f172a")
  secondaryColor String  @default("#64748b")
  borderRadius  String   @default("0.5rem")
  
  // WhatsApp Configuration
  whatsappPrimary   String?
  whatsappSecondary String?
  
  // Status
  isActive          Boolean @default(true)
  onboardingComplete Boolean @default(false)
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Future relations
  // products  Product[]
  // analytics AnalyticsEvent[]

  @@index([slug])
  @@index([email])
}
```

### Slug Generation Algorithm

```typescript
import slugify from 'slugify';

async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = slugify(name, { lower: true, strict: true });
  
  let slug = baseSlug;
  let counter = 1;
  
  while (await prisma.tenant.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}
```

### Registration Form Fields

| Field | Type | Validation |
|-------|------|------------|
| storeName | string | Required, min 3, max 100 chars |
| email | string | Required, valid email format |
| password | string | Required, min 8 chars, complexity rules |
| confirmPassword | string | Must match password |

### API Response Format

```typescript
// Success Response
{
  success: true,
  data: {
    id: string,
    slug: string,
    name: string,
    email: string
  }
}

// Error Response
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: object
  }
}
```

### Dependencies to Install

```bash
npm install bcryptjs slugify zod react-hook-form @hookform/resolvers
npm install -D @types/bcryptjs
```

### Previous Story Learnings

From Epic 1:
- Prisma schema at `libs/database/prisma/schema.prisma`
- Basic Tenant model with id, slug, name exists
- shadcn/ui Button and Card components available
- Admin app at `apps/admin/` with Tailwind configured

### Project Structure After Implementation

```
apps/admin/src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx          # Auth layout
│   │   └── register/
│   │       └── page.tsx        # Registration page
│   └── api/
│       └── auth/
│           └── register/
│               └── route.ts    # Registration API
libs/shared/src/
├── services/
│   └── tenant.service.ts       # Tenant business logic
├── schemas/
│   └── tenant.schema.ts        # Zod validation schemas
└── index.ts
```

### Testing Requirements

1. **Form Validation Test:** All fields validate correctly
2. **API Test:** POST /api/auth/register creates tenant
3. **Slug Test:** Duplicate names generate unique slugs
4. **Password Test:** Passwords are hashed correctly
5. **Database Test:** Tenant record persists correctly

### References

- [Source: docs/architecture.md#4. Multi-tenancy & Whitelabel]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1]
- [Prisma: libs/database/prisma/schema.prisma]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

- PostgreSQL local (Homebrew postgresql@14) was running on same port as Docker, causing P1010 access denied errors
- Fixed by stopping local PostgreSQL: `brew services stop postgresql@14`
- tsconfig.lib.json needed `noEmit: false` to generate JS files during build

### Completion Notes List

1. All 6 tasks completed successfully
2. Tenant model expanded with auth, brand, and whatsapp fields
3. Migration applied manually due to Prisma P1010 error (same as Epic 1)
4. Registration API tested and working with all validation scenarios
5. Unique slug generation working (e.g., "perfumaria-elegance-1")

### File List

- `libs/database/prisma/schema.prisma` - Expanded Tenant model
- `libs/database/prisma/migrations/20260202000002_add_tenant_auth_brand_whatsapp/migration.sql` - Migration file
- `libs/shared/src/schemas/tenant.schema.ts` - Zod validation schemas
- `libs/shared/src/services/tenant.service.ts` - Tenant business logic
- `libs/shared/src/index.ts` - Updated exports
- `apps/admin/src/app/api/auth/register/route.ts` - Registration API endpoint
- `apps/admin/src/app/(auth)/layout.tsx` - Auth layout
- `apps/admin/src/app/(auth)/register/page.tsx` - Registration page
- `apps/admin/src/app/onboarding/page.tsx` - Onboarding placeholder page
- `apps/admin/src/components/ui/input.tsx` - shadcn/ui Input component
- `apps/admin/src/components/ui/label.tsx` - shadcn/ui Label component
- `apps/admin/tsconfig.json` - Added @cms/* path aliases
- `libs/database/tsconfig.lib.json` - Added noEmit: false
- `libs/shared/tsconfig.lib.json` - Added noEmit: false

