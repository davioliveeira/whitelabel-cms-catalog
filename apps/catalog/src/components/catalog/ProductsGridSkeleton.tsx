import * as React from 'react';
import { ProductCardSkeleton } from './ProductCardSkeleton';

interface ProductsGridSkeletonProps {
  count?: number;
}

export function ProductsGridSkeleton({ count = 8 }: ProductsGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
