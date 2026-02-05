// =============================================================================
// Tenant Catalog Layout
// =============================================================================
// Layout for dynamic tenant routes with theme and tenant context.
// =============================================================================

import { notFound } from 'next/navigation';
import { getTenantBySlug } from '@/lib/theme';
import { TenantProvider } from '@/components/tenant/TenantProvider';
import { CatalogProvider } from '@/components/catalog/CatalogProvider';
import { CatalogHeader } from '@/components/tenant/CatalogHeader';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import type { ThemeConfig } from '@cms/shared';

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

/**
 * Generate metadata for the tenant page.
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);

  if (!tenant) {
    return {
      title: 'Loja não encontrada',
    };
  }

  return {
    title: `${tenant.name} - Catálogo`,
    description: `Confira os produtos de ${tenant.name}`,
  };
}

/**
 * Tenant Layout Component.
 * Applies theme CSS variables and provides tenant context.
 */
export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);

  if (!tenant) {
    notFound();
  }

  // Get theme config from tenant (fallback to undefined if not set)
  const initialConfig = (tenant.catalogConfig as ThemeConfig) || undefined;

  return (
    <TenantProvider tenant={tenant}>
      <ThemeProvider initialConfig={initialConfig}>
        <CatalogProvider>
          {/* Catalog Header */}
          <CatalogHeader />

          {/* Main Content */}
          <main className="min-h-screen bg-background">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-card border-t py-8">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} {tenant.name}. Todos os direitos reservados.</p>
            </div>
          </footer>
        </CatalogProvider>
      </ThemeProvider>
    </TenantProvider>
  );
}
