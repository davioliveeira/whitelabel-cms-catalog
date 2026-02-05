// =============================================================================
// Product Import Page
// =============================================================================
// Bulk import products from CSV/Excel files
// =============================================================================

import { ProductImport } from '@/components/products/ProductImport';

export default function ProductImportPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Import Products</h1>
        <p className="text-slate-600 mt-2">
          Bulk import products from a CSV or Excel file
        </p>
      </div>
      <ProductImport />
    </div>
  );
}
