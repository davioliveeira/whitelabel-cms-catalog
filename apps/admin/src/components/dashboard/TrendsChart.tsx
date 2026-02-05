'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalyticsTrends } from '@/hooks/useAnalytics';
import { format } from 'date-fns';
import { Loader2, TrendingUp } from 'lucide-react';

interface TrendsChartProps {
  tenantId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
}

export function TrendsChart({ tenantId, dateRange }: TrendsChartProps) {

  const { data: trends, isLoading } = useAnalyticsTrends(tenantId, dateRange);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Trends</CardTitle>
          <CardDescription>Views and WhatsApp clicks over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for recharts
  const chartData = trends?.map((day: any) => ({
    date: format(new Date(day.date), 'MMM dd'),
    Views: day.views,
    Clicks: day.clicks,
  })) || [];

  return (
    <Card className="col-span-7">
      <CardHeader>
        <CardTitle>Total Visitors</CardTitle>
        <CardDescription>
          Total visitors for the last 7 days
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {chartData.length === 0 ? (
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
             <p>No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                  contentStyle={{
                    backgroundColor: '#09090b',
                    border: '1px solid #27272a',
                    borderRadius: '6px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#f97316' }}
              />
              <Area 
                type="monotone" 
                dataKey="Views" 
                stroke="#f97316" 
                fillOpacity={1} 
                fill="url(#colorViews)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
