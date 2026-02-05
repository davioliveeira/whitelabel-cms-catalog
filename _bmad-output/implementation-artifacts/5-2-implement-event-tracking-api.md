# Story 5.2: Implement Event Tracking API

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **API endpoints to record analytics events**,
so that **product views and clicks are tracked**.

## Acceptance Criteria

1. **AC1: View event tracking**
   - **Given** a customer views a product in the catalog
   - **When** the product card becomes visible
   - **Then** a `view` event is recorded via `POST /api/analytics`
   - **And** the event includes `tenant_id` and `product_id`

2. **AC2: WhatsApp click tracking**
   - **Given** a customer clicks the WhatsApp button
   - **When** the click occurs
   - **Then** a `whatsapp_click` event is recorded
   - **And** the event is tracked before opening WhatsApp

3. **AC3: High traffic handling**
   - **Given** high traffic to the catalog
   - **When** many events are triggered
   - **Then** events are batched/debounced to prevent excessive API calls
   - **And** the system handles bursts without data loss

## Tasks / Subtasks

- [ ] **Task 1: Create analytics service** (AC: #1, #2, #3)
  - [ ] 1.1 Create `libs/shared/src/services/analytics.service.ts`
  - [ ] 1.2 Implement `recordEvent(tenantId, productId, eventType, metadata?)` function
  - [ ] 1.3 Add multi-tenancy filtering (always include tenantId)
  - [ ] 1.4 Add error handling for invalid productId/tenantId
  - [ ] 1.5 Export service from libs/shared

- [ ] **Task 2: Create POST /api/analytics endpoint** (AC: #1, #2)
  - [ ] 2.1 Create `apps/catalog/src/app/api/analytics/route.ts`
  - [ ] 2.2 Accept JSON body: `{ tenantId, productId, eventType, userAgent?, referrer? }`
  - [ ] 2.3 Validate required fields (tenantId, productId, eventType)
  - [ ] 2.4 Validate eventType is 'view' or 'whatsapp_click'
  - [ ] 2.5 Call analytics.service.recordEvent()
  - [ ] 2.6 Return 201 on success, appropriate error codes on failure
  - [ ] 2.7 Add CORS headers if needed for public catalog
  - [ ] 2.8 Add rate limiting middleware (optional: use Redis)

- [ ] **Task 3: Implement client-side view tracking** (AC: #1, #3)
  - [ ] 3.1 Create `apps/catalog/src/hooks/useViewTracking.ts`
  - [ ] 3.2 Use Intersection Observer API to detect product visibility
  - [ ] 3.3 Debounce view events (1 event per product per session)
  - [ ] 3.4 Call POST /api/analytics with eventType: 'view'
  - [ ] 3.5 Include userAgent and referrer from browser
  - [ ] 3.6 Handle offline/error scenarios gracefully

- [ ] **Task 4: Integrate view tracking in ProductCard** (AC: #1)
  - [ ] 4.1 Add useViewTracking hook to ProductCard component
  - [ ] 4.2 Pass tenantId and productId to hook
  - [ ] 4.3 Ensure tracking fires only when product enters viewport
  - [ ] 4.4 Test that multiple products track independently

- [ ] **Task 5: Implement WhatsApp click tracking** (AC: #2, #3)
  - [ ] 5.1 Update `apps/catalog/src/lib/whatsapp.ts` openWhatsApp function
  - [ ] 5.2 Add optional callback parameter for tracking
  - [ ] 5.3 Call POST /api/analytics with eventType: 'whatsapp_click' before window.open
  - [ ] 5.4 Use async/await with timeout to avoid blocking WhatsApp open
  - [ ] 5.5 Open WhatsApp even if tracking fails (fire-and-forget)

- [ ] **Task 6: Add client-side batching/debouncing** (AC: #3)
  - [ ] 6.1 Create event queue in useViewTracking
  - [ ] 6.2 Batch multiple view events into single API call if < 100ms apart
  - [ ] 6.3 Limit to 1 view event per product per session (use sessionStorage)
  - [ ] 6.4 Add exponential backoff for failed requests

- [ ] **Task 7: Write tests** (AC: All)
  - [ ] 7.1 Unit tests for analytics.service.ts (recordEvent, multi-tenancy)
  - [ ] 7.2 API route tests (POST /api/analytics success/error cases)
  - [ ] 7.3 Integration test: view event creates DB record
  - [ ] 7.4 Integration test: whatsapp_click event creates DB record
  - [ ] 7.5 Test debouncing logic in useViewTracking
  - [ ] 7.6 Test error handling when API fails

## Dev Notes

- Relevant architecture patterns and constraints
- Source tree components to touch
- Testing standards summary

### Project Structure Notes

- **API Route:** `apps/catalog/src/app/api/analytics/route.ts` — Next.js App Router API route
- **Service:** `libs/shared/src/services/analytics.service.ts` — shared service for analytics logic
- **Hook:** `apps/catalog/src/hooks/useViewTracking.ts` — React hook for Intersection Observer
- **Existing:** `apps/catalog/src/lib/whatsapp.ts` — enhance openWhatsApp() to track clicks
- **Component:** `apps/catalog/src/components/catalog/ProductCard.tsx` — integrate useViewTracking

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 5 - Story 5.2]
- [Source: _bmad-output/implementation-artifacts/5-1-create-analytics-data-model.md]
- [Source: docs/architecture.md#4 Multi-tenancy, #7 Performance]
- [Source: apps/catalog/src/lib/whatsapp.ts]
- [Source: apps/catalog/src/components/catalog/ProductCard.tsx]

---

## Developer Context (Guardrails)

### Technical Requirements

| Requirement | Detail |
|-------------|--------|
| **API Framework** | Next.js 14+ App Router; create route.ts in `apps/catalog/src/app/api/analytics/` |
| **HTTP Method** | POST /api/analytics; accept JSON body with tenantId, productId, eventType |
| **Service Layer** | Create `libs/shared/src/services/analytics.service.ts` for reusable logic |
| **Database** | Use Prisma Client from `@repo/database`; insert into `AnalyticsEvent` table |
| **Multi-tenancy** | ALWAYS filter by `tenantId`; validate that tenantId exists in Tenant table |
| **Event Types** | Accept only `view` or `whatsapp_click`; reject other values with 400 |
| **Metadata** | Optional: userAgent (string), referrer (string) from browser |
| **Client-side** | Use Intersection Observer API for view tracking; debounce to prevent spam |
| **Batching** | Implement client-side debouncing (e.g., 1 view per product per session) |
| **Error Handling** | Tracking failures must NOT break user experience; fire-and-forget pattern |

### Architecture Compliance

- **ARCH-02:** PostgreSQL + Prisma — use existing Prisma Client; no new DB connections
- **ARCH-07:** Multi-tenancy — all queries MUST filter by `tenant_id`; validate tenant exists
- **docs/architecture.md §4.1:** Isolamento via `tenant_id` — ensure every AnalyticsEvent has valid tenantId
- **Story 5.1:** AnalyticsEvent model exists with fields: id, tenantId, productId, eventType, createdAt, userAgent?, referrer?
- **Epic 4 patterns:** WhatsApp integration in `apps/catalog/src/lib/whatsapp.ts`; ProductCard in `apps/catalog/src/components/catalog/ProductCard.tsx`

### Library / Framework Requirements

- **Next.js API Routes:** Use `export async function POST(request: Request)` pattern
- **Prisma:** `await prisma.analyticsEvent.create({ data: { ... } })`
- **React Hooks:** Create custom hook `useViewTracking` with Intersection Observer
- **Intersection Observer:** Detect when ProductCard enters viewport (>50% visible)
- **Debouncing:** Use sessionStorage to track viewed products; prevent duplicate events
- **No new dependencies:** Use built-in browser APIs (Intersection Observer, fetch); no axios/lodash required

### File Structure Requirements

- **Create:** `libs/shared/src/services/analytics.service.ts` — core service logic
- **Create:** `apps/catalog/src/app/api/analytics/route.ts` — API endpoint
- **Create:** `apps/catalog/src/hooks/useViewTracking.ts` — React hook for view tracking
- **Modify:** `apps/catalog/src/lib/whatsapp.ts` — add tracking to openWhatsApp()
- **Modify:** `apps/catalog/src/components/catalog/ProductCard.tsx` — integrate useViewTracking
- **Tests:** `__tests__/services/analytics.service.test.ts`, `__tests__/api/analytics.test.ts`, `__tests__/hooks/useViewTracking.test.ts`

### Testing Requirements

- **Unit tests:** analytics.service.ts — test recordEvent() with valid/invalid inputs, multi-tenancy
- **API route tests:** Test POST /api/analytics with valid/invalid payloads, check status codes
- **Integration tests:** Create event via API, verify DB record exists with correct tenantId/productId
- **Hook tests:** Mock Intersection Observer, verify debouncing logic, sessionStorage usage
- **E2E test (optional):** Load catalog, scroll to product, verify view event tracked

---

## Previous Story Intelligence

**From Story 5.1 (Create Analytics Data Model):**

- **Database:** AnalyticsEvent model exists with schema:
  ```prisma
  model AnalyticsEvent {
    id          String   @id @default(uuid())
    tenantId    String
    productId   String
    eventType   EventType
    createdAt   DateTime @default(now())
    userAgent   String?
    referrer    String?

    tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
    product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

    @@index([tenantId])
    @@index([productId])
    @@index([createdAt])
  }

  enum EventType {
    VIEW
    WHATSAPP_CLICK
  }
  ```
- **Indexes:** tenantId, productId, createdAt for efficient queries
- **Relations:** AnalyticsEvent belongs to Tenant and Product (cascade delete)

**From Story 4.5 (Build Click-to-WhatsApp Feature):**

- **WhatsApp integration:** `apps/catalog/src/lib/whatsapp.ts` has `openWhatsApp()` function
- **Function signature:** `openWhatsApp(params: WhatsAppMessageParams): void`
- **Usage:** Called from ProductCard on button click
- **Enhancement needed:** Add tracking callback before window.open

**From Story 4.3 (Build Product Card Component):**

- **ProductCard location:** `apps/catalog/src/components/catalog/ProductCard.tsx`
- **Client component:** Uses 'use client' directive; can use React hooks
- **Props:** Receives `product` (ProductPublicData) and `tenant` (Tenant)
- **Integration point:** Add useViewTracking hook here

**From Epic 4 (Performance Optimizations):**

- **Next.js Image:** Lazy loading already implemented; perfect trigger for view tracking
- **Intersection Observer:** Use same pattern for view tracking (non-blocking, efficient)
- **Performance budget:** API calls must be debounced; avoid network spam

---

## Project Context Reference

- **Monorepo:** Nx; shared lib is `libs/shared`; catalog app is `apps/catalog`
- **API Routes:** Next.js App Router pattern; route.ts exports POST/GET functions
- **Prisma Client:** Imported from `@repo/database`; use `prisma.analyticsEvent.create()`
- **Multi-tenancy:** Every query MUST filter by tenantId; validate tenant exists before insert
- **Environment:** `DATABASE_URL` in `.env`; Prisma Client auto-connected

### Best Practices for Analytics APIs

1. **Fire-and-forget:** Client-side tracking should never block user actions
2. **Idempotency:** Use sessionStorage to prevent duplicate view events
3. **Rate limiting:** Consider adding rate limiting to prevent abuse (optional: Redis)
4. **Privacy:** Don't store IP addresses unless required; userAgent/referrer only
5. **Performance:** Batch events if possible; use async/await with timeout
6. **Error handling:** Log errors server-side but return 201 to client to avoid retries

### Intersection Observer Pattern

```typescript
// Example pattern for useViewTracking
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
      // Product is >50% visible
      trackViewEvent(productId);
    }
  });
}, { threshold: 0.5 });

observer.observe(productCardRef.current);
```

---

## Story Completion Status

- **Status:** ready-for-dev
- **Completion note:** Ultimate context engine analysis completed — comprehensive developer guide created. Implementation involves API route, service layer, React hook with Intersection Observer, and integration into ProductCard and whatsapp.ts.

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
