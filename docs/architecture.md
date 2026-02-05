# Architecture Specification: Catálogo Whitelabel SaaS (Self-Hosted)

## 1. Visão Geral
Esta arquitetura define um sistema SaaS multi-tenant robusto, gerenciado via monorepo, com infraestrutura totalmente containerizada. O objetivo é oferecer controle total sobre os dados, facilidade de deploy e uma experiência de desenvolvimento (DX) ágil.

## 2. Stack Tecnológica Core
* **Gerenciamento de Monorepo:** [Nx](https://nx.dev/) (Workspaces).
* **Frontend Framework:** Next.js 14+ (App Router).
* **Design System:** Tailwind CSS + shadcn/ui (Radix UI).
* **Linguagem:** TypeScript.
* **Banco de Dados:** PostgreSQL 16 (Relacional).
* **ORM:** Prisma (para gestão de esquema e type-safety).
* **Cache & Queues:** Redis (para performance e rate limiting).
* **Orquestração:** Docker & Docker Compose.
* **Automação:** GNU Make (Makefile).

## 3. Estrutura do Monorepo (Nx)
O projeto é dividido em aplicações e bibliotecas compartilhadas para evitar duplicação de código:

```text
/
├── apps/
│   ├── admin/          # CMS para o Lojista (Gestão, Dashboard, Onboarding)
│   └── catalog/        # Vitrine do Cliente (Catálogo Público dinâmico)
├── libs/
│   ├── ui/             # Design System (Componentes shadcn adaptados)
│   ├── database/       # Schema Prisma, Migrations e Client
│   ├── shared/         # Utilitários, tipos e lógica de WhatsApp
│   └── theme-engine/   # Lógica de injeção de cores Whitelabel
├── docker/             # Dockerfiles específicos por ambiente
├── Makefile            # Comandos de orquestração do projeto
└── docker-compose.yml  # Definição dos serviços (App, DB, Redis)

4. Multi-tenancy & Whitelabel
4.1 Isolamento de Dados
O sistema utiliza Isolamento em Nível de Aplicação. Todas as tabelas sensíveis (products, analytics) possuem uma coluna tenant_id.

O acesso é filtrado por políticas no backend/ORM baseadas no contexto do lojista logado ou no slug da URL.

4.2 Engine de Temas Dinâmicos
A personalização visual não requer novos builds.

O lojista define cores e logos no admin.

A app catalog busca esses dados via slug.

Os valores são aplicados no :root do CSS via variáveis do Tailwind:

CSS
:root {
  --primary: ${tenant.color};
  --brand-logo: url(${tenant.logo});
}
5. Infraestrutura (Docker)
O ambiente é orquestrado via docker-compose.yml com os seguintes serviços:

postgres: Banco de dados principal.

redis: Cache de busca e performance.

admin-app: Container rodando o painel de gestão.

catalog-app: Container otimizado para a vitrine pública.

6. Automação (Makefile)
Padronização do ciclo de vida do projeto:

make setup: Instala dependências, sobe containers e roda migrations.

make dev: Inicia as apps em modo desenvolvimento via Nx.

make db-migrate: Sincroniza o esquema do banco de dados.

make build: Gera os builds de produção de todas as apps.

7. Performance & Assets
Otimização de Imagens: Next.js Image Optimization processando imagens enviadas para o volume Docker.

Smart Grid: Lógica de CSS Grid dinâmica para renderizar 2x2 ou 1x1 conforme a marca.

Database Indexing: Índices no slug do tenant e brand_category para buscas instantâneas.

8. Segurança
Proxy Reverso: Uso sugerido de Nginx ou Traefik para terminação SSL e roteamento de domínios.

Environment Variables: Gestão centralizada de segredos via arquivos .env protegidos.