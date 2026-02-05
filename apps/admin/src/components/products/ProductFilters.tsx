// =============================================================================
// Product Filters Component
// =============================================================================
// Filter and search controls for product list
// Features: Brand filter, search input with debounce
// =============================================================================

'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';

// =============================================================================
// Types
// =============================================================================

interface ProductFiltersProps {
  brand?: string;
  search?: string;
  onFilterChange: (filters: { brand?: string; search?: string }) => void;
}

interface BrandCategoryResponse {
  brands: string[];
  categories: string[];
}

// =============================================================================
// Component
// =============================================================================

export function ProductFilters({
  brand,
  search: initialSearch = '',
  onFilterChange,
}: ProductFiltersProps) {
  const [searchInput, setSearchInput] = React.useState(initialSearch);
  const [selectedBrand, setSelectedBrand] = React.useState(brand);
  const debouncedSearch = useDebounce(searchInput, 300);

  // Fetch available brands for filter dropdown
  const { data: brandsData } = useQuery<BrandCategoryResponse>({
    queryKey: ['brands-categories'],
    queryFn: async () => {
      const response = await fetch('/api/products/brands-categories');
      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }
      return response.json();
    },
  });

  // Trigger filter change when debounced search changes
  React.useEffect(() => {
    onFilterChange({
      brand: selectedBrand,
      search: debouncedSearch || undefined,
    });
  }, [debouncedSearch, selectedBrand, onFilterChange]);

  // Handle clear all filters
  const handleClearFilters = () => {
    setSearchInput('');
    setSelectedBrand(undefined);
    onFilterChange({});
  };

  const hasActiveFilters = !!selectedBrand || !!searchInput;

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Search products by name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Brand Filter */}
      <Select
        value={selectedBrand || 'all'}
        onValueChange={(value) => setSelectedBrand(value === 'all' ? undefined : value)}
      >
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="All Brands" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Brands</SelectItem>
          {brandsData?.brands.map((brandName) => (
            <SelectItem key={brandName} value={brandName}>
              {brandName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="whitespace-nowrap"
        >
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
