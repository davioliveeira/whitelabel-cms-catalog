// =============================================================================
// New User Creation Page (SuperAdmin)
// =============================================================================
// Form for SUPER_ADMIN to create a new user and associate with a store
// =============================================================================

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Users, Loader2, Store } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const newUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: z.enum(['STORE_OWNER', 'SUPER_ADMIN']),
  storeId: z.string().optional(),
}).refine((data) => {
  if (data.role === 'STORE_OWNER' && !data.storeId) {
    return false;
  }
  return true;
}, {
  message: "Selecione uma loja para o proprietário",
  path: ["storeId"],
});

type NewUserFormData = z.infer<typeof newUserSchema>;

// =============================================================================
// New User Page Component
// =============================================================================

export default function NewUserPage() {
  const router = useRouter();

  // Fetch stores for selection
  const { data: stores, isLoading: isLoadingStores } = useQuery({
    queryKey: ['admin-stores-list'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stores');
      if (!response.ok) throw new Error('Failed to fetch stores');
      const data = await response.json();
      return data.stores || [];
    },
  });

  const form = useForm<NewUserFormData>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'STORE_OWNER',
      storeId: '',
    },
  });

  const selectedRole = form.watch('role');

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: NewUserFormData) => {
      const payload = {
        ...data,
        storeId: data.role === 'SUPER_ADMIN' ? null : data.storeId,
      };
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create user');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success('Usuário criado com sucesso!');
      router.push('/admin/users'); // Go back to list instead of details for now
    },
    onError: (error: Error) => {
      console.error('User creation error:', error);
      toast.error(error.message || 'Erro ao criar usuário');
    },
  });

  const onSubmit = (data: NewUserFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/users')}
          className="mb-4 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Usuários
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <Users className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Novo Usuário</h1>
            <p className="text-slate-400 mt-1">
              Crie um novo usuário para acessar o sistema
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Informações de Acesso</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Nome Completo *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: João Silva"
                        disabled={createMutation.isPending}
                        className="bg-slate-950/50 border-slate-800 text-slate-200 focus:border-orange-500/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="joao@email.com"
                        disabled={createMutation.isPending}
                        className="bg-slate-950/50 border-slate-800 text-slate-200 focus:border-orange-500/50"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-slate-500">
                      Email usado para fazer login
                    </FormDescription>
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
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={createMutation.isPending}
                        className="bg-slate-950/50 border-slate-800 text-slate-200 focus:border-orange-500/50"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-slate-500">
                      Mínimo 6 caracteres
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Role */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Nível de Acesso *</FormLabel>
                      <Select
                        onValueChange={(val) => {
                            field.onChange(val);
                            // Reset store if switching to admin
                            if (val === 'SUPER_ADMIN') {
                                form.setValue('storeId', '');
                            }
                        }}
                        defaultValue={field.value}
                        disabled={createMutation.isPending}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-950/50 border-slate-800 text-slate-200 focus:border-orange-500/50">
                            <SelectValue placeholder="Selecione o nível" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                          <SelectItem value="STORE_OWNER" className="focus:bg-slate-800 focus:text-white">
                            Proprietário de Loja
                          </SelectItem>
                          <SelectItem value="SUPER_ADMIN" className="focus:bg-slate-800 focus:text-white">
                            Super Administrador
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                {/* Store Selection (Conditional) */}
                {selectedRole === 'STORE_OWNER' && (
                  <FormField
                    control={form.control}
                    name="storeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Loja Associada *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={createMutation.isPending || isLoadingStores}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-slate-950/50 border-slate-800 text-slate-200 focus:border-orange-500/50">
                              <SelectValue placeholder={isLoadingStores ? "Carregando lojas..." : "Selecione uma loja"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 max-h-[200px]">
                            {stores?.map((store: any) => (
                                <SelectItem key={store.id} value={store.id} className="focus:bg-slate-800 focus:text-white">
                                    {store.name}
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 justify-end border-t border-slate-800">
                 <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/users')}
                  disabled={createMutation.isPending}
                  className="bg-transparent border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-orange-500 hover:bg-orange-600 text-white min-w-[140px]"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Usuário'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
