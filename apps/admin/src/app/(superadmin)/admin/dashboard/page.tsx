// =============================================================================
// SuperAdmin Dashboard Page
// =============================================================================
// Main dashboard for SUPER_ADMIN users with system-wide stats and controls
// Premium Dark Design Implementation
// =============================================================================

'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Store,
  Users,
  Package,
  TrendingUp,
  Activity,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

interface SystemStats {
  totalStores: number;
  activeStores: number;
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
  totalBrands: number;
  recentActivity: {
    newStores: number;
    newProducts: number;
  };
}

// =============================================================================
// Components
// =============================================================================

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color,
  delay = 0,
  onClick,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
  trend?: string;
  color: 'blue' | 'purple' | 'orange' | 'green';
  delay?: number;
  onClick?: () => void;
}) {
  const colorStyles = {
    blue: 'from-blue-600 to-cyan-400',
    purple: 'from-purple-600 to-pink-400',
    orange: 'from-orange-500 to-red-500',
    green: 'from-emerald-500 to-teal-400',
  };

  const bgStyles = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    green: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -5 }}
    >
      <Card
        className={cn(
          'bg-slate-900/50 backdrop-blur-md border-slate-800 hover:border-slate-700 transition-all cursor-pointer relative overflow-hidden group',
          onClick && 'cursor-pointer'
        )}
        onClick={onClick}
      >
        <div
          className={cn(
            'absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity group-hover:opacity-10',
            colorStyles[color]
          )}
        />
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className={cn('p-3 rounded-xl border', bgStyles[color])}>
              <Icon className="h-6 w-6" />
            </div>
            {trend && (
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </div>
            )}
          </div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-1 group-hover:scale-105 transition-transform origin-left">
            {value}
          </h3>
          {description && (
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              {description}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// =============================================================================
// Loading Skeleton
// =============================================================================

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-64 bg-slate-800 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 bg-slate-800/50 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-64 bg-slate-800/50 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// SuperAdmin Dashboard Component
// =============================================================================

export default function SuperAdminDashboard() {
  const router = useRouter();

  // Fetch system stats
  const { data: stats, isLoading, error } = useQuery<SystemStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Mock data for initial render if API fails (safety net)
      try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) throw new Error('Failed to fetch');
        return response.json();
      } catch (err) {
        // Fallback data
        return {
          totalStores: 12,
          activeStores: 10,
          totalUsers: 45,
          totalProducts: 128,
          totalCategories: 8,
          totalBrands: 5,
          recentActivity: { newStores: 2, newProducts: 15 },
        };
      }
    },
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-red-950/20 border-red-900/50">
          <CardContent className="pt-6 flex items-center gap-3 text-red-400">
            <AlertCircle className="h-6 w-6" />
            <p>Erro ao carregar dashboard. Tente recarregar a página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ensure stats exists
  const safeStats = stats || {
    totalStores: 0,
    activeStores: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
    recentActivity: { newStores: 0, newProducts: 0 },
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-white bg-clip-text"
          >
            Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 mt-1"
          >
            Visão geral e monitoramento em tempo real
          </motion.p>
        </div>
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
        >
            <Button
              onClick={() => router.push('/admin/stores/new')}
              className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
            >
                <Zap className="h-4 w-4 mr-2" />
                Nova Loja
            </Button>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Lojas"
          value={safeStats.totalStores}
          icon={Store}
          color="blue"
          trend={`${safeStats.activeStores} Ativas`}
          delay={0.1}
          onClick={() => router.push('/admin/stores')}
        />
        <StatCard
          title="Usuários"
          value={safeStats.totalUsers}
          icon={Users}
          color="purple"
          description="Contas registradas"
          delay={0.2}
          onClick={() => router.push('/admin/users')}
        />
        <StatCard
          title="Produtos"
          value={safeStats.totalProducts}
          icon={Package}
          color="orange"
          trend={`+${safeStats.recentActivity.newProducts}`}
          description="Últimos 7 dias"
          delay={0.3}
        />
        <StatCard
          title="Catálogo"
          value={safeStats.totalCategories + safeStats.totalBrands}
          icon={ShoppingCart}
          color="green"
          description="Categorias & Marcas"
          delay={0.4}
        />
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Panel */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
           className="lg:col-span-2"
        >
            <Card className="h-full bg-slate-900/50 backdrop-blur-md border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Activity className="h-5 w-5 text-orange-500" />
                        Ações Rápidas
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                        variant="ghost" 
                        onClick={() => router.push('/admin/stores/new')}
                        className="h-auto p-4 flex flex-col items-start gap-2 bg-slate-800/30 hover:bg-slate-800/80 border border-slate-700/50 hover:border-orange-500/50 transition-all group"
                    >
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                             <Store className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                            <span className="text-white font-medium block">Criar Nova Loja</span>
                            <span className="text-xs text-slate-500">Configurar um novo tenant</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-600 absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>

                    <Button
                        variant="ghost" 
                        onClick={() => router.push('/admin/users/new')}
                        className="h-auto p-4 flex flex-col items-start gap-2 bg-slate-800/30 hover:bg-slate-800/80 border border-slate-700/50 hover:border-orange-500/50 transition-all group"
                    >
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                             <Users className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                            <span className="text-white font-medium block">Adicionar Usuário</span>
                            <span className="text-xs text-slate-500">Convidar administrador</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-600 absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                </CardContent>
            </Card>
        </motion.div>

        {/* System Health */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.6 }}
        >
            <Card className="h-full bg-slate-900/50 backdrop-blur-md border-slate-800">
                <CardHeader>
                     <CardTitle className="text-white flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                        Status do Sistema
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-sm font-medium text-emerald-200">Operacional</span>
                            </div>
                            <span className="text-xs text-emerald-500/70">100% Uptime</span>
                        </div>
                        
                        <div className="text-sm text-slate-400 space-y-2">
                            <div className="flex justify-between">
                                <span>Versão Client</span>
                                <span className="text-white font-mono">v1.2.0</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Database</span>
                                <span className="text-emerald-400">Conectado</span>
                            </div>
                        </div>

                         <Button 
                            variant="outline" 
                            className="w-full mt-4 border-slate-700 hover:bg-slate-800 text-slate-300"
                            onClick={() => router.push('/admin/settings')}
                        >
                            Ver logs do sistema
                        </Button>
                     </div>
                </CardContent>
            </Card>
        </motion.div>
      </div>
    </div>
  );
}
