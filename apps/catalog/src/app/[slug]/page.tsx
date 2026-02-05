// =============================================================================
// Public Catalog Page
// =============================================================================
// Main catalog page for public product display with tenant branding
// =============================================================================

import { notFound } from 'next/navigation';
import { findTenantBySlug, getAvailableProducts } from '@cms/shared';
import { CatalogEmptyState } from '@/components/catalog/CatalogEmptyState';
import { ProductsGrid } from '@/components/catalog/ProductsGrid';
import { CatalogHero } from '@/components/catalog/CatalogHero';

// =============================================================================
// Types
// =============================================================================

interface CatalogPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// =============================================================================
// Page Metadata
// =============================================================================

export async function generateMetadata({ params }: CatalogPageProps) {
  const { slug } = await params;
  const tenant = await findTenantBySlug(slug);

  if (!tenant) {
    return {
      title: 'Loja não encontrada',
    };
  }

  return {
    title: `${tenant.name} - Catálogo`,
    description: `Explore os produtos de ${tenant.name}`,
  };
}

// =============================================================================
// Page Component
// =============================================================================

export default async function CatalogPage({ params }: CatalogPageProps) {
  const { slug } = await params;

  // Fetch tenant data
  const tenant = await findTenantBySlug(slug);

  // Show 404 if tenant not found
  if (!tenant) {
    notFound();
  }

  // Fetch available products for this tenant
  const productsResult = await getAvailableProducts(tenant.id, {
    page: 1,
    limit: 100, // Show up to 100 products on catalog
  });

  const products = productsResult.products;

  return (
    <>
      {/* Hero/Banner Section */}
      <CatalogHero />

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8" data-products-grid>
        {products.length > 0 ? (
          <ProductsGrid products={products} tenant={tenant} config={tenant.catalogConfig} />
        ) : (
          <CatalogEmptyState tenant={tenant} />
        )}
      </div>
    </>
  );
}
