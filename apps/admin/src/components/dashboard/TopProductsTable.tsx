// =============================================================================
// Top Products Table Component
// =============================================================================
// Displays product performance metrics with sorting, search, and pagination
// =============================================================================

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTopProducts } from '@/hooks/useAnalytics';
import { ChevronUp, ChevronDown, Minus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductPerformance } from '@cms/shared';
import { ProductPerformanceDetails } from './ProductPerformanceDetails';

interface TopProductsTableProps {
  tenantId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
}

type SortColumn = 'name' | 'views' | 'clicks' | 'conversionRate';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 20;

export function TopProductsTable({ tenantId, dateRange }: TopProductsTableProps) {

  const { data: products = [], isLoading, error } = useTopProducts(tenantId, dateRange);

  // State for sorting, search, and pagination
  const [sortColumn, setSortColumn] = useState<SortColumn>('views');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Handle sort column click
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((product) =>
        product.productName.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case 'name':
          comparison = a.productName.localeCompare(b.productName);
          break;
        case 'views':
          comparison = a.views - b.views;
          break;
        case 'clicks':
          comparison = a.whatsappClicks - b.whatsappClicks;
          break;
        case 'conversionRate':
          comparison = a.conversionRate - b.conversionRate;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [products, searchQuery, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Render sort icon
  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="inline ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="inline ml-1 h-4 w-4" />
    );
  };

  // Render trend indicator
  const TrendIndicator = ({ product }: { product: ProductPerformance }) => {
    if (product.trend === 'up') {
      return (
        <Badge variant="default" className="bg-green-500">
          <ChevronUp className="h-3 w-3 mr-1" />
          {product.trendPercentage > 0 && `${product.trendPercentage}%`}
        </Badge>
      );
    }
    if (product.trend === 'down') {
      return (
        <Badge variant="destructive">
          <ChevronDown className="h-3 w-3 mr-1" />
          {product.trendPercentage < 0 && `${Math.abs(product.trendPercentage)}%`}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <Minus className="h-3 w-3" />
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
        <CardDescription>Most viewed and clicked products</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Error State */}
        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-4">
            <p className="font-semibold">Error loading products</p>
            <p className="text-sm">{error.message}</p>
          </div>
        )}

        {/* Search Input */}
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="max-w-sm"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {/* Table */}
        {!isLoading && paginatedProducts.length > 0 && (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('name')}
                    >
                      Product <SortIcon column="name" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 text-right"
                      onClick={() => handleSort('views')}
                    >
                      Views <SortIcon column="views" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 text-right"
                      onClick={() => handleSort('clicks')}
                    >
                      WhatsApp Clicks <SortIcon column="clicks" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 text-right"
                      onClick={() => handleSort('conversionRate')}
                    >
                      Conversion Rate <SortIcon column="conversionRate" />
                    </TableHead>
                    <TableHead className="text-center">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow
                      key={product.productId}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        setExpandedRowId(
                          expandedRowId === product.productId ? null : product.productId
                        )
                      }
                    >
                      <TableCell>
                        {product.productImageUrl ? (
                          <img
                            src={product.productImageUrl}
                            alt={product.productName}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{product.productName}</TableCell>
                      <TableCell className="text-right">{product.views.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        {product.whatsappClicks.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.conversionRate.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-center">
                        <TrendIndicator product={product} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedProducts.length)} of{' '}
                {filteredAndSortedProducts.length} products
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="text-sm">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && paginatedProducts.length === 0 && !error && (
          <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-semibold mb-2">No products found</p>
              {searchQuery ? (
                <p className="text-sm">Try adjusting your search query</p>
              ) : (
                <p className="text-sm">No product analytics data available yet</p>
              )}
            </div>
          </div>
        )}

        {/* Expandable Row Details with Mini-Chart */}
        {expandedRowId && (
          <ProductPerformanceDetails
            productId={expandedRowId}
            productName={
              paginatedProducts.find((p) => p.productId === expandedRowId)?.productName ||
              'Product'
            }
            tenantId={tenantId}
          />
        )}
      </CardContent>
    </Card>
  );
}
