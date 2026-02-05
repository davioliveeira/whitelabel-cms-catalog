import { ProductsGridSkeleton } from '@/components/catalog/ProductsGridSkeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-4 py-8">
        <ProductsGridSkeleton count={8} />
      </main>
    </div>
  );
}
