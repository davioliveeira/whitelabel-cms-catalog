# Story 5.3: Build Analytics Dashboard UI

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **store owner**,
I want **a dashboard showing my product engagement metrics**,
so that **I can understand which products are popular**.

## Acceptance Criteria

1. **AC1: Overview metrics display**
   - **Given** I am logged into the admin panel
   - **When** I navigate to the Dashboard section
   - **Then** I see an overview with:
     - Total views (last 7 days)
     - Total WhatsApp clicks (last 7 days)
     - Conversion rate (clicks / views)
     - Chart showing daily trends

2. **AC2: Top products table**
   - **Given** I want to see detailed metrics
   - **When** I scroll down the dashboard
   - **Then** I see a table of top products by:
     - Most viewed
     - Most clicked
     - Highest conversion rate

3. **AC3: Date range filtering**
   - **Given** I want to filter by date
   - **When** I select a date range
   - **Then** all metrics update to reflect the selected period

## Tasks / Subtasks

- [ ] **Task 1: Create dashboard page structure** (AC: #1)
  - [ ] 1.1 Create `apps/admin/src/app/(authenticated)/dashboard/page.tsx`
  - [ ] 1.2 Add route group for authenticated pages
  - [ ] 1.3 Implement server component to fetch initial data
  - [ ] 1.4 Add tenant context from session/auth
  - [ ] 1.5 Create responsive layout structure

- [ ] **Task 2: Build overview metrics cards** (AC: #1)
  - [ ] 2.1 Create MetricCard component in `apps/admin/src/components/dashboard/MetricCard.tsx`
  - [ ] 2.2 Fetch analytics summary data (countEvents from Story 5.2)
  - [ ] 2.3 Display total views with icon and percentage change
  - [ ] 2.4 Display total WhatsApp clicks with icon and percentage change
  - [ ] 2.5 Calculate and display conversion rate
  - [ ] 2.6 Add loading states with skeletons

- [ ] **Task 3: Implement daily trends chart** (AC: #1)
  - [ ] 3.1 Install chart library (recharts or chart.js recommended)
  - [ ] 3.2 Create TrendsChart component in `apps/admin/src/components/dashboard/TrendsChart.tsx`
  - [ ] 3.3 Fetch daily aggregated data from analytics service
  - [ ] 3.4 Render line/area chart with views and clicks
  - [ ] 3.5 Add responsive sizing and tooltips
  - [ ] 3.6 Handle empty state gracefully

- [ ] **Task 4: Build top products table** (AC: #2)
  - [ ] 4.1 Create TopProductsTable component in `apps/admin/src/components/dashboard/TopProductsTable.tsx`
  - [ ] 4.2 Fetch product performance data (aggregate by productId)
  - [ ] 4.3 Add sortable columns (views, clicks, conversion rate)
  - [ ] 4.4 Display product name, thumbnail, and metrics
  - [ ] 4.5 Add pagination for long lists
  - [ ] 4.6 Style with shadcn/ui Table components

- [ ] **Task 5: Implement date range filter** (AC: #3)
  - [ ] 5.1 Create DateRangePicker component (use shadcn/ui Calendar + Popover)
  - [ ] 5.2 Add date state management (useState or URL params)
  - [ ] 5.3 Update analytics queries with startDate/endDate filters
  - [ ] 5.4 Add preset options (Last 7 days, Last 30 days, Last 90 days, Custom)
  - [ ] 5.5 Show selected range in UI
  - [ ] 5.6 Refetch all metrics when date range changes

- [ ] **Task 6: Add state management and data fetching** (AC: All)
  - [ ] 6.1 Create analytics query hooks using TanStack Query
  - [ ] 6.2 Implement caching strategy (staleTime, refetchInterval)
  - [ ] 6.3 Add error handling and retry logic
  - [ ] 6.4 Create API endpoints in admin app if needed
  - [ ] 6.5 Ensure multi-tenancy filtering in all queries

- [ ] **Task 7: Write tests** (AC: All)
  - [ ] 7.1 Unit tests for MetricCard, TrendsChart, TopProductsTable components
  - [ ] 7.2 Integration test: dashboard loads and displays metrics
  - [ ] 7.3 Test date range filtering updates data
  - [ ] 7.4 Test empty states and error states
  - [ ] 7.5 Test conversion rate calculation accuracy

## Dev Notes

- Relevant architecture patterns and constraints
- Source tree components to touch
- Testing standards summary

### Project Structure Notes

- **Dashboard Page:** `apps/admin/src/app/(authenticated)/dashboard/page.tsx` — Server Component for initial data fetch
- **Components:** `apps/admin/src/components/dashboard/` — All dashboard-specific UI components
- **Analytics Service:** `libs/shared/src/services/analytics.service.ts` — Existing service from Story 5.2
- **UI Components:** Use shadcn/ui from `apps/admin/src/components/ui/`
- **Chart Library:** Recommend recharts (good TypeScript support, composable)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 5 - Story 5.3]
- [Source: _bmad-output/implementation-artifacts/5-2-implement-event-tracking-api.md]
- [Source: docs/architecture.md#2 Stack, #3 Monorepo Structure]
- [Source: docs/front-end-architecture.md#1 Tech Stack, #4 Folder Structure]

---

## Developer Context (Guardrails)

### Technical Requirements

| Requirement | Detail |
|-------------|--------|
| **Framework** | Next.js 14+ App Router; create page in `apps/admin/src/app/(authenticated)/dashboard/` |
| **Data Fetching** | Use TanStack Query (@tanstack/react-query) for client-side data fetching and caching |
| **Server Components** | Initial data fetch in Server Component, use Client Components for interactivity |
| **Analytics Service** | Use existing `getEvents()` and `countEvents()` from `libs/shared/src/services/analytics.service.ts` |
| **Multi-tenancy** | ALWAYS filter by tenantId from session/auth context |
| **Chart Library** | Recharts recommended (TypeScript-friendly, responsive, composable) |
| **UI Components** | Use shadcn/ui components (Card, Table, Calendar, Popover, Button, etc.) |
| **State Management** | Use URL params for date range (enables bookmarking/sharing) |
| **Date Handling** | Use date-fns for date manipulation (consistent with project) |

### Architecture Compliance

- **ARCH-02:** PostgreSQL + Prisma — use existing analytics service; no direct Prisma queries in components
- **ARCH-07:** Multi-tenancy — ALL analytics queries MUST filter by tenantId from session
- **docs/architecture.md §3:** Monorepo structure — dashboard in `apps/admin/`, components in `apps/admin/src/components/dashboard/`
- **docs/front-end-architecture.md §1:** Stack — Next.js 14 App Router, Tailwind CSS, shadcn/ui, TanStack Query
- **Story 5.2:** Analytics API exists with `getEvents()`, `countEvents()` — use these services

### Library / Framework Requirements

- **Next.js 14+:** Use App Router patterns (Server Components for data, Client Components for interactivity)
- **TanStack Query:** `useQuery` hook for data fetching with caching (`queryClient`, `staleTime`, `refetchInterval`)
- **Recharts:** For charts — install via `npm install recharts` if not already present
  ```typescript
  import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
  ```
- **shadcn/ui Components:** Card, Table, Calendar, Popover, Button, Badge, Skeleton
- **date-fns:** For date manipulation — already in project
  ```typescript
  import { subDays, format, startOfDay, endOfDay } from 'date-fns';
  ```
- **Lucide Icons:** Use for metric icons (TrendingUp, Eye, MessageCircle, Percent, etc.)

### File Structure Requirements

- **Create:**
  - `apps/admin/src/app/(authenticated)/dashboard/page.tsx` — Main dashboard page
  - `apps/admin/src/components/dashboard/MetricCard.tsx` — Metric display card
  - `apps/admin/src/components/dashboard/TrendsChart.tsx` — Daily trends chart
  - `apps/admin/src/components/dashboard/TopProductsTable.tsx` — Top products table
  - `apps/admin/src/components/dashboard/DateRangePicker.tsx` — Date range selector
  - `apps/admin/src/hooks/useAnalytics.ts` — TanStack Query hooks for analytics
  - `apps/admin/src/app/api/admin/analytics/route.ts` (optional) — Admin-specific analytics endpoint

- **Modify:**
  - `apps/admin/src/app/(authenticated)/layout.tsx` (if navigation needs dashboard link)

- **Tests:**
  - `apps/admin/__tests__/components/dashboard/*.test.tsx`
  - `apps/admin/__tests__/hooks/useAnalytics.test.ts`

### Testing Requirements

- **Component tests:** Render each dashboard component with mock data, verify correct display
- **Integration test:** Load dashboard, verify metrics fetch and display correctly
- **Date filter test:** Change date range, verify queries update with correct parameters
- **Empty state test:** Mock empty analytics data, verify friendly empty state message
- **Error handling:** Mock API failure, verify error message and retry functionality
- **Conversion rate:** Test calculation: (clicks / views) * 100, handle division by zero

---

## Previous Story Intelligence

**From Story 5.2 (Implement Event Tracking API):**

- **Analytics Service:** Created `libs/shared/src/services/analytics.service.ts` with:
  - `recordEvent(data)` — Records view/click events
  - `getEvents(tenantId, options)` — Query events with filters (productId, eventType, startDate, endDate, limit)
  - `countEvents(tenantId, options)` — Get counts: `{ views, whatsappClicks, total }`

- **Service Usage Pattern:**
  ```typescript
  import { getEvents, countEvents } from '@repo/shared';

  // Get summary counts
  const summary = await countEvents(tenantId, {
    startDate: subDays(new Date(), 7),
    endDate: new Date(),
  });
  // Returns: { views: 150, whatsappClicks: 45, total: 195 }

  // Get detailed events
  const events = await getEvents(tenantId, {
    productId: 'optional-product-id',
    eventType: 'view', // or 'whatsapp_click'
    startDate: startDate,
    endDate: endDate,
    limit: 100,
  });
  ```

- **Database Schema:** AnalyticsEvent model with tenantId, productId, eventType (VIEW/WHATSAPP_CLICK), createdAt, userAgent, referrer
- **Indexes:** Optimized for queries by tenantId, productId, createdAt
- **Multi-tenancy:** All service functions enforce tenant filtering

**From Story 5.1 (Create Analytics Data Model):**

- **EventType Enum:** VIEW, WHATSAPP_CLICK (Prisma enum, maps to TypeScript)
- **Relations:** AnalyticsEvent → Tenant (onDelete: Cascade), AnalyticsEvent → Product (onDelete: Cascade)

---

## Project Context Reference

- **Monorepo:** Nx; admin app is `apps/admin/`; shared lib is `libs/shared/`
- **Authentication:** Assume tenant context available from session/middleware (follow existing auth patterns from admin app)
- **Routing:** App Router with route groups — use `(authenticated)` group for protected pages
- **Analytics Query Patterns:**
  - Last 7 days: `startDate: subDays(new Date(), 7), endDate: new Date()`
  - Aggregate by day: Group events by `format(createdAt, 'yyyy-MM-dd')`
  - Top products: Aggregate by productId, order by count DESC
  - Conversion rate: (whatsappClicks / views) * 100 || 0

### Dashboard Layout Example

```typescript
export default async function DashboardPage() {
  const tenantId = await getTenantId(); // From session/auth

  // Server Component: Initial data fetch
  const summary = await countEvents(tenantId, {
    startDate: subDays(new Date(), 7),
    endDate: new Date(),
  });

  return (
    <div className="container mx-auto p-8">
      <h1>Analytics Dashboard</h1>

      <DateRangePicker /> {/* Client Component */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Total Views" value={summary.views} />
        <MetricCard title="WhatsApp Clicks" value={summary.whatsappClicks} />
        <MetricCard title="Conversion Rate" value={calculateConversionRate(summary)} />
      </div>

      <TrendsChart tenantId={tenantId} /> {/* Client Component with TanStack Query */}
      <TopProductsTable tenantId={tenantId} />
    </div>
  );
}
```

### TanStack Query Pattern

```typescript
// apps/admin/src/hooks/useAnalytics.ts
import { useQuery } from '@tanstack/react-query';
import { countEvents } from '@repo/shared';

export function useAnalyticsSummary(tenantId: string, dateRange: { start: Date; end: Date }) {
  return useQuery({
    queryKey: ['analytics', 'summary', tenantId, dateRange],
    queryFn: () => countEvents(tenantId, {
      startDate: dateRange.start,
      endDate: dateRange.end,
    }),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}
```

---

## Story Completion Status

- **Status:** ready-for-dev
- **Completion note:** Ultimate context engine analysis completed — comprehensive developer guide created for analytics dashboard UI implementation.

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
