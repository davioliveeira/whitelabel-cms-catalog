'use client';

// =============================================================================
// Registration Page
// =============================================================================
// Allows new store owners to create an account.
// =============================================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// =============================================================================
// Form Schema
// =============================================================================

const registerSchema = z
  .object({
    storeName: z
      .string()
      .min(3, 'Nome da loja deve ter pelo menos 3 caracteres')
      .max(100, 'Nome da loja deve ter no máximo 100 caracteres'),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Senha deve conter maiúscula, minúscula e número'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// =============================================================================
// Component
// =============================================================================

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setServerError(result.error?.message || 'Erro ao criar conta');
        return;
      }

      // Success - automatically log in the user
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Registration succeeded but auto-login failed
        // Redirect to login page instead
        router.push('/login?registered=true');
        return;
      }

      // Successfully logged in - redirect to onboarding
      router.push('/onboarding?success=true');
    } catch {
      setServerError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Crie sua conta
        </h1>
        <p className="text-sm text-muted-foreground">
          Preencha os dados abaixo para criar sua loja
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Server Error Alert */}
          {serverError && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {serverError}
            </div>
          )}

          {/* Store Name */}
          <div className="space-y-2">
            <Label htmlFor="storeName">Nome da Loja</Label>
            <Input
              id="storeName"
              placeholder="Ex: Perfumaria Elegance"
              {...register('storeName')}
              aria-invalid={!!errors.storeName}
            />
            {errors.storeName && (
              <p className="text-sm text-destructive">
                {errors.storeName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              {...register('password')}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Digite a senha novamente"
              {...register('confirmPassword')}
              aria-invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Criando conta...' : 'Criar Conta'}
          </Button>
      </form>
      
       <div className="text-center text-sm text-slate-600">
          Já tem uma conta?{' '}
          <Link
            href="/login"
            className="font-medium text-slate-900 hover:underline dark:text-slate-100"
          >
            Fazer login
          </Link>
        </div>
    </>
  );
}
