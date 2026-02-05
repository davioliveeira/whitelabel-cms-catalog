// =============================================================================
// New Product Page
// =============================================================================
// Page for creating a new product
// =============================================================================

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/products/ProductForm';

export default function NewProductPage() {
  const router = useRouter();

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create Product</h1>
        <p className="text-slate-500 mt-2">
          Add a new product to your catalog
        </p>
      </div>

      <ProductForm
        onSuccess={() => {
          router.push('/products');
        }}
        onCancel={() => {
          router.push('/products');
        }}
      />
    </div>
  );
}
