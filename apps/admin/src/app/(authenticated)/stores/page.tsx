// =============================================================================
// Stores Overview Page - Super Admin only
// =============================================================================
// Platform-wide view of all stores with metrics
// =============================================================================

'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useStores } from '@/hooks/useStores';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Store, Eye, MessageCircle, ExternalLink, Package } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

const CATALOG_URL =
  process.env.NEXT_PUBLIC_CATALOG_URL || 'http://localhost:8001';

export default function StoresPage() {
  const { role, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { data: stores, isLoading: storesLoading, error } = useStores();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (role !== 'SUPER_ADMIN') {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              This page is only accessible to Super Administrators.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalStores = stores?.length ?? 0;
  const totalProducts = stores?.reduce((sum, s) => sum + s.productsCount, 0) ?? 0;
  const totalViews =
    stores?.reduce((sum, s) => sum + s.analytics.views, 0) ?? 0;

  return (
    <div className="container mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Visão Geral das Lojas
          </h1>
          <p className="text-muted-foreground mt-2">
            Todas as lojas cadastradas na plataforma com métricas consolidadas
          </p>
        </div>
        <Link href="/users">
          <Button variant="outline">
            <Store className="mr-2 h-4 w-4" />
            Gerenciar Usuários
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Lojas</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStores}</div>
            <p className="text-xs text-muted-foreground">Lojas cadastradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Produtos na plataforma</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Visualizações (30d)
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Stores Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Lojas</CardTitle>
          <CardDescription>
            Lista completa com métricas e link para o catálogo público
          </CardDescription>
        </CardHeader>
        <CardContent>
          {storesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>
                Erro ao carregar lojas. Tente novamente.
              </AlertDescription>
            </Alert>
          ) : !stores || stores.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhuma loja cadastrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Loja</th>
                    <th className="text-left p-4 font-medium">Slug</th>
                    <th className="text-left p-4 font-medium">Email</th>
                    <th className="text-left p-4 font-medium">Produtos</th>
                    <th className="text-left p-4 font-medium">Views (30d)</th>
                    <th className="text-left p-4 font-medium">Cliques WhatsApp</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Criado em</th>
                    <th className="text-right p-4 font-medium">Catálogo</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store) => (
                    <tr key={store.id} className="border-b hover:bg-slate-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{store.name}</p>
                          <Badge
                            variant={
                              store.role === 'SUPER_ADMIN' ? 'default' : 'secondary'
                            }
                            className="mt-1 text-xs"
                          >
                            {store.role}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4">
                        <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                          {store.slug}
                        </code>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {store.email}
                      </td>
                      <td className="p-4">{store.productsCount}</td>
                      <td className="p-4 flex items-center gap-1">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        {store.analytics.views.toLocaleString()}
                      </td>
                      <td className="p-4 flex items-center gap-1">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        {store.analytics.whatsappClicks.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          <Badge
                            variant={store.isActive ? 'default' : 'destructive'}
                          >
                            {store.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                          {store.onboardingComplete && (
                            <Badge variant="outline">Onboarding OK</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {format(new Date(store.createdAt), 'dd/MM/yyyy')}
                      </td>
                      <td className="p-4 text-right">
                        <a
                          href={`${CATALOG_URL}/${store.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Ver catálogo
                          </Button>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
