'use client';

import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  isLoading?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  suffix?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  isLoading,
  trend,
  suffix,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-24" />
          </CardTitle>
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-bold uppercase tracking-tight">{title}</CardTitle>
        {trend && (
           <div className={`text-xs px-2 py-0.5 border-2 font-bold ${trend.isPositive ? 'bg-green-100 text-green-700 border-green-700' : 'bg-red-100 text-red-700 border-red-700'}`}>
             {trend.isPositive ? '+' : ''}{trend.value}%
           </div>
        )}
        {!trend && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
          {suffix && <span className="text-lg text-muted-foreground ml-1">{suffix}</span>}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 font-medium">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
