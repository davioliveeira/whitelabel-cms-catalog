// =============================================================================
// Onboarding Page (Placeholder)
// =============================================================================
// Landing page after successful registration.
// Will be expanded in Story 2.2 for brand configuration.
// =============================================================================

import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Client component for reading search params
function OnboardingContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <svg
              className="h-6 w-6 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl">Conta Criada com Sucesso!</CardTitle>
          <CardDescription>
            Sua loja foi registrada. Agora vamos configurar sua marca.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Steps */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="text-sm line-through text-muted-foreground">
                Criar conta
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="text-sm font-medium">
                Configurar identidade visual
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="text-sm text-muted-foreground">
                Adicionar produtos
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4 space-y-3">
            <Button asChild className="w-full">
              <Link href="/brand-settings">Configurar Minha Marca</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Ir para o Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
