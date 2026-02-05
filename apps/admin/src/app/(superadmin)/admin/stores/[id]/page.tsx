
'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Trash2,
  Store,
  Globe,
  Mail,
  Phone,
  ExternalLink,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

// =============================================================================
// Validation Schema
// =============================================================================

const storeSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  slug: z.string().min(2, 'Slug deve ter pelo menos 2 caracteres').regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hifens'),
  whatsappPrimary: z.string().optional().or(z.literal('')),
});

type StoreFormValues = z.infer<typeof storeSchema>;

// =============================================================================
// Store Details Page
// =============================================================================

export default function StoreDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();

  // Form setup
  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: '',
      slug: '',
      whatsappPrimary: '',
    },
  });

  // Fetch store details
  const { data: store, isLoading, isError } = useQuery({
    queryKey: ['admin-store', id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/stores/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch store');
      }
      const data = await response.json();
      return data.store;
    },
  });

  // Update form when data loads
  React.useEffect(() => {
    if (store) {
      form.reset({
        name: store.name,
        slug: store.slug,
        whatsappPrimary: store.whatsappPrimary || '',
      });
    }
  }, [store, form]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: StoreFormValues) => {
      const response = await fetch(`/api/admin/stores/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update store');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-store', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] });
      toast.success('Loja atualizada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/stores/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete store');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] });
      toast.success('Loja excluída com sucesso');
      router.push('/admin/stores');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-slate-400">Carregando detalhes da loja...</p>
        </div>
      </div>
    );
  }

  if (isError || !store) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <ShieldAlert className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold text-white">Loja não encontrada</h2>
        <Button variant="outline" onClick={() => router.push('/admin/stores')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Lista
        </Button>
      </div>
    );
  }

  const onSubmit = (values: StoreFormValues) => {
    updateMutation.mutate(values);
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/admin/stores')}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
             <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold text-white flex items-center gap-3"
             >
                {store.name}
                <Badge variant="outline" className="border-orange-500/50 text-orange-400 bg-orange-500/10">
                    {store._count?.products || 0} Produtos
                </Badge>
             </motion.h1>
             <p className="text-slate-400 text-sm mt-1">ID: {store.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
             <Button
                variant="outline"
                className="bg-transparent border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition-all"
                onClick={() => window.open(`http://${store.slug}.localhost:3000`, '_blank')}
             >
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver Loja
             </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                    variant="ghost" 
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-transparent hover:border-red-900/50 transition-all"
                >
                   <Trash2 className="mr-2 h-4 w-4" />
                   Excluir Loja
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-950 border-slate-800 text-slate-200 shadow-2xl shadow-black/50">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Excluir esta loja?</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    Esta ação é irreversível. A loja <strong className="text-white">{store.name}</strong> e todos os seus dados serão apagados permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-slate-900 text-white hover:bg-slate-800 border-slate-700">Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700 text-white border border-red-500"
                    onClick={() => deleteMutation.mutate()}
                  >
                    {deleteMutation.isPending ? 'Excluindo...' : 'Sim, excluir'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info Form */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
        >
            <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Store className="h-5 w-5 text-orange-500" />
                        Informações da Loja
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Detalhes principais e identidade da loja
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-300">Nome da Loja</Label>
                                <Input 
                                    id="name" 
                                    {...form.register('name')} 
                                    className="bg-slate-950/50 border-slate-800 text-slate-200 focus:border-orange-500/50" 
                                />
                                {form.formState.errors.name && (
                                    <p className="text-xs text-red-400">{form.formState.errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug" className="text-slate-300">Slug (URL)</Label>
                                <div className="relative">
                                     <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                     <Input 
                                        id="slug" 
                                        {...form.register('slug')} 
                                        className="pl-10 bg-slate-950/50 border-slate-800 text-slate-200 focus:border-orange-500/50" 
                                     />
                                </div>
                                {form.formState.errors.slug && (
                                    <p className="text-xs text-red-400">{form.formState.errors.slug.message}</p>
                                )}
                            </div>

                             <div className="space-y-2">
                                <Label htmlFor="whatsappPrimary" className="text-slate-300">WhatsApp</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <Input 
                                        id="whatsappPrimary" 
                                        {...form.register('whatsappPrimary')} 
                                        className="pl-10 bg-slate-950/50 border-slate-800 text-slate-200 focus:border-orange-500/50" 
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-slate-800" />

                        <div className="flex justify-end">
                            <Button 
                                type="submit" 
                                disabled={updateMutation.isPending}
                                className="bg-orange-500 hover:bg-orange-600 text-white min-w-[140px]"
                            >
                                {updateMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Salvar Alterações
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>

        {/* Sidebar / Stats */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
        >
             <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white text-lg">Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded bg-slate-950/30 border border-slate-800">
                        <span className="text-slate-400 text-sm">Status</span>
                        <div className="flex items-center gap-2">
                             {store.isActive ? (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Ativo</Badge>
                            ) : (
                                <Badge variant="secondary">Inativo</Badge>
                            )}
                            <Switch 
                                checked={store.isActive}
                                onCheckedChange={(checked) => updateMutation.mutate({ isActive: checked } as any)}
                                disabled={updateMutation.isPending}
                            />
                        </div>
                    </div>
                     <div className="flex justify-between items-center p-3 rounded bg-slate-950/30 border border-slate-800">
                        <span className="text-slate-400 text-sm">Criado em</span>
                        <span className="text-slate-200 text-sm">{new Date(store.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                </CardContent>
             </Card>
        </motion.div>
      </div>
    </div>
  );
}
