// =============================================================================
// User Details & Edit Page (SuperAdmin)
// =============================================================================
// Allows Super Admin to view user details and reset password
// =============================================================================

'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Loader2,
  Save,
  Shield,
  Store,
  Key,
  Trash2,
  Mail,
  User,
  Calendar
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
// Schemas
// =============================================================================

const passwordResetSchema = z.object({
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

type PasswordResetValues = z.infer<typeof passwordResetSchema>;

// =============================================================================
// Page Component
// =============================================================================

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();

  // Fetch user details
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['admin-user', id],
    queryFn: async () => {
        // We reuse the list endpoint but filter CLIENT SIDE for now or we should implement a GET /api/admin/users/[id]
        // But to be cleaner, let's assume we need to fetch specific user.
        // If GET /api/admin/users returns list, we can filter it or correct the API.
        // Let's rely on creating a new GET /api/admin/users/[id] route which is better practice.
        const response = await fetch(`/api/admin/users/${id}`);
        if (!response.ok) throw new Error('Failed to fetch user');
        const data = await response.json();
        return data.user;
    },
  });

  const form = useForm<PasswordResetValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Password Reset Mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (values: PasswordResetValues) => {
      const response = await fetch(`/api/admin/users/${id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: values.password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reset password');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('Senha redefinida com sucesso');
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(`Erro ao redefinir senha: ${error.message}`);
    },
  });

  // Delete User Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('Usuário excluído com sucesso');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      router.push('/admin/users');
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
          <p className="text-slate-400">Carregando detalhes do usuário...</p>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <User className="h-12 w-12 text-slate-500" />
        <h2 className="text-xl font-bold text-white">Usuário não encontrado</h2>
        <Button variant="outline" onClick={() => router.push('/admin/users')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/admin/users')}
                className="text-slate-400 hover:text-white"
            >
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    {user.name}
                    {user.role === 'SUPER_ADMIN' ? (
                        <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20">Super Admin</Badge>
                    ) : (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">Lojista</Badge>
                    )}
                </h1>
                <p className="text-slate-400 text-sm mt-1">ID: {user.id}</p>
            </div>
        </div>
        
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-950/30">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir Usuário
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-200">
                <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação excluirá o usuário <strong className="text-white">{user.name}</strong> permanentemente. 
                        Ele perderá acesso ao sistema imediatamente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-slate-800 border-slate-700">Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={() => deleteMutation.mutate()}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {deleteMutation.isPending ? 'Excluindo...' : 'Sim, excluir'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* User Info Card */}
        <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-800">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-orange-500" />
                    Dados do Usuário
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-1">
                    <Label className="text-slate-400 text-xs uppercase tracking-wider">Nome Completo</Label>
                    <p className="text-slate-200 font-medium text-lg">{user.name}</p>
                </div>
                
                <div className="space-y-1">
                    <Label className="text-slate-400 text-xs uppercase tracking-wider">Email</Label>
                    <div className="flex items-center gap-2 text-slate-200">
                        <Mail className="h-4 w-4 text-slate-500" />
                        {user.email}
                    </div>
                </div>

                <div className="space-y-1">
                    <Label className="text-slate-400 text-xs uppercase tracking-wider">Data de Cadastro</Label>
                    <div className="flex items-center gap-2 text-slate-200">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                </div>

                {user.store && (
                    <>
                        <Separator className="bg-slate-800" />
                        <div className="space-y-2">
                            <Label className="text-slate-400 text-xs uppercase tracking-wider">Loja Associada</Label>
                            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 flex items-center justify-between group cursor-pointer hover:border-orange-500/30 transition-colors"
                                 onClick={() => router.push(`/admin/stores/${user.store.id}`)}>
                                <div>
                                    <p className="text-slate-200 font-medium group-hover:text-orange-400 transition-colors">{user.store.name}</p>
                                    <p className="text-slate-500 text-xs">{user.store.slug}</p>
                                </div>
                                <Store className="h-4 w-4 text-slate-500 group-hover:text-orange-400 transition-colors" />
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>

        {/* Password Reset Card */}
        <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-800 h-fit">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Key className="h-5 w-5 text-orange-500" />
                    Redefinir Senha
                </CardTitle>
                <CardDescription className="text-slate-400">
                    Defina uma nova senha para este usuário se ele perdeu o acesso.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit((data) => resetPasswordMutation.mutate(data))} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Nova Senha</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            {...form.register('password')}
                            className="bg-slate-950/50 border-slate-800 text-slate-200"
                        />
                        {form.formState.errors.password && (
                            <p className="text-xs text-red-400">{form.formState.errors.password.message}</p>
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                        <Input 
                            id="confirmPassword" 
                            type="password" 
                            {...form.register('confirmPassword')}
                             className="bg-slate-950/50 border-slate-800 text-slate-200"
                        />
                         {form.formState.errors.confirmPassword && (
                            <p className="text-xs text-red-400">{form.formState.errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <Button 
                        type="submit" 
                        disabled={resetPasswordMutation.isPending}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    >
                        {resetPasswordMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Redefinindo...
                            </>
                        ) : (
                            'Salvar Nova Senha'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
