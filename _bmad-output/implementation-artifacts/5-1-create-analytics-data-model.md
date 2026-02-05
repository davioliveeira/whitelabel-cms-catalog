# Story 5.1: Create Analytics Data Model

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **a data model to track product interactions**,
so that **analytics data can be stored and queried efficiently**.

## Acceptance Criteria

1. **AC1: Analytics model schema**
   - **Given** the database schema
   - **When** I review the Analytics model
   - **Then** it contains the following fields:
     - `id` (UUID, primary key)
     - `tenant_id` (UUID, foreign key to Tenant)
     - `product_id` (UUID, foreign key to Product)
     - `event_type` (enum: `view`, `whatsapp_click`)
     - `created_at` (timestamp)
     - `user_agent` (string, optional)
     - `referrer` (string, optional)
   - **And** indexes exist on `tenant_id`, `product_id`, `created_at`
   - **And** the model supports high-volume inserts

## Tasks / Subtasks

- [ ] **Task 1: Add AnalyticsEvent model to Prisma schema** (AC: #1)
  - [ ] 1.1 Define model with id, tenantId, productId, eventType, createdAt, userAgent?, referrer?
  - [ ] 1.2 Add relation Tenant → analyticsEvents (one-to-many)
  - [ ] 1.3 Add relation Product → analyticsEvents (one-to-many)
  - [ ] 1.4 Define enum EventType: VIEW, WHATSAPP_CLICK
  - [ ] 1.5 Add @@index([tenantId]), @@index([productId]), @@index([createdAt])
- [ ] **Task 2: Uncomment Tenant.analytics relation** (AC: #1)
  - [ ] 2.1 In schema.prisma Tenant model, uncomment `analyticsEvents AnalyticsEvent[]`
- [ ] **Task 3: Create and run migration** (AC: #1)
  - [ ] 3.1 Run `npx prisma migrate dev --name add-analytics-event-model`
  - [ ] 3.2 Verify migration applies and Prisma Client regenerates
- [ ] **Task 4: Export types and ensure high-volume readiness** (AC: #1)
  - [ ] 4.1 Ensure libs/database exports new model types
  - [ ] 4.2 Document that batch inserts / async writes are for a later story (API)

## Dev Notes

- Relevant architecture patterns and constraints
- Source tree components to touch
- Testing standards summary

### Project Structure Notes

- **Schema location:** `libs/database/prisma/schema.prisma` — add model here only; do not create new schema files.
- **Exports:** Types come from `@repo/database` (Prisma Client); no extra barrel needed beyond existing database lib exports.
- **Naming:** Use Prisma convention: model `AnalyticsEvent`, enum `EventType`; DB table will be `AnalyticsEvent` (PascalCase per Prisma default) or use `@@map("analytics_events")` if snake_case is required by policy (current project uses PascalCase tables).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 5 - Story 5.1]
- [Source: docs/architecture.md#2 Stack, #4 Multi-tenancy]
- [Source: libs/database/prisma/schema.prisma]

---

## Developer Context (Guardrails)

### Technical Requirements

| Requirement | Detail |
|-------------|--------|
| **ORM** | Prisma (existing); add model in `libs/database/prisma/schema.prisma` |
| **DB** | PostgreSQL 16; use existing `datasource db` and `generator client` |
| **Multi-tenancy** | Every analytics row MUST have `tenant_id`; all queries MUST filter by `tenant_id` |
| **Relations** | `AnalyticsEvent` belongs to `Tenant` and `Product`; use `onDelete: Cascade` for Product (optional: restrict if business rule is to keep events when product deleted — epics say FK to product; recommend Cascade so deleting product cleans events) |
| **Event type** | Enum with exactly `view` and `whatsapp_click` (map to Prisma enum VIEW, WHATSAPP_CLICK) |
| **High-volume** | Indexes on tenant_id, product_id, created_at; avoid unnecessary unique constraints; no heavy JSON in this model |
| **Timestamps** | Use `created_at` only (no updated_at) for event tables |

### Architecture Compliance

- **ARCH-02:** PostgreSQL 16 + Prisma — add model and migration only; no new DB or ORM.
- **ARCH-07:** Isolamento via `tenant_id` — `AnalyticsEvent` MUST have `tenantId` and it MUST be used in all future queries (this story is schema only; query patterns in Story 5.2).
- **docs/architecture.md §4.1:** "Todas as tabelas sensíveis (products, analytics) possuem coluna tenant_id" — ensure `tenant_id` on AnalyticsEvent.
- **Existing schema:** Tenant has commented `// analytics AnalyticsEvent[]` — uncomment and replace with correct relation name after adding `AnalyticsEvent` model. Product model: add `analyticsEvents AnalyticsEvent[]` relation.

### Library / Framework Requirements

- **Prisma:** Use current project version; no new dependencies.
- **TypeScript:** Types from `Prisma.AnalyticsEvent`, `Prisma.EventType` after generate.
- **Migrations:** Use `prisma migrate dev` for local/dev; do not use `db push` for this story (proper migration required).

### File Structure Requirements

- **Modify only:** `libs/database/prisma/schema.prisma`
- **Generated (do not edit):** `libs/database/prisma/migrations/<timestamp>_add_analytics_event_model/` (after migration)
- **Re-export:** Prisma Client is already exported from `libs/database`; regenerating client is enough; no new public API file required unless project has explicit analytics types barrel.

### Testing Requirements

- **Schema / migration:** After migration, run `npx prisma validate` and `npx prisma generate`; confirm no errors.
- **Smoke test:** From app or a small script, create one `AnalyticsEvent` record (tenant + product existing), then query by tenant_id; confirm row exists and relations load.
- **No unit tests required** for schema-only change unless project mandates tests for every migration (then one test: create event and assert fields).

---

## Previous Story Intelligence

**From Story 4.6 (Implement Catalog Performance Optimizations):**

- **Codebase:** `apps/catalog/next.config.js`, `ProductCard.tsx`, `libs/shared/src/services/product.service.ts` — product and catalog are stable; analytics will be consumed by catalog (views/clicks) and admin (dashboard). Schema must support filtering by `tenant_id` and `product_id` and time ranges (`created_at`).
- **Patterns:** Prisma schema uses `@@index([tenantId, isAvailable])` on Product; follow same pattern for AnalyticsEvent: indexes on `tenantId`, `productId`, `createdAt` for dashboard queries (Story 5.3, 5.4).
- **Learnings:** No new npm packages for this story; Prisma + PostgreSQL only. Keep schema minimal to avoid migration churn later.

**From Epic 4 (Click-to-WhatsApp, Performance):**

- Events to track: product **view** (e.g. when card becomes visible) and **whatsapp_click** (when user clicks "Pedir Agora"). Story 5.2 will add API; this story only adds the model and migration.

---

## Project Context Reference

- **Monorepo:** Nx; database lib is `libs/database`; apps are `apps/admin`, `apps/catalog`.
- **Conventions:** Prisma models PascalCase; relations named in camelCase (e.g. `analyticsEvents`). Use `@map`/`@@map` only if project uses snake_case for DB (current schema does not).
- **Environment:** `DATABASE_URL` in `.env`; migrations run via `make db-migrate` or `npx prisma migrate dev`.

---

## Story Completion Status

- **Status:** ready-for-dev
- **Completion note:** Ultimate context engine analysis completed — comprehensive developer guide created. Schema-only story; implementation is add model, relations, enum, indexes, and one migration; then validate and smoke-test insert/query.

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
