// =============================================================================
// Analytics Service
// =============================================================================
// Service functions for analytics event tracking operations.
// All functions filter by tenantId for multi-tenant isolation.
// =============================================================================

import { PrismaClient, EventType } from '@prisma/client';

// =============================================================================
// Prisma Client Singleton (for shared lib)
// =============================================================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env['NODE_ENV'] === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;
}

// =============================================================================
// Types
// =============================================================================

export interface RecordEventInput {
  tenantId: string;
  productId: string;
  eventType: 'view' | 'whatsapp_click';
  userAgent?: string;
  referrer?: string;
}

export interface AnalyticsEventResponse {
  id: string;
  tenantId: string;
  productId: string;
  eventType: EventType;
  userAgent: string | null;
  referrer: string | null;
  createdAt: Date;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Map string event type to Prisma EventType enum
 */
function mapEventType(eventType: 'view' | 'whatsapp_click'): EventType {
  return eventType === 'view' ? EventType.VIEW : EventType.WHATSAPP_CLICK;
}

/**
 * Map Prisma AnalyticsEvent to response format
 */
function mapToResponse(event: {
  id: string;
  storeId: string;
  productId: string;
  eventType: EventType;
  userAgent: string | null;
  referrer: string | null;
  createdAt: Date;
}): AnalyticsEventResponse {
  return {
    id: event.id,
    tenantId: event.storeId, // Map Prisma's storeId to the response's tenantId
    productId: event.productId,
    eventType: event.eventType,
    userAgent: event.userAgent,
    referrer: event.referrer,
    createdAt: event.createdAt,
  };
}

// =============================================================================
// Analytics Operations
// =============================================================================

/**
 * Record an analytics event (view or WhatsApp click).
 *
 * @param data - Event data including tenantId, productId, eventType, and optional metadata
 * @returns Created analytics event
 * @throws Error if tenant or product doesn't exist, or if validation fails
 */
export async function recordEvent(
  data: RecordEventInput
): Promise<AnalyticsEventResponse> {
  // Validate required fields
  if (!data.tenantId || !data.productId || !data.eventType) {
    throw new Error('tenantId, productId, and eventType are required');
  }

  // Validate event type
  if (data.eventType !== 'view' && data.eventType !== 'whatsapp_click') {
    throw new Error('eventType must be "view" or "whatsapp_click"');
  }

  // Verify tenant exists
  const tenant = await prisma.store.findUnique({
    where: { id: data.tenantId },
    select: { id: true },
  });

  if (!tenant) {
    throw new Error(`Tenant with id ${data.tenantId} not found`);
  }

  // Verify product exists and belongs to tenant
  const product = await prisma.product.findFirst({
    where: {
      id: data.productId,
      storeId: data.tenantId,
    },
    select: { id: true },
  });

  if (!product) {
    throw new Error(
      `Product with id ${data.productId} not found for tenant ${data.tenantId}`
    );
  }

  // Create analytics event
  const event = await prisma.analyticsEvent.create({
    data: {
      storeId: data.tenantId,
      productId: data.productId,
      eventType: mapEventType(data.eventType),
      userAgent: data.userAgent ?? null,
      referrer: data.referrer ?? null,
    },
  });

  return mapToResponse(event);
}

/**
 * Get analytics events for a tenant with optional filtering.
 *
 * @param tenantId - The tenant ID
 * @param productId - Optional product ID to filter by
 * @param eventType - Optional event type to filter by
 * @param startDate - Optional start date for filtering
 * @param endDate - Optional end date for filtering
 * @returns List of analytics events
 */
export async function getEvents(
  tenantId: string,
  options?: {
    productId?: string;
    eventType?: 'view' | 'whatsapp_click';
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }
): Promise<AnalyticsEventResponse[]> {
  const events = await prisma.analyticsEvent.findMany({
    where: {
      storeId: tenantId,
      ...(options?.productId && { productId: options.productId }),
      ...(options?.eventType && { eventType: mapEventType(options.eventType) }),
      ...(options?.startDate || options?.endDate
        ? {
          createdAt: {
            ...(options.startDate && { gte: options.startDate }),
            ...(options.endDate && { lte: options.endDate }),
          },
        }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: options?.limit ?? 100,
  });

  return events.map(mapToResponse);
}

/**
 * Count events for a tenant by type.
 *
 * @param tenantId - The tenant ID
 * @param productId - Optional product ID to filter by
 * @param startDate - Optional start date for filtering
 * @param endDate - Optional end date for filtering
 * @returns Object with view and whatsappClick counts
 */
export async function countEvents(
  tenantId: string,
  options?: {
    productId?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<{ views: number; whatsappClicks: number; total: number }> {
  const where = {
    storeId: tenantId,
    ...(options?.productId && { productId: options.productId }),
    ...(options?.startDate || options?.endDate
      ? {
        createdAt: {
          ...(options.startDate && { gte: options.startDate }),
          ...(options.endDate && { lte: options.endDate }),
        },
      }
      : {}),
  };

  const [views, whatsappClicks] = await Promise.all([
    prisma.analyticsEvent.count({
      where: { ...where, eventType: EventType.VIEW },
    }),
    prisma.analyticsEvent.count({
      where: { ...where, eventType: EventType.WHATSAPP_CLICK },
    }),
  ]);

  return {
    views,
    whatsappClicks,
    total: views + whatsappClicks,
  };
}

// =============================================================================
// Product Performance Analytics
// =============================================================================

export interface ProductPerformance {
  productId: string;
  productName: string;
  productImageUrl: string | null;
  views: number;
  whatsappClicks: number;
  conversionRate: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

/**
 * Get product performance metrics aggregated by product.
 * Includes views, clicks, conversion rate, and trend compared to previous period.
 *
 * @param tenantId - The tenant ID
 * @param dateRange - Date range for current period
 * @returns List of product performance metrics
 */
export async function getProductPerformance(
  tenantId: string,
  dateRange: { start: Date; end: Date }
): Promise<ProductPerformance[]> {
  // Get all events for the current period
  const events = await prisma.analyticsEvent.findMany({
    where: {
      storeId: tenantId,
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
    select: {
      productId: true,
      eventType: true,
    },
  });

  // Calculate previous period date range (same duration)
  const periodDuration = dateRange.end.getTime() - dateRange.start.getTime();
  const previousPeriodStart = new Date(dateRange.start.getTime() - periodDuration);
  const previousPeriodEnd = new Date(dateRange.start.getTime());

  // Get events for previous period
  const previousEvents = await prisma.analyticsEvent.findMany({
    where: {
      storeId: tenantId,
      createdAt: {
        gte: previousPeriodStart,
        lt: previousPeriodEnd,
      },
    },
    select: {
      productId: true,
      eventType: true,
    },
  });

  // Group current period events by productId
  const currentStats = events.reduce((acc, event) => {
    if (!acc[event.productId]) {
      acc[event.productId] = { views: 0, clicks: 0 };
    }
    if (event.eventType === EventType.VIEW) {
      acc[event.productId].views++;
    } else if (event.eventType === EventType.WHATSAPP_CLICK) {
      acc[event.productId].clicks++;
    }
    return acc;
  }, {} as Record<string, { views: number; clicks: number }>);

  // Group previous period events by productId
  const previousStats = previousEvents.reduce((acc, event) => {
    if (!acc[event.productId]) {
      acc[event.productId] = { views: 0, clicks: 0 };
    }
    if (event.eventType === EventType.VIEW) {
      acc[event.productId].views++;
    } else if (event.eventType === EventType.WHATSAPP_CLICK) {
      acc[event.productId].clicks++;
    }
    return acc;
  }, {} as Record<string, { views: number; clicks: number }>);

  // Get unique product IDs from current period
  const productIds = Object.keys(currentStats);

  if (productIds.length === 0) {
    return [];
  }

  // Fetch product details
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      storeId: tenantId,
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
  });

  // Build product performance results
  const results: ProductPerformance[] = products.map((product) => {
    const current = currentStats[product.id];
    const previous = previousStats[product.id] || { views: 0, clicks: 0 };

    // Calculate current conversion rate
    const conversionRate = current.views > 0 ? (current.clicks / current.views) * 100 : 0;

    // Calculate previous conversion rate
    const previousConversionRate =
      previous.views > 0 ? (previous.clicks / previous.views) * 100 : 0;

    // Calculate trend
    let trend: 'up' | 'down' | 'stable' = 'stable';
    let trendPercentage = 0;

    if (previousConversionRate > 0) {
      const change = conversionRate - previousConversionRate;
      trendPercentage = Math.round((change / previousConversionRate) * 100);

      if (Math.abs(trendPercentage) < 5) {
        trend = 'stable';
      } else if (trendPercentage > 0) {
        trend = 'up';
      } else {
        trend = 'down';
      }
    } else if (conversionRate > 0) {
      trend = 'up';
      trendPercentage = 100;
    }

    return {
      productId: product.id,
      productName: product.name,
      productImageUrl: product.imageUrl,
      views: current.views,
      whatsappClicks: current.clicks,
      conversionRate: Math.round(conversionRate * 10) / 10,
      trend,
      trendPercentage,
    };
  });

  // Sort by views descending (most popular first)
  return results.sort((a, b) => b.views - a.views);
}

// =============================================================================
// Recent Events Feed (Real-time Dashboard Updates)
// =============================================================================

export interface RecentEvent {
  id: string;
  eventType: EventType;
  productId: string;
  productName: string;
  productImageUrl: string | null;
  createdAt: Date;
}

/**
 * Get recent analytics events for live activity feed.
 * Returns events ordered by most recent first with product details.
 *
 * @param tenantId - The tenant ID
 * @param options - Optional limit for number of events (default: 20, max: 50)
 * @returns List of recent events with product information
 */
export async function getRecentEvents(
  tenantId: string,
  options?: {
    limit?: number;
  }
): Promise<RecentEvent[]> {
  // Limit to reasonable range (default 20, max 50)
  const limit = Math.min(options?.limit ?? 20, 50);

  const events = await prisma.analyticsEvent.findMany({
    where: { storeId: tenantId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return events.map((event) => ({
    id: event.id,
    eventType: event.eventType,
    productId: event.productId,
    productName: event.product.name,
    productImageUrl: event.product.imageUrl,
    createdAt: event.createdAt,
  }));
}

// =============================================================================
// Daily Trends
// =============================================================================

export interface DailyTrend {
  date: Date;
  views: number;
  clicks: number;
}

/**
 * Get daily aggregated analytics trends for a date range.
 * Returns views and WhatsApp clicks grouped by date.
 *
 * @param tenantId - The tenant ID
 * @param options - Date range options
 * @returns Array of daily trend data
 */
export async function getDailyTrends(
  tenantId: string,
  options: {
    startDate: Date;
    endDate: Date;
  }
): Promise<DailyTrend[]> {
  const { startDate, endDate } = options;

  // Fetch all events in the date range
  const events = await prisma.analyticsEvent.findMany({
    where: {
      storeId: tenantId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      eventType: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Group events by date
  const dailyMap = new Map<string, { views: number; clicks: number }>();

  events.forEach((event) => {
    const dateKey = event.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD

    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, { views: 0, clicks: 0 });
    }

    const stats = dailyMap.get(dateKey)!;
    if (event.eventType === EventType.VIEW) {
      stats.views++;
    } else if (event.eventType === EventType.WHATSAPP_CLICK) {
      stats.clicks++;
    }
  });

  // Convert map to array and ensure all dates in range are included
  const trends: DailyTrend[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const stats = dailyMap.get(dateKey) || { views: 0, clicks: 0 };

    trends.push({
      date: new Date(currentDate),
      views: stats.views,
      clicks: stats.clicks,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return trends;
}
