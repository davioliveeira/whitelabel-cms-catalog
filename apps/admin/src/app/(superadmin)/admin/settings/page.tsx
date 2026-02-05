// =============================================================================
// Settings Page (SuperAdmin)
// =============================================================================
// System-wide settings for SUPER_ADMIN
// Premium Dark Design Implementation
// =============================================================================

'use client';

import * as React from 'react';
import { Settings, Database, Mail, Shield, AlertTriangle, ArrowRight, Lock, Bell, Server } from 'lucide-react';
import { motion } from 'framer-motion';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// =============================================================================
// Settings Component
// =============================================================================

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-white"
        >
          Configurações do Sistema
        </motion.h1>
        <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 mt-2"
        >
          Parâmetros globais e configurações de infraestrutura
        </motion.p>
      </div>

      {/* Main Alert Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border-indigo-500/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none -mr-16 -mt-16" />
            <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center text-center relative z-10">
                <div className="h-16 w-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6">
                    <Settings className="h-8 w-8 text-indigo-400 animate-slow-spin" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                Central de Controle
                </h2>
                <p className="text-slate-400 max-w-lg mx-auto mb-8">
                O painel de configurações avançadas está sendo refatorado para oferecer maior controle sobre tenants, webhooks e integrações de pagamento.
                </p>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-indigo-500/50 text-indigo-300 bg-indigo-500/10 px-4 py-1.5">
                        Em Desenvolvimento
                    </Badge>
                    <Badge variant="outline" className="border-slate-700 text-slate-400 px-4 py-1.5">
                        v2.0.0-alpha
                    </Badge>
                </div>
            </CardContent>
        </Card>
      </motion.div>

      {/* Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Database Config */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <Card className="h-full bg-slate-900/50 backdrop-blur-md border-slate-800 hover:border-slate-700 transition-all group hover:-translate-y-1">
            <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Database className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Banco de Dados</h3>
                        <p className="text-xs text-slate-500">Conexão & Storage</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div className="p-3 rounded bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
                        <span className="text-sm text-slate-400">Status</span>
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">CONECTADO</span>
                    </div>
                    <ul className="space-y-2 mt-4">
                        {['Backup Automático', 'Retenção de Logs', 'Query Insights'].map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                {item}
                            </li>
                        ))}
                    </ul>
                    <Button variant="ghost" className="w-full mt-2 text-slate-400 hover:text-white hover:bg-slate-800 group-hover:text-blue-400 transition-colors justify-between">
                        Gerenciar
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
            </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <Card className="h-full bg-slate-900/50 backdrop-blur-md border-slate-800 hover:border-slate-700 transition-all group hover:-translate-y-1">
            <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        <Bell className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Notificações</h3>
                        <p className="text-xs text-slate-500">Alertas & Emails</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div className="p-3 rounded bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
                        <span className="text-sm text-slate-400">Provedor</span>
                        <span className="text-xs font-mono text-slate-300">RESEND</span>
                    </div>
                    <ul className="space-y-2 mt-4">
                        {['Templates de Email', 'Webhooks Slack', 'SMS Gateway'].map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                                <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                                {item}
                            </li>
                        ))}
                    </ul>
                    <Button variant="ghost" className="w-full mt-2 text-slate-400 hover:text-white hover:bg-slate-800 group-hover:text-orange-400 transition-colors justify-between">
                        Configurar
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
            </Card>
        </motion.div>

        {/* Security */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
        >
            <Card className="h-full bg-slate-900/50 backdrop-blur-md border-slate-800 hover:border-slate-700 transition-all group hover:-translate-y-1">
            <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Segurança</h3>
                        <p className="text-xs text-slate-500">Acesso & Auditoria</p>
                    </div>
                </div>
                
                 <div className="space-y-4">
                    <div className="p-3 rounded bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
                        <span className="text-sm text-slate-400">Nível</span>
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">RÍGIDO</span>
                    </div>
                    <ul className="space-y-2 mt-4">
                        {['Logs de Acesso', 'Blacklist de IP', 'MFA Obrigatório'].map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                {item}
                            </li>
                        ))}
                    </ul>
                    <Button variant="ghost" className="w-full mt-2 text-slate-400 hover:text-white hover:bg-slate-800 group-hover:text-emerald-400 transition-colors justify-between">
                        Auditoria
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
            </Card>
        </motion.div>
      </div>
    </div>
  );
}
