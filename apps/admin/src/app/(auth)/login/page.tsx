// =============================================================================
// Login Page
// =============================================================================
// User authentication page for CMS Catálogo White Label admin app.
// Uses NextAuth.js credentials provider with server action.
// =============================================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signIn, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

// =============================================================================
// Validation Schema
// =============================================================================
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginForm = z.infer<typeof loginSchema>;

// =============================================================================
// Login Page Component
// =============================================================================
export default function LoginPage() {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: LoginForm) => {
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        // Fetch the session to get the user role
        const sessionResponse = await fetch('/api/auth/session');
        const session = await sessionResponse.json();

        // Redirect based on user role
        if (session?.user?.role === 'SUPER_ADMIN') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/dashboard';
        }
        return;
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Login error:', err);
      setError('Ocorreu um erro ao fazer login. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Acesse sua conta
        </h1>
        <p className="text-sm text-muted-foreground">
          Entre com seu email e senha para continuar
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="nome@exemplo.com"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Entrando...' : 'Entrar com Email'}
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Ou continue com
          </span>
        </div>
      </div>
       <div className="text-center text-sm text-slate-600">
          Não tem uma conta?{' '}
          <Link
            href="/register"
            className="font-medium text-slate-900 hover:underline dark:text-slate-100"
          >
            Cadastre-se
          </Link>
        </div>
    </>
  );
}
