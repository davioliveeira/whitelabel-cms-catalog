
// =============================================================================
// Super Admin Analytics Page
// =============================================================================
// Overview of system performance, active stores, and growth metrics
// =============================================================================

'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  Users,
  Store,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock Data for scaffolding
const stats = [
  {
    title: 'Total de Vendas',
    value: 'R$ 1.2M',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20'
  },
  {
    title: 'Lojas Ativas',
    value: '124',
    change: '+4',
    trend: 'up',
    icon: Store,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20'
  },
  {
    title: 'Novos Usuários',
    value: '2.4k',
    change: '-2%',
    trend: 'down',
    icon: Users,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20'
  },
  {
    title: 'Taxa de Conversão',
    value: '3.2%',
    change: '+0.8%',
    trend: 'up',
    icon: Activity,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20'
  },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Geral</h1>
          <p className="text-slate-400 mt-2">
            Visão geral do desempenho de todas as lojas e usuários do sistema.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="30">
            <SelectTrigger className="w-[180px] bg-slate-900 border-slate-800 text-slate-200">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 3 meses</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="text-slate-300 border-slate-700 hover:bg-slate-800">
            <Calendar className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-800 hover:border-slate-700 transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-400">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-white mt-2">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bg} ${stat.border} border`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                    {stat.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
                    ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}>
                        {stat.change}
                    </span>
                    <span className="text-slate-500 text-sm ml-2">vs. mês anterior</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section (Placeholder) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
        >
            <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-800 h-full">
                <CardHeader>
                    <CardTitle className="text-white">Receita Recorrente</CardTitle>
                    <CardDescription className="text-slate-400">Desempenho financeiro mensal</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center border-t border-slate-800/50">
                    <div className="text-center text-slate-500">
                        <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Gráfico de Receita em Breve</p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
        >
             <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-800 h-full">
                <CardHeader>
                    <CardTitle className="text-white">Lojas por Categoria</CardTitle>
                    <CardDescription className="text-slate-400">Distribuição de nichos</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center border-t border-slate-800/50">
                    <div className="text-center text-slate-500">
                        <Store className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Gráfico de Pizza em Breve</p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
      </div>
    </div>
  );
}
