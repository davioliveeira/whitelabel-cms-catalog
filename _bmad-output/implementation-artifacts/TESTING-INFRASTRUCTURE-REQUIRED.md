# CRITICAL: Test Infrastructure Setup Required

## Status: BLOCKING FOR PRODUCTION

All test files in Story 5.5 (and previous stories) contain only placeholder tests with `expect(true).toBe(true)`.

## Required Action Items

### 1. Install Testing Dependencies
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event @testing-library/react-hooks jest-environment-jsdom
```

### 2. Configure Jest for React Components
Create `jest.config.js` in apps/admin:
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### 3. Setup Prisma Mocking
Install `jest-mock-extended`:
```bash
npm install --save-dev jest-mock-extended
```

Create mock in `__tests__/__mocks__/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

export const prismaMock = mockDeep<PrismaClient>();

beforeEach(() => {
  mockReset(prismaMock);
});
```

### 4. Priority: Implement Real Tests (Not Placeholders)

**HIGH PRIORITY Tests (implement first):**
- `libs/shared/__tests__/services/analytics.service.test.ts` - getRecentEvents function
- `apps/admin/__tests__/hooks/useAnalytics.test.ts` - useRecentEvents hook
- `apps/admin/__tests__/components/dashboard/LiveActivityFeed.test.tsx` - Component rendering and states

## Impact

**Current Risk:** All tests pass (green CI) but provide ZERO actual coverage. False sense of security.

**Example of Placeholder Test:**
```typescript
it('should fetch recent events when enabled', async () => {
  // TODO: Implement test
  expect(true).toBe(true); // ❌ This always passes!
});
```

**What Real Test Should Look Like:**
```typescript
it('should fetch recent events when enabled', async () => {
  // Mock Prisma to return events
  prismaMock.analyticsEvent.findMany.mockResolvedValue([
    {
      id: 'event-1',
      eventType: 'VIEW',
      productId: 'prod-1',
      tenantId: 'tenant-1',
      createdAt: new Date(),
      product: {
        id: 'prod-1',
        name: 'Test Product',
        imageUrl: 'https://example.com/img.jpg',
      },
    },
  ]);

  const result = await getRecentEvents('tenant-1', { limit: 20 });

  expect(result).toHaveLength(1);
  expect(result[0]).toEqual({
    id: 'event-1',
    eventType: 'VIEW',
    productId: 'prod-1',
    productName: 'Test Product',
    productImageUrl: 'https://example.com/img.jpg',
    createdAt: expect.any(Date),
  });
});
```

## Recommendation

**BLOCK STORY COMPLETION until at least critical path tests are implemented.**

Critical path = Service layer (getRecentEvents, countEvents) + Core hook (useRecentEvents).
