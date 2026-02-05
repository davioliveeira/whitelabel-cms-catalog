# Story 5.4: Build Product Performance Table

Status: ready-for-dev

## Story

As a **store owner**,
I want **to see performance metrics for each product**,
so that **I can identify my best and worst performers**.

## Acceptance Criteria

1. **AC1: Table display with columns**
   - **Given** I am on the analytics dashboard
   - **When** I view the product performance table
   - **Then** I see columns for: Product name, Views count, WhatsApp clicks count, Conversion rate (%), Trend indicator (↑ ↓ →)

2. **AC2: Sortable columns**
   - **Given** I want to sort the table
   - **When** I click a column header
   - **Then** the table sorts by that column (ascending/descending)

3. **AC3: Search functionality**
   - **Given** I want to find a specific product
   - **When** I type in the search box
   - **Then** the table filters to matching products

4. **AC4: Expandable row details**
   - **Given** I click on a product row
   - **When** the details expand
   - **Then** I see a mini-chart of that product's daily performance

## Tasks / Subtasks

- [ ] **Task 1: Aggregate product analytics data** (AC: #1)
  - [ ] 1.1 Create aggregation function in analytics service
  - [ ] 1.2 Group events by productId
  - [ ] 1.3 Calculate views, clicks, conversion rate per product
  - [ ] 1.4 Join with Product table for name and image
  - [ ] 1.5 Calculate trend indicators (compare to previous period)

- [ ] **Task 2: Implement TopProductsTable component** (AC: #1, #2, #3)
  - [ ] 2.1 Replace placeholder in TopProductsTable.tsx
  - [ ] 2.2 Use shadcn/ui Table components
  - [ ] 2.3 Display product thumbnail, name, metrics
  - [ ] 2.4 Add sortable column headers
  - [ ] 2.5 Implement search input with debouncing
  - [ ] 2.6 Add pagination (10-20 products per page)

- [ ] **Task 3: Add TanStack Query hook** (AC: All)
  - [ ] 3.1 Implement useTopProducts in useAnalytics.ts
  - [ ] 3.2 Fetch aggregated product data
  - [ ] 3.3 Add caching and refetch strategy
  - [ ] 3.4 Handle loading and error states

- [ ] **Task 4: Implement expandable rows** (AC: #4)
  - [ ] 4.1 Add row click handler
  - [ ] 4.2 Create mini-chart component for product details
  - [ ] 4.3 Fetch daily product performance on expand
  - [ ] 4.4 Animate expand/collapse transition

- [ ] **Task 5: Write tests** (AC: All)
  - [ ] 5.1 Test table rendering with mock data
  - [ ] 5.2 Test sorting by each column
  - [ ] 5.3 Test search filtering
  - [ ] 5.4 Test row expansion and mini-chart display
  - [ ] 5.5 Test pagination
  - [ ] 5.6 Test conversion rate calculation

## Dev Notes

### Project Structure Notes

- **Component:** `apps/admin/src/components/dashboard/TopProductsTable.tsx` — Replace placeholder with implementation
- **Hook:** `apps/admin/src/hooks/useAnalytics.ts` — Implement useTopProducts function
- **Service:** `libs/shared/src/services/analytics.service.ts` — Add product aggregation function
- **UI:** Use shadcn/ui Table, Input, Button components

### References

- [Source: epics.md#Epic 5 - Story 5.4]
- [Source: 5-3-build-analytics-dashboard-ui.md] - Dashboard structure and hooks
- [Source: 5-2-implement-event-tracking-api.md] - Analytics service patterns

---

## Developer Context (Guardrails)

### Technical Requirements

| Requirement | Detail |
|-------------|--------|
| **Component** | Replace TopProductsTable.tsx placeholder; use shadcn/ui Table |
| **Data Aggregation** | Group AnalyticsEvent by productId; calculate views, clicks, conversion rate |
| **Join Products** | Join with Product table to get name, imageUrl |
| **Sorting** | Client-side sorting with useState; sort by views, clicks, conversion rate |
| **Search** | Filter by product name (case-insensitive, debounced) |
| **Pagination** | Client-side pagination, 20 products per page |
| **Trend Indicator** | Compare current period to previous period; show ↑ ↓ → based on change |
| **Multi-tenancy** | ALL queries MUST filter by tenantId |

### Architecture Compliance

- **ARCH-02:** Use existing analytics service; extend with product aggregation
- **ARCH-07:** Multi-tenancy — filter by tenantId in all queries
- **Story 5.2:** Use getEvents() service with productId grouping
- **Story 5.3:** Integrate into dashboard page, replace placeholder

### Library / Framework Requirements

- **shadcn/ui:** Table, TableHeader, TableBody, TableRow, TableCell, Input
- **TanStack Query:** useQuery for data fetching
- **Sorting:** useState for sort column and direction
- **Search:** useState with useMemo for filtered results
- **Lodash (optional):** For groupBy and orderBy helpers

### File Structure Requirements

- **Modify:** `apps/admin/src/components/dashboard/TopProductsTable.tsx`
- **Modify:** `apps/admin/src/hooks/useAnalytics.ts`
- **Create:** `libs/shared/src/services/analytics.service.ts` - Add `getProductPerformance()`
- **Tests:** `apps/admin/__tests__/components/dashboard/TopProductsTable.test.tsx`

### Testing Requirements

- **Component:** Render with mock data, verify all columns display
- **Sorting:** Click column headers, verify sort order changes
- **Search:** Type in search box, verify filtered results
- **Pagination:** Navigate pages, verify correct products shown
- **Conversion rate:** Test calculation accuracy
- **Expandable rows:** Click row, verify expansion and mini-chart

---

## Previous Story Intelligence

**From Story 5.3 (Build Analytics Dashboard UI):**

- **Dashboard structure:** Placeholder TopProductsTable component exists
- **Hooks pattern:** useAnalytics.ts with TanStack Query
- **Placeholder TODO:** "Implement TopProductsTable with sorting and pagination"

**From Story 5.2 (Implement Event Tracking API):**

- **Analytics service:** getEvents() and countEvents() functions
- **Service pattern:** Multi-tenancy with tenantId filtering
- **Event grouping:** Can query events by productId

**From Story 5.1 (Create Analytics Data Model):**

- **Database:** AnalyticsEvent with productId, tenantId, eventType, createdAt
- **Relations:** AnalyticsEvent → Product (onDelete: Cascade)

---

## Project Context Reference

### Product Performance Aggregation Query Example

```typescript
// Pseudo-code for aggregation logic
export async function getProductPerformance(
  tenantId: string,
  dateRange: { start: Date; end: Date }
) {
  // Get all events for tenant in date range
  const events = await getEvents(tenantId, {
    startDate: dateRange.start,
    endDate: dateRange.end,
  });

  // Group by productId
  const grouped = events.reduce((acc, event) => {
    if (!acc[event.productId]) {
      acc[event.productId] = { views: 0, clicks: 0, productId: event.productId };
    }
    if (event.eventType === 'VIEW') acc[event.productId].views++;
    if (event.eventType === 'WHATSAPP_CLICK') acc[event.productId].clicks++;
    return acc;
  }, {});

  // Calculate conversion rates and join with products
  const results = await Promise.all(
    Object.entries(grouped).map(async ([productId, stats]) => {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      const conversionRate = stats.views > 0 ? (stats.clicks / stats.views) * 100 : 0;
      return { product, ...stats, conversionRate };
    })
  );

  return results;
}
```

---

## Story Completion Status

- **Status:** ready-for-dev
- **Completion note:** Comprehensive story created with product performance table requirements.

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
