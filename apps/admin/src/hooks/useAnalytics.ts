// =============================================================================
// Analytics Query Hooks
// =============================================================================
// TanStack Query hooks for fetching analytics data with caching
// =============================================================================

import { useQuery } from '@tanstack/react-query';

export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Fetch analytics summary (total views, clicks, conversion rate)
 * Real-time updates: Refreshes every 30 seconds
 */
export function useAnalyticsSummary(tenantId: string, dateRange: DateRange) {
  return useQuery({
    queryKey: ['analytics', 'summary', tenantId, dateRange.start, dateRange.end],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
      });

      const response = await fetch(`/api/analytics/summary?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch analytics summary');
      }

      return response.json();
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
    refetchOnWindowFocus: true, // Refetch when tab becomes active
    refetchOnReconnect: true, // Refetch when network reconnects
    enabled: !!tenantId,
  });
}

/**
 * Fetch daily trend data for charts with real aggregated data
 */
export function useAnalyticsTrends(tenantId: string, dateRange: DateRange) {
  return useQuery({
    queryKey: ['analytics', 'trends', tenantId, dateRange.start, dateRange.end],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
      });

      const response = await fetch(`/api/analytics/trends?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch analytics trends');
      }

      return response.json();
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000, // Refetch every minute
    refetchOnWindowFocus: true,
    enabled: !!tenantId,
  });
}

/**
 * Fetch top products performance data
 * Real-time updates: Refreshes every 30 seconds
 */
export function useTopProducts(tenantId: string, dateRange: DateRange) {
  return useQuery({
    queryKey: ['analytics', 'top-products', tenantId, dateRange.start, dateRange.end],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
      });

      const response = await fetch(`/api/analytics/top-products?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch top products');
      }

      return response.json();
    },
    staleTime: 60 * 1000,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
    refetchOnWindowFocus: true, // Refetch when tab becomes active
    refetchOnReconnect: true, // Refetch when network reconnects
    enabled: !!tenantId,
  });
}

/**
 * Fetch recent analytics events for live activity feed
 * Near-realtime updates: Refreshes every 10 seconds when enabled (not true real-time)
 *
 * @param tenantId - The tenant ID
 * @param enabled - Whether to enable polling (controlled by live mode toggle)
 * @param limit - Number of recent events to fetch (default: 20)
 */
export function useRecentEvents(
  tenantId: string,
  enabled: boolean,
  limit = 20
) {
  return useQuery({
    queryKey: ['analytics', 'recent-events', tenantId, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });

      const response = await fetch(`/api/analytics/recent-events?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch recent events');
      }

      return response.json();
    },
    staleTime: 5 * 1000, // 5 seconds - data becomes stale quickly for live feed
    refetchInterval: enabled ? 10 * 1000 : false, // Poll every 10 seconds if enabled, otherwise no polling
    refetchOnWindowFocus: true, // Refetch when tab becomes active
    refetchOnReconnect: true, // Refetch when network reconnects
    enabled: enabled && !!tenantId, // Only fetch if live mode is enabled and tenantId exists
    // Retry logic for network resilience
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff: 1s, 2s, 4s, max 30s
  });
}
