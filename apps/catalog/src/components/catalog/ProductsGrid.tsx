'use client';

import * as React from 'react';
import { ProductCard } from './ProductCard';
import { useCatalog } from './CatalogProvider';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  brand?: string | null;
  category?: string | null;
  description?: string | null;
  salePrice: number;
  originalPrice?: number | null;
  imageUrl?: string | null;
  isAvailable: boolean;
}

interface Tenant {
  id: string;
  whatsappPrimary?: string | null;
  whatsappSecondary?: string | null;
  catalogConfig?: any;
}

interface ProductsGridProps {
  products: Product[];
  tenant: Tenant;
  config?: any;
}

export function ProductsGrid({ products, tenant, config }: ProductsGridProps) {
  const { searchQuery } = useCatalog();

  // Get config from props or tenant
  const gridConfig = config || tenant.catalogConfig || {
    layout: { type: 'grid', columns: 3, gap: 6, cardStyle: 'default' },
  };

  // Filter products based on search query
  const filteredProducts = React.useMemo(() => {
    if (!searchQuery.trim()) return products;

    const query = searchQuery.toLowerCase().trim();
    return products.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(query);
      const brandMatch = product.brand?.toLowerCase().includes(query);
      const categoryMatch = product.category?.toLowerCase().includes(query);
      const descriptionMatch = product.description?.toLowerCase().includes(query);

      return nameMatch || brandMatch || categoryMatch || descriptionMatch;
    });
  }, [products, searchQuery]);

  const layoutType = gridConfig.layout?.type || 'grid';
  const columns = gridConfig.layout?.columns || 3;
  const gap = gridConfig.layout?.gap || 6;

  // Dynamic grid classes based on config
  const gridClasses = cn(
    layoutType === 'grid' ? 'grid' : 'flex flex-col',
    `gap-3 md:gap-${gap}`, // Compact gap on mobile
    layoutType === 'grid' && filteredProducts.length === 1 && 'grid-cols-1 max-w-md mx-auto',
    layoutType === 'grid' && filteredProducts.length === 2 && 'grid-cols-2 max-w-3xl mx-auto',
    layoutType === 'grid' && filteredProducts.length >= 3 && `grid-cols-2 md:grid-cols-3 lg:grid-cols-${columns}` // Always at least 2 cols on mobile if enough products
  );

  // Show message if no results
  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted-foreground">
          {searchQuery
            ? `Nenhum produto encontrado para "${searchQuery}"`
            : 'Nenhum produto disponível'}
        </p>
        {searchQuery && (
          <p className="text-sm text-muted-foreground/60 mt-2">
            Tente buscar por outro termo
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Results count */}
      {searchQuery && (
        <div className="mb-4 text-sm text-gray-600">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
        </div>
      )}

      {/* Products Grid */}
      <div className={gridClasses}>
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} tenant={tenant} config={gridConfig} />
        ))}
      </div>
    </>
  );
}
