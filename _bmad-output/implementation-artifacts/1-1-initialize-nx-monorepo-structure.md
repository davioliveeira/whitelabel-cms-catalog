# Story 1.1: Initialize Nx Monorepo Structure

Status: review

## Story

As a **developer**,
I want **a pre-configured Nx monorepo with the base folder structure**,
So that **I can start building applications with shared libraries and consistent tooling**.

## Acceptance Criteria

### AC1: Monorepo Structure Exists
**Given** a fresh clone of the repository
**When** I open the project
**Then** the following structure exists:
- `apps/admin/` - Next.js admin app skeleton
- `apps/catalog/` - Next.js catalog app skeleton
- `libs/ui/` - Shared UI components library
- `libs/database/` - Database schema library
- `libs/shared/` - Shared utilities library
- `libs/theme-engine/` - Theme injection library

### AC2: Nx Configuration Valid
**Given** the Nx workspace
**When** I check the configuration
**Then** `nx.json` is properly configured with:
- `@nx/next` plugin enabled
- Build, dev, start, and lint targets configured
- Project graph correctly detecting all apps and libs

### AC3: TypeScript Path Aliases Configured
**Given** the TypeScript configuration
**When** I review `tsconfig.base.json`
**Then** path aliases exist for all libs:
- `@cms/ui` → `libs/ui/src/index.ts`
- `@cms/database` → `libs/database/src/index.ts`
- `@cms/shared` → `libs/shared/src/index.ts`
- `@cms/theme-engine` → `libs/theme-engine/src/index.ts`

### AC4: Apps Can Import from Libs
**Given** the admin or catalog app
**When** I import from a lib (e.g., `import { Button } from '@cms/ui'`)
**Then** TypeScript resolves the import without errors
**And** the build succeeds

## Tasks / Subtasks

