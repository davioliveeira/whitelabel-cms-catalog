# Story 2.4: Build Theme Engine for Dynamic CSS Variables

Status: review

## Story

As a **developer**,
I want **a Theme Engine that injects tenant colors as CSS variables**,
So that **the catalog renders with the correct brand colors without rebuild**.

## Acceptance Criteria

### AC1: Theme Engine Fetches Tenant Settings
**Given** a tenant has configured their brand colors
**When** a user visits the catalog at `/[slug]`
**Then** the Theme Engine fetches tenant settings from database
**And** the settings are loaded before the page renders

### AC2: CSS Variables Injection
**Given** tenant settings are loaded
**When** the Theme Engine initializes
**Then** CSS variables are injected into `:root`:
  - `--primary: {tenant.primaryColor}`
  - `--secondary: {tenant.secondaryColor}`
  - `--radius: {tenant.borderRadius}`
**And** all UI components use these CSS variables

### AC3: Theme Updates Without Cache Issues
**Given** the tenant updates their colors in the admin panel
**When** a user refreshes the catalog
**Then** the new colors are applied immediately
**And** no stale colors are shown

### AC4: Server-Side Theme Injection
**Given** a request to the catalog app
**When** the page is server-rendered
**Then** CSS variables are included in the initial HTML
**And** no flash of unstyled content (FOUC) occurs

### AC5: Fallback to Default Theme
**Given** a tenant without configured colors
**When** the Theme Engine initializes
**Then** default theme values are used
**And** the catalog renders correctly

## Tasks / Subtasks

