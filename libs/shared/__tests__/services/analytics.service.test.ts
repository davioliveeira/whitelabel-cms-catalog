// =============================================================================
// Analytics Service Tests
// =============================================================================
// Tests for analytics event recording and retrieval
// =============================================================================

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { EventType } from '@prisma/client';

// =============================================================================
// Mocks
// =============================================================================

const mockPrisma = {
  tenant: {
    findUnique: jest.fn(),
  },
  product: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
  analyticsEvent: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

// Mock Prisma module
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  EventType: {
    VIEW: 'VIEW',
    WHATSAPP_CLICK: 'WHATSAPP_CLICK',
  },
}));

// Import service functions after mocking
import {
  recordEvent,
  getEvents,
  countEvents,
  getProductPerformance,
  getRecentEvents,
  type RecordEventInput,
} from '../../src/services/analytics.service';

// =============================================================================
// Test Data
// =============================================================================

const mockTenant = { id: 'tenant-1' };
const mockProduct = { id: 'product-1', name: 'Test Product', imageUrl: 'https://example.com/image.jpg', tenantId: 'tenant-1' };
const mockEvent = {
  id: 'event-1',
  tenantId: 'tenant-1',
  productId: 'product-1',
  eventType: EventType.VIEW,
  userAgent: 'Mozilla/5.0',
  referrer: 'https://example.com',
  createdAt: new Date('2024-01-01T12:00:00Z'),
};

// =============================================================================
// Test Suite: Analytics Service
// =============================================================================

