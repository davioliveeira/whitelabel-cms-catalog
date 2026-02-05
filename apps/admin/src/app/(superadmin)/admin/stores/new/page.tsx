// =============================================================================
// New Store Creation Page (SuperAdmin)
// =============================================================================
// Form for SUPER_ADMIN to create a new store/tenant
// Premium Dark Design Implementation
// =============================================================================

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
    ArrowLeft, 
    Store, 
    Loader2, 
    Shield, 
    Globe, 
    Mail, 
    Lock,
    Phone 
} from 'lucide-react';
import { motion } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// =============================================================================
// Validation Schema
// =============================================================================

const newStoreSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  slug: z
    .string()
    .min(3, 'Slug deve ter no mínimo 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  role: z.enum(['STORE_OWNER', 'SUPER_ADMIN']),
  whatsappPrimary: z.string().optional(),
});

type NewStoreFormData = z.infer<typeof newStoreSchema>;

// =============================================================================
// New Store Page Component
// =============================================================================

export default function NewStorePage() {
  const router = useRouter();

  const form = useForm<NewStoreFormData>({
    resolver: zodResolver(newStoreSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      slug: '',
      role: 'STORE_OWNER',
      whatsappPrimary: '',
    },
  });

  // Auto-generate slug from name
  const watchName = form.watch('name');
  React.useEffect(() => {
    if (watchName && !form.formState.dirtyFields.slug) {
      const slug = watchName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim();
      form.setValue('slug', slug);
    }
  }, [watchName, form]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: NewStoreFormData) => {
      const response = await fetch('/api/admin/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create store');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success('Loja criada com sucesso!');
      router.push(`/admin/stores/${data.id || data.user?.storeId || ''}`);
    },
    onError: (error: Error) => {
      console.error('Store creation error:', error);
      toast.error(error.message || 'Erro ao criar loja');
    },
  });

  const onSubmit = (data: NewStoreFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/stores')}
          className="mb-4 text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Lojas
        </Button>

        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
        >
          <div className="h-12 w-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <Store className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Nova Loja</h1>
            <p className="text-slate-400 mt-1">
              Cadastre uma nova loja e configure o acesso administrativo
            </p>
          </div>
        </motion.div>
      </div>

      {/* Form */}
      <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
      >
          <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-800">
            <CardHeader className="border-b border-slate-800">
              <CardTitle className="text-white">Informações da Loja</CardTitle>
              <CardDescription className="text-slate-400">Preencha os dados da loja e do usuário administrador</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  
                  {/* Store Details Section */}
                  <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Store className="h-4 w-4" /> Detalhes da Loja
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {/* Name */}
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-300">Nome da Loja *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Ex: Perfumaria Elegance"
                                    disabled={createMutation.isPending}
                                    className="bg-slate-950/50 border-slate-800 text-slate-200 focus:border-orange-500/50"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />

                          {/* Slug */}
                          <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-300">Slug (URL) *</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                      <Input
                                        placeholder="perfumaria-elegance"
                                        disabled={createMutation.isPending}
                                        className="pl-10 bg-slate-950/50 border-slate-800 text-slate-200 focus:border-orange-500/50"
                                        {...field}
                                      />
                                  </div>
                                </FormControl>
                                <FormDescription className="text-slate-500">
                                  URL única: seusite.com/<span className="text-orange-400">{field.value || 'slug'}</span>
                                </FormDescription>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                      </div>
                  </div>

                  {/* Account Details Section */}
                  <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-2 flex items-center gap-2">
                          <Shield className="h-4 w-4" /> Conta de Acesso
                      </h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Email */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300">Email de Login *</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <Input
                                            type="email"
                                            placeholder="contato@perfumaria.com"
                                            disabled={createMutation.isPending}
                                            className="pl-10 bg-slate-950/50 border-slate-800 text-slate-200 focus:border-orange-500/50"
                                            {...field}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                                )}
                            />

                            {/* Password */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300">Senha Inicial *</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            disabled={createMutation.isPending}
                                            className="pl-10 bg-slate-950/50 border-slate-800 text-slate-200 focus:border-orange-500/50"
                                            {...field}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormDescription className="text-slate-500">Mínimo de 6 caracteres</FormDescription>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                                )}
                            />
                       </div>
                  </div>

                  {/* Extra Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {/* Role */}
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">Tipo de Conta *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={createMutation.isPending}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-slate-950/50 border-slate-800 text-slate-200 focus:ring-orange-500/20 focus:border-orange-500/50">
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                <SelectItem value="STORE_OWNER" className="focus:bg-slate-800 focus:text-white cursor-pointer">
                                  Loja (Store Owner)
                                </SelectItem>
                                <SelectItem value="SUPER_ADMIN" className="focus:bg-slate-800 focus:text-white cursor-pointer">
                                  Super Admin
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-slate-500">
                              Define o nível de permissão do usuário criado
                            </FormDescription>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />

                      {/* WhatsApp (Optional) */}
                      <FormField
                        control={form.control}
                        name="whatsappPrimary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">WhatsApp (Opcional)</FormLabel>
                            <FormControl>
                               <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <Input
                                        placeholder="+55 11 99999-9999"
                                        disabled={createMutation.isPending}
                                        className="pl-10 bg-slate-950/50 border-slate-800 text-slate-200 focus:border-orange-500/50"
                                        {...field}
                                    />
                               </div>
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => router.push('/admin/stores')}
                      disabled={createMutation.isPending}
                      className="text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="min-w-[140px] bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                    >
                      {createMutation.isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Criando...
                        </> 
                      ) : (
                        'Criar Loja'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
      </motion.div>
    </div>
  );
}
