import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Image Skeleton */}
        <div className="relative aspect-square w-full bg-slate-200 animate-pulse" />

        {/* Content Skeleton */}
        <div className="p-4 space-y-3">
          {/* Product Name Skeleton (2 lines) */}
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2" />
          </div>

          {/* Brand Skeleton */}
          <div className="h-3 bg-slate-200 rounded animate-pulse w-1/3" />

          {/* Price Skeleton */}
          <div className="space-y-1">
            <div className="h-3 bg-slate-200 rounded animate-pulse w-1/4" />
            <div className="h-6 bg-slate-200 rounded animate-pulse w-1/3" />
          </div>

          {/* Button Skeleton */}
          <div className="h-10 bg-slate-200 rounded animate-pulse w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