describe('Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // recordEvent Function
  // ===========================================================================

  describe('recordEvent', () => {
    it('should create a view event with valid data', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(mockTenant);
      mockPrisma.product.findFirst.mockResolvedValue(mockProduct);
      mockPrisma.analyticsEvent.create.mockResolvedValue(mockEvent);

      const input: RecordEventInput = {
        tenantId: 'tenant-1',
        productId: 'product-1',
        eventType: 'view',
        userAgent: 'Mozilla/5.0',
        referrer: 'https://example.com',
      };

      const result = await recordEvent(input);

      expect(mockPrisma.analyticsEvent.create).toHaveBeenCalledWith({
        data: {
          tenantId: 'tenant-1',
          productId: 'product-1',
          eventType: EventType.VIEW,
          userAgent: 'Mozilla/5.0',
          referrer: 'https://example.com',
        },
      });
      expect(result.id).toBe('event-1');
      expect(result.eventType).toBe(EventType.VIEW);
    });

    it('should create a whatsapp_click event with valid data', async () => {
      const whatsappEvent = { ...mockEvent, eventType: EventType.WHATSAPP_CLICK };
      mockPrisma.tenant.findUnique.mockResolvedValue(mockTenant);
      mockPrisma.product.findFirst.mockResolvedValue(mockProduct);
      mockPrisma.analyticsEvent.create.mockResolvedValue(whatsappEvent);

      const input: RecordEventInput = {
        tenantId: 'tenant-1',
        productId: 'product-1',
        eventType: 'whatsapp_click',
      };

      const result = await recordEvent(input);

      expect(mockPrisma.analyticsEvent.create).toHaveBeenCalledWith({
        data: {
          tenantId: 'tenant-1',
          productId: 'product-1',
          eventType: EventType.WHATSAPP_CLICK,
          userAgent: null,
          referrer: null,
        },
      });
      expect(result.eventType).toBe(EventType.WHATSAPP_CLICK);
    });

    it('should include userAgent and referrer when provided', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(mockTenant);
      mockPrisma.product.findFirst.mockResolvedValue(mockProduct);
      mockPrisma.analyticsEvent.create.mockResolvedValue(mockEvent);

      const input: RecordEventInput = {
        tenantId: 'tenant-1',
        productId: 'product-1',
        eventType: 'view',
        userAgent: 'Custom Agent',
        referrer: 'https://referrer.com',
      };

      await recordEvent(input);

      expect(mockPrisma.analyticsEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userAgent: 'Custom Agent',
          referrer: 'https://referrer.com',
        }),
      });
    });

    it('should throw error if tenantId is missing', async () => {
      const input: RecordEventInput = {
        tenantId: '',
        productId: 'product-1',
        eventType: 'view',
      };

      await expect(recordEvent(input)).rejects.toThrow(
        'tenantId, productId, and eventType are required'
      );
    });

    it('should throw error if productId is missing', async () => {
      const input: RecordEventInput = {
        tenantId: 'tenant-1',
        productId: '',
        eventType: 'view',
      };

      await expect(recordEvent(input)).rejects.toThrow(
        'tenantId, productId, and eventType are required'
      );
    });

    it('should throw error if eventType is invalid', async () => {
      const input = {
        tenantId: 'tenant-1',
        productId: 'product-1',
        eventType: 'invalid',
      } as RecordEventInput;

      await expect(recordEvent(input)).rejects.toThrow(
        'eventType must be "view" or "whatsapp_click"'
      );
    });

    it('should throw error if tenant does not exist', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null);

      const input: RecordEventInput = {
        tenantId: 'nonexistent',
        productId: 'product-1',
        eventType: 'view',
      };

      await expect(recordEvent(input)).rejects.toThrow(
        'Tenant with id nonexistent not found'
      );
    });

    it('should throw error if product does not exist for tenant', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(mockTenant);
      mockPrisma.product.findFirst.mockResolvedValue(null);

      const input: RecordEventInput = {
        tenantId: 'tenant-1',
        productId: 'nonexistent',
        eventType: 'view',
      };

      await expect(recordEvent(input)).rejects.toThrow(
        'Product with id nonexistent not found for tenant tenant-1'
      );
    });

    it('should enforce multi-tenancy (product belongs to correct tenant)', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(mockTenant);
      mockPrisma.product.findFirst.mockResolvedValue(null); // Product not found for this tenant

      const input: RecordEventInput = {
        tenantId: 'tenant-1',
        productId: 'product-from-tenant-2',
        eventType: 'view',
      };

      await expect(recordEvent(input)).rejects.toThrow(
        'Product with id product-from-tenant-2 not found for tenant tenant-1'
      );

      // Verify query filtered by tenantId
      expect(mockPrisma.product.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'product-from-tenant-2',
          tenantId: 'tenant-1',
        },
        select: { id: true },
      });
    });
  });

  // ===========================================================================
  // getEvents Function
  // ===========================================================================

  describe('getEvents', () => {
    it('should return events for a tenant', async () => {
      const mockEvents = [mockEvent];
      mockPrisma.analyticsEvent.findMany.mockResolvedValue(mockEvents);

      const result = await getEvents('tenant-1');

      expect(mockPrisma.analyticsEvent.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('event-1');
    });

    it('should filter by productId when provided', async () => {
      mockPrisma.analyticsEvent.findMany.mockResolvedValue([]);

      await getEvents('tenant-1', { productId: 'product-1' });

      expect(mockPrisma.analyticsEvent.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: 'tenant-1',
          productId: 'product-1',
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    });

    it('should filter by eventType when provided', async () => {
      mockPrisma.analyticsEvent.findMany.mockResolvedValue([]);

      await getEvents('tenant-1', { eventType: 'view' });

      expect(mockPrisma.analyticsEvent.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: 'tenant-1',
          eventType: EventType.VIEW,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    });

    it('should filter by date range when provided', async () => {
      mockPrisma.analyticsEvent.findMany.mockResolvedValue([]);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      await getEvents('tenant-1', { startDate, endDate });

      expect(mockPrisma.analyticsEvent.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: 'tenant-1',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    });

    it('should limit results to specified number', async () => {
      mockPrisma.analyticsEvent.findMany.mockResolvedValue([]);

      await getEvents('tenant-1', { limit: 10 });

      expect(mockPrisma.analyticsEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      );
    });

    it('should order results by createdAt desc', async () => {
      mockPrisma.analyticsEvent.findMany.mockResolvedValue([]);

      await getEvents('tenant-1');

      expect(mockPrisma.analyticsEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });
  });

  // ===========================================================================
  // countEvents Function
  // ===========================================================================

  describe('countEvents', () => {
    it('should return counts for views and whatsapp clicks', async () => {
      mockPrisma.analyticsEvent.count
        .mockResolvedValueOnce(150) // views
        .mockResolvedValueOnce(45); // whatsapp clicks

      const result = await countEvents('tenant-1');

      expect(result).toEqual({
        views: 150,
        whatsappClicks: 45,
        total: 195,
      });
    });

    it('should filter counts by productId when provided', async () => {
      mockPrisma.analyticsEvent.count.mockResolvedValue(0);

      await countEvents('tenant-1', { productId: 'product-1' });

      expect(mockPrisma.analyticsEvent.count).toHaveBeenCalledWith({
        where: {
          tenantId: 'tenant-1',
          productId: 'product-1',
          eventType: EventType.VIEW,
        },
      });
    });

    it('should filter counts by date range when provided', async () => {
      mockPrisma.analyticsEvent.count.mockResolvedValue(0);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      await countEvents('tenant-1', { startDate, endDate });

      expect(mockPrisma.analyticsEvent.count).toHaveBeenCalledWith({
        where: {
          tenantId: 'tenant-1',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          eventType: EventType.VIEW,
        },
      });
    });

    it('should calculate total correctly', async () => {
      mockPrisma.analyticsEvent.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5);

      const result = await countEvents('tenant-1');

      expect(result.total).toBe(15);
    });
  });

  // ===========================================================================
  // getProductPerformance Function (Story 5.4)
  // ===========================================================================

  describe('getProductPerformance', () => {
    const dateRange = {
      start: new Date('2024-01-08T00:00:00Z'),
      end: new Date('2024-01-14T23:59:59Z'),
    };

    it('should aggregate events by productId', async () => {
      const currentEvents = [
        { productId: 'prod-1', eventType: EventType.VIEW },
        { productId: 'prod-1', eventType: EventType.WHATSAPP_CLICK },
        { productId: 'prod-2', eventType: EventType.VIEW },
        { productId: 'prod-3', eventType: EventType.VIEW },
      ];

      mockPrisma.analyticsEvent.findMany
        .mockResolvedValueOnce(currentEvents) // current period
        .mockResolvedValueOnce([]); // previous period

      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'prod-1', name: 'Product 1', imageUrl: null },
        { id: 'prod-2', name: 'Product 2', imageUrl: null },
        { id: 'prod-3', name: 'Product 3', imageUrl: null },
      ]);

      const result = await getProductPerformance('tenant-1', dateRange);

      expect(result).toHaveLength(3);
      expect(result[0].productId).toBe('prod-1');
      expect(result[0].views).toBe(1);
      expect(result[0].whatsappClicks).toBe(1);
    });

    it('should calculate conversion rate correctly', async () => {
      const currentEvents = Array(100)
        .fill(null)
        .map(() => ({ productId: 'prod-1', eventType: EventType.VIEW }))
        .concat(
          Array(25)
            .fill(null)
            .map(() => ({ productId: 'prod-1', eventType: EventType.WHATSAPP_CLICK }))
        );

      mockPrisma.analyticsEvent.findMany
        .mockResolvedValueOnce(currentEvents)
        .mockResolvedValueOnce([]);

      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'prod-1', name: 'Product 1', imageUrl: null },
      ]);

      const result = await getProductPerformance('tenant-1', dateRange);

      expect(result[0].conversionRate).toBe(25.0); // 25/100 * 100 = 25.0
    });

    it('should handle zero views without division error', async () => {
      mockPrisma.analyticsEvent.findMany
        .mockResolvedValueOnce([]) // current period - no events
        .mockResolvedValueOnce([]); // previous period

      const result = await getProductPerformance('tenant-1', dateRange);

      expect(result).toEqual([]);
    });

    it('should join with Product table to get name and image', async () => {
      const currentEvents = [
        { productId: 'prod-1', eventType: EventType.VIEW },
      ];

      mockPrisma.analyticsEvent.findMany
        .mockResolvedValueOnce(currentEvents)
        .mockResolvedValueOnce([]);

      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'prod-1', name: 'Product A', imageUrl: 'https://example.com/a.jpg' },
      ]);

      const result = await getProductPerformance('tenant-1', dateRange);

      expect(result[0].productName).toBe('Product A');
      expect(result[0].productImageUrl).toBe('https://example.com/a.jpg');
    });

    it('should calculate trend compared to previous period', async () => {
      // Current: 100 views, 30 clicks = 30% conversion
      const currentEvents = Array(100)
        .fill(null)
        .map(() => ({ productId: 'prod-1', eventType: EventType.VIEW }))
        .concat(
          Array(30)
            .fill(null)
            .map(() => ({ productId: 'prod-1', eventType: EventType.WHATSAPP_CLICK }))
        );

      // Previous: 100 views, 20 clicks = 20% conversion
      const previousEvents = Array(100)
        .fill(null)
        .map(() => ({ productId: 'prod-1', eventType: EventType.VIEW }))
        .concat(
          Array(20)
            .fill(null)
            .map(() => ({ productId: 'prod-1', eventType: EventType.WHATSAPP_CLICK }))
        );

      mockPrisma.analyticsEvent.findMany
        .mockResolvedValueOnce(currentEvents)
        .mockResolvedValueOnce(previousEvents);

      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'prod-1', name: 'Product 1', imageUrl: null },
      ]);

      const result = await getProductPerformance('tenant-1', dateRange);

      expect(result[0].trend).toBe('up');
      expect(result[0].trendPercentage).toBe(50); // (30-20)/20 * 100 = 50
    });

    it('should mark trend as down when conversion rate decreases', async () => {
      // Current: 20% conversion
      const currentEvents = Array(100)
        .fill(null)
        .map(() => ({ productId: 'prod-1', eventType: EventType.VIEW }))
        .concat(
          Array(20)
            .fill(null)
            .map(() => ({ productId: 'prod-1', eventType: EventType.WHATSAPP_CLICK }))
        );

      // Previous: 30% conversion
      const previousEvents = Array(100)
        .fill(null)
        .map(() => ({ productId: 'prod-1', eventType: EventType.VIEW }))
        .concat(
          Array(30)
            .fill(null)
            .map(() => ({ productId: 'prod-1', eventType: EventType.WHATSAPP_CLICK }))
        );

      mockPrisma.analyticsEvent.findMany
        .mockResolvedValueOnce(currentEvents)
        .mockResolvedValueOnce(previousEvents);

      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'prod-1', name: 'Product 1', imageUrl: null },
      ]);

      const result = await getProductPerformance('tenant-1', dateRange);

      expect(result[0].trend).toBe('down');
      expect(result[0].trendPercentage).toBeLessThan(0);
    });

    it('should mark trend as stable when change is less than 5%', async () => {
      // Current: 20.5% conversion (200 views, 41 clicks)
      const currentEvents = Array(200)
        .fill(null)
        .map(() => ({ productId: 'prod-1', eventType: EventType.VIEW }))
        .concat(
          Array(41)
            .fill(null)
            .map(() => ({ productId: 'prod-1', eventType: EventType.WHATSAPP_CLICK }))
        );

      // Previous: 20% conversion (200 views, 40 clicks)
      // Change: (20.5 - 20) / 20 * 100 = 2.5% (< 5%, should be stable)
      const previousEvents = Array(200)
        .fill(null)
        .map(() => ({ productId: 'prod-1', eventType: EventType.VIEW }))
        .concat(
          Array(40)
            .fill(null)
            .map(() => ({ productId: 'prod-1', eventType: EventType.WHATSAPP_CLICK }))
        );

      mockPrisma.analyticsEvent.findMany
        .mockResolvedValueOnce(currentEvents)
        .mockResolvedValueOnce(previousEvents);

      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'prod-1', name: 'Product 1', imageUrl: null },
      ]);

      const result = await getProductPerformance('tenant-1', dateRange);

      expect(result[0].trend).toBe('stable');
    });

    it('should handle products with no previous data', async () => {
      const currentEvents = [
        { productId: 'prod-1', eventType: EventType.VIEW },
        { productId: 'prod-1', eventType: EventType.WHATSAPP_CLICK },
      ];

      mockPrisma.analyticsEvent.findMany
        .mockResolvedValueOnce(currentEvents)
        .mockResolvedValueOnce([]); // No previous events

      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'prod-1', name: 'Product 1', imageUrl: null },
      ]);

      const result = await getProductPerformance('tenant-1', dateRange);

      expect(result[0].trend).toBe('up');
      expect(result[0].trendPercentage).toBe(100);
    });

    it('should filter by tenantId', async () => {
      mockPrisma.analyticsEvent.findMany.mockResolvedValue([]);

      await getProductPerformance('tenant-1', dateRange);

      expect(mockPrisma.analyticsEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant-1',
          }),
        })
      );
    });

    it('should filter by date range', async () => {
      mockPrisma.analyticsEvent.findMany.mockResolvedValue([]);

      await getProductPerformance('tenant-1', dateRange);

      expect(mockPrisma.analyticsEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          }),
        })
      );
    });

    it('should sort products by views descending', async () => {
      const currentEvents = [
        // Product A: 150 views
        ...Array(150)
          .fill(null)
          .map(() => ({ productId: 'prod-a', eventType: EventType.VIEW })),
        // Product B: 100 views
        ...Array(100)
          .fill(null)
          .map(() => ({ productId: 'prod-b', eventType: EventType.VIEW })),
        // Product C: 50 views
        ...Array(50)
          .fill(null)
          .map(() => ({ productId: 'prod-c', eventType: EventType.VIEW })),
      ];

      mockPrisma.analyticsEvent.findMany
        .mockResolvedValueOnce(currentEvents)
        .mockResolvedValueOnce([]);

      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'prod-a', name: 'Product A', imageUrl: null },
        { id: 'prod-b', name: 'Product B', imageUrl: null },
        { id: 'prod-c', name: 'Product C', imageUrl: null },
      ]);

      const result = await getProductPerformance('tenant-1', dateRange);

      expect(result[0].productName).toBe('Product A');
      expect(result[1].productName).toBe('Product B');
      expect(result[2].productName).toBe('Product C');
    });

    it('should return empty array when no events found', async () => {
      mockPrisma.analyticsEvent.findMany.mockResolvedValue([]);

      const result = await getProductPerformance('tenant-1', dateRange);

      expect(result).toEqual([]);
    });

    it('should group VIEW and WHATSAPP_CLICK events correctly', async () => {
      const currentEvents = [
        ...Array(5)
          .fill(null)
          .map(() => ({ productId: 'prod-1', eventType: EventType.VIEW })),
        ...Array(2)
          .fill(null)
          .map(() => ({ productId: 'prod-1', eventType: EventType.WHATSAPP_CLICK })),
      ];

      mockPrisma.analyticsEvent.findMany
        .mockResolvedValueOnce(currentEvents)
        .mockResolvedValueOnce([]);

      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'prod-1', name: 'Product 1', imageUrl: null },
      ]);

      const result = await getProductPerformance('tenant-1', dateRange);

      expect(result[0].views).toBe(5);
      expect(result[0].whatsappClicks).toBe(2);
    });

    it('should calculate previous period date range correctly', async () => {
      const dateRange = {
        start: new Date('2024-01-08T00:00:00Z'),
        end: new Date('2024-01-14T23:59:59Z'),
      };

      mockPrisma.analyticsEvent.findMany.mockResolvedValue([]);

      await getProductPerformance('tenant-1', dateRange);

      // Second call should be for previous period
      const previousCall = mockPrisma.analyticsEvent.findMany.mock.calls[1][0];
      const previousStart = previousCall.where.createdAt.gte;
      const previousEnd = previousCall.where.createdAt.lt;

      // Previous period should be same duration before start date
      const periodDuration = dateRange.end.getTime() - dateRange.start.getTime();
      const expectedPreviousStart = new Date(dateRange.start.getTime() - periodDuration);

      expect(previousStart.getTime()).toBe(expectedPreviousStart.getTime());
      expect(previousEnd.getTime()).toBe(dateRange.start.getTime());
    });
  });

  // ===========================================================================
  // getRecentEvents Function (Story 5.5)
  // ===========================================================================

  describe('getRecentEvents', () => {
    const mockEventWithProduct = {
      id: 'event-1',
      eventType: EventType.VIEW,
      productId: 'prod-1',
      createdAt: new Date('2024-01-01T12:00:00Z'),
      product: {
        id: 'prod-1',
        name: 'Product A',
        imageUrl: 'https://example.com/a.jpg',
      },
    };

    it('should return recent events ordered by createdAt DESC', async () => {
      const events = [
        { ...mockEventWithProduct, id: 'event-1', createdAt: new Date('2024-01-01T12:00:00Z') },
        { ...mockEventWithProduct, id: 'event-2', createdAt: new Date('2024-01-01T11:00:00Z') },
        { ...mockEventWithProduct, id: 'event-3', createdAt: new Date('2024-01-01T10:00:00Z') },
      ];

      mockPrisma.analyticsEvent.findMany.mockResolvedValue(events);

      const result = await getRecentEvents('tenant-1');

      expect(mockPrisma.analyticsEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
      expect(result[0].id).toBe('event-1');
      expect(result[1].id).toBe('event-2');
      expect(result[2].id).toBe('event-3');
    });

    it('should join with Product table to get product details', async () => {
      mockPrisma.analyticsEvent.findMany.mockResolvedValue([mockEventWithProduct]);

      const result = await getRecentEvents('tenant-1');

      expect(result[0].productName).toBe('Product A');
      expect(result[0].productImageUrl).toBe('https://example.com/a.jpg');
    });

    it('should limit results to specified number', async () => {
      mockPrisma.analyticsEvent.findMany.mockResolvedValue([]);

      await getRecentEvents('tenant-1', { limit: 10 });

      expect(mockPrisma.analyticsEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      );
    });

    it('should default to limit of 20', async () => {
      mockPrisma.analyticsEvent.findMany.mockResolvedValue([]);

      await getRecentEvents('tenant-1');

      expect(mockPrisma.analyticsEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
        })
      );
    });

    it('should cap limit at 50 maximum', async () => {
      mockPrisma.analyticsEvent.findMany.mockResolvedValue([]);

      await getRecentEvents('tenant-1', { limit: 100 });

      expect(mockPrisma.analyticsEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        })
      );
    });

    it('should filter by tenantId', async () => {
      mockPrisma.analyticsEvent.findMany.mockResolvedValue([]);

      await getRecentEvents('tenant-1');

      expect(mockPrisma.analyticsEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1' },
        })
      );
    });

    it('should include all event types (VIEW and WHATSAPP_CLICK)', async () => {
      const events = [
        { ...mockEventWithProduct, eventType: EventType.VIEW },
        { ...mockEventWithProduct, eventType: EventType.WHATSAPP_CLICK },
      ];

      mockPrisma.analyticsEvent.findMany.mockResolvedValue(events);

      const result = await getRecentEvents('tenant-1');

      expect(result).toHaveLength(2);
      expect(result[0].eventType).toBe(EventType.VIEW);
      expect(result[1].eventType).toBe(EventType.WHATSAPP_CLICK);
    });

    it('should return event with correct fields', async () => {
      mockPrisma.analyticsEvent.findMany.mockResolvedValue([mockEventWithProduct]);

      const result = await getRecentEvents('tenant-1');

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('eventType');
      expect(result[0]).toHaveProperty('productId');
      expect(result[0]).toHaveProperty('productName');
      expect(result[0]).toHaveProperty('productImageUrl');
      expect(result[0]).toHaveProperty('createdAt');
    });

    it('should handle products without images', async () => {
      const eventWithoutImage = {
        ...mockEventWithProduct,
        product: {
          ...mockEventWithProduct.product,
          imageUrl: null,
        },
      };

      mockPrisma.analyticsEvent.findMany.mockResolvedValue([eventWithoutImage]);

      const result = await getRecentEvents('tenant-1');

      expect(result[0].productImageUrl).toBeNull();
    });

    it('should return empty array when no events found', async () => {
      mockPrisma.analyticsEvent.findMany.mockResolvedValue([]);

      const result = await getRecentEvents('tenant-1');

      expect(result).toEqual([]);
    });

    it('should include timestamps for relative time formatting', async () => {
      mockPrisma.analyticsEvent.findMany.mockResolvedValue([mockEventWithProduct]);

      const result = await getRecentEvents('tenant-1');

      expect(result[0].createdAt).toBeInstanceOf(Date);
    });
  });
});
