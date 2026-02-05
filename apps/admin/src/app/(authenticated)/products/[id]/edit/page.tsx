// =============================================================================
// Edit Product Page
// =============================================================================
// Page for editing an existing product
// =============================================================================

'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductForm } from '@/components/products/ProductForm';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-slate-500 mt-2">
          Update product information
        </p>
      </div>

      <ProductForm
        productId={id}
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
