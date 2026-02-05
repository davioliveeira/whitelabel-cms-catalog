'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendsChart } from '@/components/dashboard/TrendsChart';
import { DateRangePicker, DateRangeValue } from '@/components/dashboard/DateRangePicker';
import { startOfDay, subDays, endOfDay } from 'date-fns';
import { useState } from 'react';
import { useAnalyticsSummary } from '@/hooks/useAnalytics';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Eye, MessageCircle, Percent, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
  const { storeId: tenantId } = useAuth();
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    start: startOfDay(subDays(new Date(), 30)),
    end: endOfDay(new Date()),
  });

  const { data: summary, isLoading } = useAnalyticsSummary(
    tenantId || '',
    dateRange
  );

  if (!tenantId) return null;

  return (
    <div className="flex-1 space-y-6 p-8">
       {/* Header */}
       <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatórios Detalhados</h2>
          <p className="text-muted-foreground">
             Análise de desempenho da sua loja nos últimos 30 dias
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Views"
          value={summary?.views ?? 0}
          icon={Eye}
          description="Visualizações de produtos"
          isLoading={isLoading}
        />
        <MetricCard
          title="WhatsApp Clicks"
          value={summary?.whatsappClicks ?? 0}
          icon={MessageCircle}
          description="Conversões para WhatsApp"
          isLoading={isLoading}
        />
        <MetricCard
          title="Conversion Rate"
          value={summary?.conversionRate ?? 0}
          suffix="%"
          icon={Percent}
          description="Taxa de conversão"
          isLoading={isLoading}
        />
        <MetricCard
          title="Avg. Daily Views"
          value={Math.round((summary?.views ?? 0) / 30)}
          icon={TrendingUp}
          description="Média diária"
          isLoading={isLoading}
        />
      </div>

       {/* Charts Section */}
       <div className="grid gap-6 md:grid-cols-1">
          <Card className="col-span-1">
             <CardHeader>
                <CardTitle>Tendência de Vendas e Acessos</CardTitle>
             </CardHeader>
             <CardContent className="pl-2">
                <TrendsChart tenantId={tenantId} dateRange={dateRange} />
             </CardContent>
          </Card>
       </div>
    </div>
  );
}
