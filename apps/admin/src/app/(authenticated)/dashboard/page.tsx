// =============================================================================
// Analytics Dashboard Page
// =============================================================================
// Main dashboard showing product engagement metrics for store owners
// =============================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { Eye, MessageCircle, Percent, Settings, Package, Upload, Palette } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { TrendsChart } from '@/components/dashboard/TrendsChart';
import { TopProductsTable } from '@/components/dashboard/TopProductsTable';
import { LiveActivityFeed } from '@/components/dashboard/LiveActivityFeed';
import { DateRangePicker, DateRangeValue } from '@/components/dashboard/DateRangePicker';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAnalyticsSummary } from '@/hooks/useAnalytics';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const router = useRouter();

  // Get authenticated user and tenant ID from session
  const { user, storeId: tenantId, isLoading: authLoading } = useAuth();

  // Date range state - default to last 7 days
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    start: startOfDay(subDays(new Date(), 7)),
    end: endOfDay(new Date()),
  });

  // Fetch analytics summary (only if tenantId is available)
  const { data: summary, isLoading, error } = useAnalyticsSummary(
    tenantId || '',
    dateRange
  );

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Safety check - should not happen due to middleware redirect
  if (!tenantId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Authentication Error</h1>
          <p className="text-muted-foreground mt-2">No tenant context available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">
            Acompanhe métricas de engajamento
          </p>
        </div>
        <div className="flex items-center space-x-2" data-tour="date-picker">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          <p className="font-semibold">Error loading analytics</p>
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-tour="metrics">
        <MetricCard
          title="Total Views"
          value={summary?.views ?? 0}
          icon={Eye}
          description="Product page views"
          isLoading={isLoading}
        />
        <MetricCard
          title="WhatsApp Clicks"
          value={summary?.whatsappClicks ?? 0}
          icon={MessageCircle}
          description="Click-to-WhatsApp conversions"
          isLoading={isLoading}
        />
        <MetricCard
          title="Conversion Rate"
          value={summary?.conversionRate ?? 0}
          suffix="%"
          icon={Percent}
          description="Clicks / Views ratio"
          isLoading={isLoading}
        />
      </div>

      {/* Daily Trends Chart */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <TrendsChart tenantId={tenantId} dateRange={dateRange} />
      </div>

      {/* Main Content Grid: Table + Live Feed */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Top Products Table */}
        <div className="col-span-4 lg:col-span-5">
           <TopProductsTable tenantId={tenantId} dateRange={dateRange} />
        </div>

        {/* Live Activity Feed */}
        <div className="col-span-3 lg:col-span-2">
          <ErrorBoundary>
            <LiveActivityFeed tenantId={tenantId} />
          </ErrorBoundary>
        </div>
      </div>

    </div>
  );
}
