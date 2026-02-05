// =============================================================================
// Products List Page
// =============================================================================
// Main product management page with filters, search, and bulk actions
// =============================================================================

'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Plus, Upload, PackageX } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductTable } from '@/components/products/ProductTable';
import { ProductForm } from '@/components/products/ProductForm';
import type { ProductListResponse } from '@cms/shared';

// =============================================================================
// Skeleton Components
// =============================================================================

function TableSkeleton() {
  return (
    <div className="rounded-md border">
      <div className="p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-12 w-12 bg-slate-200 rounded-md animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded animate-pulse w-1/3" />
              <div className="h-3 bg-slate-200 rounded animate-pulse w-1/4" />
            </div>
            <div className="h-8 bg-slate-200 rounded animate-pulse w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Pagination Component
// =============================================================================

function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}) {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between py-4">
      <div className="text-sm text-slate-600">
        Showing <strong>{start}</strong> to <strong>{end}</strong> of{' '}
        <strong>{total}</strong> products
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>

        <div className="text-sm text-slate-600">
          Page <strong>{page}</strong> of <strong>{totalPages}</strong>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  // Extract query params
  const page = parseInt(searchParams.get('page') || '1');
  const brand = searchParams.get('brand') || undefined;
  const search = searchParams.get('search') || undefined;

  // Fetch products with filters
  const { data, isLoading, refetch } = useQuery<ProductListResponse>({
    queryKey: ['products', page, brand, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (brand) params.set('brand', brand);
      if (search) params.set('search', search);

      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
  });

  // Handle filter change
  const handleFilterChange = React.useCallback((filters: { brand?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.search) params.set('search', filters.search);
    // Reset to page 1 when filters change
    params.set('page', '1');

    router.push(`/products?${params.toString()}`);
  }, [router]);

  // Handle page change
  const handlePageChange = React.useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/products?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-slate-600 mt-1">
            Manage your product inventory
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/products/import')}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import Products
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <ProductFilters
        brand={brand}
        search={search}
        onFilterChange={handleFilterChange}
      />

      {/* Content */}
      {isLoading ? (
        <TableSkeleton />
      ) : data && data.products.length > 0 ? (
        <>
          <ProductTable products={data.products} onRefetch={refetch} />
          {data.totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={data.totalPages}
              total={data.total}
              limit={data.limit}
              onPageChange={handlePageChange}
            />
          )}
        </>
      ) : (
        <EmptyState
          icon={PackageX}
          title={
            search || brand
              ? 'No products found'
              : 'No products yet'
          }
          description={
            search || brand
              ? 'Try adjusting your search or filters to find what you\'re looking for'
              : 'Get started by adding your first product or importing products from a CSV file'
          }
          action={
            search || brand ? (
              <Button variant="outline" onClick={() => handleFilterChange({})}>
                Clear Filters
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
                <Button variant="outline" onClick={() => router.push('/products/import')}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Products
                </Button>
              </div>
            )
          }
        />
      )}

      {/* Create Product Sheet Modal */}
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create New Product</SheetTitle>
            <SheetDescription>
              Add a new product to your catalog
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <ProductForm
              onSuccess={() => {
                setIsCreateOpen(false);
                refetch();
              }}
              onCancel={() => setIsCreateOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// =============================================================================
// Page Wrapper with Suspense
// =============================================================================

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsPageContent />
    </Suspense>
  );
}

function ProductsPageSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="h-9 w-40 bg-slate-200 rounded animate-pulse" />
          <div className="h-5 w-60 bg-slate-200 rounded animate-pulse mt-2" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-40 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="h-12 bg-slate-200 rounded animate-pulse" />
      <div className="rounded-md border">
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-12 w-12 bg-slate-200 rounded-md animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded animate-pulse w-1/3" />
                <div className="h-3 bg-slate-200 rounded animate-pulse w-1/4" />
              </div>
              <div className="h-8 bg-slate-200 rounded animate-pulse w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