- [x] **Task 1: Create Theme Provider Component** (AC: #1, #2, #4)
  - [x] 1.1 Create `ThemeProvider` component in theme-engine lib
  - [x] 1.2 Implement CSS variable injection via inline styles
  - [x] 1.3 Add server-side rendering support (ThemeStyle)
  - [x] 1.4 Export ThemeProvider from lib index

- [x] **Task 2: Create Theme API Endpoint** (AC: #1, #3)
  - [x] 2.1 Create `GET /api/theme/[slug]` in catalog app
  - [x] 2.2 Fetch tenant brand settings by slug
  - [x] 2.3 Add Cache-Control headers for performance
  - [x] 2.4 Handle tenant not found

- [x] **Task 3: Create Theme Types and Utilities** (AC: #2, #5)
  - [x] 3.1 Define ThemeConfig type interface
  - [x] 3.2 Create default theme constants
  - [x] 3.3 Create CSS variable mapping utility
  - [x] 3.4 Add hex color validation

- [x] **Task 4: Integrate Theme into Catalog Layout** (AC: #1, #4)
  - [x] 4.1 Create [slug] dynamic route with ThemeStyle
  - [x] 4.2 Pass tenant theme to provider
  - [x] 4.3 Configure path aliases for theme-engine lib

- [x] **Task 5: Create Theme Demo Page** (AC: #2, #3)
  - [x] 5.1 Create demo page showing theme variables
  - [x] 5.2 Display themed UI components
  - [x] 5.3 Show current theme values

- [x] **Task 6: Test Theme Engine** (AC: #1-#5)
  - [x] 6.1 Test theme loading by slug
  - [x] 6.2 Test CSS variable injection
  - [x] 6.3 Test fallback theme (invalid slug returns 404)
  - [x] 6.4 Test server-side rendering (CSS in HTML)

## Dev Notes

### Architecture Compliance

**Source:** [docs/architecture.md#4.2 Engine de Temas Dinâmicos]
- Lojista define cores e logos no admin
- App catalog busca dados via slug
- Valores aplicados no :root do CSS via variáveis Tailwind

### Technical Requirements

| Component | Specification |
|-----------|---------------|
| CSS Variables | `--primary`, `--secondary`, `--radius` |
| Injection Method | Inline style on `:root` or `<html>` |
| SSR Support | Variables in initial HTML response |
| Cache Strategy | Short TTL with revalidation |

### Theme Configuration Interface

```typescript
interface ThemeConfig {
  primaryColor: string;    // Hex color (#RRGGBB)
  secondaryColor: string;  // Hex color (#RRGGBB)
  borderRadius: string;    // CSS value (0rem, 0.5rem, etc.)
  logoUrl?: string | null; // Optional logo URL
}

const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#0f172a',
  secondaryColor: '#64748b',
  borderRadius: '0.5rem',
  logoUrl: null,
};
```

### CSS Variables Mapping

```typescript
const cssVariables = {
  '--primary': theme.primaryColor,
  '--secondary': theme.secondaryColor,
  '--radius': theme.borderRadius,
};
```

### ThemeProvider Implementation Pattern

```tsx
// Server Component version (preferred for SSR)
export async function ThemeProvider({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const theme = await getThemeBySlug(slug);
  
  return (
    <html style={cssVariablesStyle(theme)}>
      {children}
    </html>
  );
}

// Or inject via <style> tag for layout usage
export function ThemeStyle({ theme }: { theme: ThemeConfig }) {
  return (
    <style>{`
      :root {
        --primary: ${theme.primaryColor};
        --secondary: ${theme.secondaryColor};
        --radius: ${theme.borderRadius};
      }
    `}</style>
  );
}
```

### API Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/theme/[slug]` | Get theme by tenant slug |

### Response Format

```json
{
  "success": true,
  "data": {
    "primaryColor": "#dc2626",
    "secondaryColor": "#facc15",
    "borderRadius": "1rem",
    "logoUrl": "/uploads/tenant-id/logo.png",
    "name": "Store Name"
  }
}
```

### Tailwind Integration

The theme variables should integrate with Tailwind CSS:

```css
/* In globals.css or tailwind config */
:root {
  --primary: #0f172a;
  --secondary: #64748b;
  --radius: 0.5rem;
}

/* Usage in components */
.btn-primary {
  background-color: var(--primary);
  border-radius: var(--radius);
}
```

### Dependencies

Already in project:
- Next.js (App Router with Server Components)
- Tailwind CSS
- Prisma (for database access)

### Previous Story Learnings

From Stories 2.1-2.3:
- Tenant model has brand fields (primaryColor, secondaryColor, borderRadius, logoUrl)
- `findTenantBySlug` function exists in tenant.service.ts
- Catalog app runs on port 3001

### Project Structure After Implementation

```
libs/theme-engine/src/
├── index.ts                    # Exports
├── types/
│   └── theme.types.ts          # ThemeConfig interface
├── constants/
│   └── default-theme.ts        # Default theme values
├── utils/
│   └── css-variables.ts        # CSS variable mapping
└── components/
    └── ThemeProvider.tsx       # Theme injection component

apps/catalog/src/
├── app/
│   ├── api/
│   │   └── theme/
│   │       └── [slug]/
│   │           └── route.ts    # GET theme by slug
│   ├── [slug]/
│   │   └── page.tsx            # Catalog page (uses theme)
│   └── layout.tsx              # Root layout (wraps with theme)
```

### Testing Requirements

1. **Slug Fetch Test:** Request `/api/theme/perfumaria-elegance`, verify colors
2. **Invalid Slug Test:** Request `/api/theme/invalid`, verify 404
3. **CSS Injection Test:** Verify `--primary` variable in rendered HTML
4. **Default Theme Test:** New tenant without colors uses defaults
5. **SSR Test:** Verify no FOUC on page load

### References

- [Source: docs/architecture.md#4.2 Engine de Temas Dinâmicos]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.4]
- [Prisma: libs/database/prisma/schema.prisma#Brand Configuration]
- [Existing: libs/theme-engine/src/lib/theme-engine.tsx]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

- Removed placeholder files from libs/theme-engine/src/lib/
- Build completes successfully for both theme-engine lib and catalog app
- CSS variables verified in HTML response

### Completion Notes List

1. All 6 tasks completed successfully
2. Created ThemeConfig types, DEFAULT_THEME constants, CSS utilities
3. Created ThemeStyle (SSR) and ThemeProvider (client) components
4. API endpoint with Cache-Control headers for performance
5. Dynamic [slug] route with header, footer and demo page
6. Server-side CSS injection (no FOUC)

### File List

**libs/theme-engine/src/**
- `index.ts` - Public exports
- `types/theme.types.ts` - ThemeConfig, CSSVariables, ThemeApiResponse
- `constants/default-theme.ts` - DEFAULT_THEME
- `utils/css-variables.ts` - themeToCSSVariables, generateRootCSS, etc.
- `components/ThemeStyle.tsx` - SSR <style> injection
- `components/ThemeProvider.tsx` - Client provider with context

**apps/catalog/src/**
- `app/api/theme/[slug]/route.ts` - GET theme API
- `app/[slug]/layout.tsx` - Tenant layout with header/footer
- `app/[slug]/page.tsx` - Catalog page with theme demo
- `lib/theme.ts` - getThemeBySlug service
- `app/global.css` - Updated with hex CSS variables
- `tsconfig.json` - Added @cms/* path aliases