- [x] **Task 1: Initialize Nx Workspace** (AC: #1, #2)
  - [x] 1.1 Create new Nx workspace with Next.js preset
  - [x] 1.2 Configure `nx.json` with proper defaults
  - [x] 1.3 Verify Nx CLI commands work (`nx graph`, `nx show projects`)

- [x] **Task 2: Create Next.js Applications** (AC: #1)
  - [x] 2.1 Generate `admin` Next.js app with App Router
  - [x] 2.2 Generate `catalog` Next.js app with App Router
  - [x] 2.3 Verify both apps start with `nx serve admin` and `nx serve catalog`

- [x] **Task 3: Create Shared Libraries** (AC: #1, #3)
  - [x] 3.1 Generate `libs/ui` React library for UI components
  - [x] 3.2 Generate `libs/database` TypeScript library for Prisma schema
  - [x] 3.3 Generate `libs/shared` TypeScript library for utilities
  - [x] 3.4 Generate `libs/theme-engine` React library for theme injection

- [x] **Task 4: Configure Path Aliases** (AC: #3, #4)
  - [x] 4.1 Update `tsconfig.base.json` with `@cms/*` path aliases
  - [x] 4.2 Ensure all libs export from `src/index.ts`
  - [x] 4.3 Test import resolution in both apps

- [x] **Task 5: Verify Project Graph** (AC: #2)
  - [x] 5.1 Run `nx graph` and verify all projects appear
  - [x] 5.2 Verify dependency relationships are correct
  - [x] 5.3 Test `nx affected` works correctly

## Dev Notes

### Architecture Compliance

**Source:** [docs/architecture.md#3. Estrutura do Monorepo (Nx)]

The project MUST follow this exact structure:
```
/
├── apps/
│   ├── admin/          # CMS para o Lojista
│   └── catalog/        # Vitrine do Cliente
├── libs/
│   ├── ui/             # Design System
│   ├── database/       # Schema Prisma
│   ├── shared/         # Utilitários
│   └── theme-engine/   # Injeção de temas
├── docker/             # Dockerfiles (future story)
├── Makefile            # Automação (future story)
└── docker-compose.yml  # Serviços (future story)
```

### Technical Requirements

| Technology | Version | Source |
|------------|---------|--------|
| Nx | Latest (20.x+) | ARCH-01 |
| Next.js | 14+ | ARCH-01, architecture.md |
| TypeScript | 5.x | architecture.md |
| Node.js | 20 LTS | Best practice |

### Library Specifications

| Library | Purpose | Exports |
|---------|---------|---------|
| `@cms/ui` | Shared UI components (shadcn/ui base) | Components, hooks |
| `@cms/database` | Prisma schema, client, migrations | `prisma`, types |
| `@cms/shared` | Utilities, types, WhatsApp logic | Utils, types |
| `@cms/theme-engine` | CSS variable injection for whitelabel | `ThemeProvider`, hooks |

### Commands Reference

```bash
# Create workspace (if starting fresh)
npx create-nx-workspace@latest cms-catalogo-white-label --preset=next

# Generate Next.js apps
nx g @nx/next:app admin --directory=apps/admin --appDir=true
nx g @nx/next:app catalog --directory=apps/catalog --appDir=true

# Generate libraries
nx g @nx/react:library ui --directory=libs/ui --buildable
nx g @nx/js:library database --directory=libs/database --buildable
nx g @nx/js:library shared --directory=libs/shared --buildable
nx g @nx/react:library theme-engine --directory=libs/theme-engine --buildable

# Verify setup
nx graph
nx show projects
nx serve admin
nx serve catalog
```

### Path Aliases Configuration

**File:** `tsconfig.base.json`

```json
{
  "compilerOptions": {
    "paths": {
      "@cms/ui": ["libs/ui/src/index.ts"],
      "@cms/database": ["libs/database/src/index.ts"],
      "@cms/shared": ["libs/shared/src/index.ts"],
      "@cms/theme-engine": ["libs/theme-engine/src/index.ts"]
    }
  }
}
```

### Project Structure Notes

- Each app uses Next.js 14+ with App Router (`app/` directory, not `pages/`)
- Libraries should be buildable for better caching
- Use `@cms/` namespace for all internal imports
- Do NOT use relative imports between apps and libs

### Testing Requirements

1. **Build Test:** `nx build admin` and `nx build catalog` must succeed
2. **Import Test:** Create a simple component in `@cms/ui` and import in both apps
3. **Graph Test:** `nx graph` must show correct dependency arrows

### References

- [Source: docs/architecture.md#3. Estrutura do Monorepo (Nx)]
- [Source: docs/architecture.md#2. Stack Tecnológica Core]
- [Source: docs/front-end-architecture.md#1. Tech Stack]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

- Initial .next cache issue resolved by removing cache folders and adding .gitignore

### Completion Notes List

- ✅ Initialized Nx workspace v22.4.4 in existing repository
- ✅ Installed @nx/next, @nx/react, @nx/js plugins
- ✅ Generated admin Next.js 16.0.11 app with App Router
- ✅ Generated catalog Next.js 16.0.11 app with App Router
- ✅ Generated libs/ui React library with rollup bundler
- ✅ Generated libs/database TypeScript library
- ✅ Generated libs/shared TypeScript library
- ✅ Generated libs/theme-engine React library
- ✅ Configured @cms/* path aliases in tsconfig.base.json
- ✅ Tested import resolution with `import { Ui } from '@cms/ui'` in both apps
- ✅ Both apps build successfully: `nx build admin` and `nx build catalog`
- ✅ Project graph shows 7 projects: admin, catalog, ui, database, shared, theme-engine, cms-catalogo-white-label

### File List

**Created:**
- package.json
- nx.json
- tsconfig.base.json
- .gitignore
- .prettierrc
- .prettierignore
- eslint.config.mjs
- apps/admin/ (Next.js app with App Router)
- apps/catalog/ (Next.js app with App Router)
- libs/ui/ (React component library)
- libs/database/ (TypeScript library)
- libs/shared/ (TypeScript library)
- libs/theme-engine/ (React component library)

**Modified:**
- apps/admin/src/app/page.tsx (added @cms/ui import test)
- apps/catalog/src/app/page.tsx (added @cms/ui import test)
