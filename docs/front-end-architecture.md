# Frontend Architecture: SaaS Next.js

## 1. Tech Stack
* **Framework:** Next.js 14 (App Router).
* **Estilização:** Tailwind CSS (pela velocidade e JIT).
* **UI Components:** shadcn/ui (Radix UI).
* **Estado:** Zustand (Global) + TanStack Query (Server State).
* **Backend/DB:** Supabase (PostgreSQL + Auth + Storage).

## 2. Estratégia de Multi-tenancy
* **Identificação:** Via Slug na URL (`/[slug]`).
* **Middleware:** Verifica o slug no banco e retorna os metadados do lojista.
* **Theme Provider:** Componente no `layout.tsx` que aplica as cores do lojista no `:root`.

## 3. Otimização de Imagens
* **Next/Image:** Obrigatório para todas as fotos de perfumes.
* **Transformação:** Imagens redimensionadas e convertidas para WebP via Edge Functions.
* **CDN:** Cache agressivo nas rotas públicas do catálogo.

## 4. Estrutura de Pastas
```text
src/
├── app/
│   ├── (admin)/        # Painel do Lojista (Protegido)
│   ├── (public)/      # Vitrine do Cliente (/[slug])
├── components/
│   ├── ui/             # Shadcn base
│   ├── catalog/        # Smart Grid, Brand Hero
│   └── admin/          # Importador, Dashboard
├── hooks/              # useWhitelabel, useInventory
└── lib/                # Supabase-client, utils