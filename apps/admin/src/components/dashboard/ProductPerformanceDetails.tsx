// =============================================================================
// Product Performance Details Component
// =============================================================================
// Expandable row showing daily performance chart for a product
// =============================================================================

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductPerformanceDetailsProps {
  productId: string;
  productName: string;
  tenantId: string;
}

export function ProductPerformanceDetails({
  productId,
  productName,
  tenantId,
}: ProductPerformanceDetailsProps) {
  // TODO: Implement daily performance chart
  // Requirements:
  // 1. Fetch daily analytics data for this specific product
  // 2. Display a mini line chart showing views and clicks over time
  // 3. Use recharts library (needs to be installed: npm install recharts)
  // 4. Show last 7 or 30 days of data
  // 5. Add loading and error states

  return (
    <Card className="mt-4 border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="text-base">Daily Performance: {productName}</CardTitle>
        <CardDescription>View and click trends over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg bg-muted/20">
          <div className="text-center text-muted-foreground">
            <p className="text-sm font-semibold mb-2">Mini-Chart Placeholder</p>
            <p className="text-xs">TODO: Install recharts and implement daily trend chart</p>
            <p className="text-xs mt-2 text-muted-foreground/70">
              Product ID: {productId}
            </p>
            <div className="mt-3 text-xs">
              <p className="font-mono bg-background px-2 py-1 rounded inline-block">
                npm install recharts
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
