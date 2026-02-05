# Documentação de Endpoints - Frontend

**Projeto:** CMS Catálogo White Label
**Data:** 02/02/2026
**Versão:** 1.0

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Painel Administrativo (Admin)](#painel-administrativo-admin)
   - [Rotas Públicas](#rotas-públicas-admin)
   - [Rotas Protegidas](#rotas-protegidas-admin)
   - [API Endpoints](#api-endpoints-admin)
3. [Catálogo Público (Catalog)](#catálogo-público-catalog)
   - [Rotas Públicas](#rotas-públicas-catalog)
   - [API Endpoints](#api-endpoints-catalog)
4. [Fluxos de Usuário](#fluxos-de-usuário)
5. [Autenticação e Autorização](#autenticação-e-autorização)

---

## Visão Geral

O sistema é composto por **dois frontends independentes**:

### 1. **Admin** (Porta 3000)
- **URL Base:** `http://localhost:3000`
- **Propósito:** Painel administrativo para gerenciamento de produtos, marcas e usuários
- **Tecnologia:** Next.js 15 + NextAuth.js v5
- **Acesso:** Autenticação obrigatória (exceto login/registro)

### 2. **Catalog** (Porta 3001)
- **URL Base:** `http://localhost:3001`
- **Propósito:** Catálogo público de produtos para clientes finais
- **Tecnologia:** Next.js 15
- **Acesso:** Público (sem autenticação)

---

## Painel Administrativo (Admin)

### Estrutura de Diretórios

```
apps/admin/src/app/
├── (auth)/              # Grupo de rotas de autenticação (públicas)
├── (authenticated)/     # Grupo de rotas autenticadas
├── products/           # Gerenciamento de produtos
├── brand-settings/     # Configurações da marca
├── onboarding/         # Fluxo de onboarding
└── api/                # API Routes do Next.js
```

---

### Rotas Públicas (Admin)

#### 1. Login
- **Rota:** `/login`
- **Arquivo:** `apps/admin/src/app/(auth)/login/page.tsx`
- **Método:** GET
- **Autenticação:** ❌ Não requerida
- **Descrição:** Página de login do sistema
- **Funcionalidades:**
  - Formulário de login com email e senha
  - Validação com Zod schema
  - Integração com NextAuth.js
  - Redirecionamento para `/dashboard` após sucesso
- **Redirecionamentos:**
  - Se já autenticado → `/dashboard`
  - Após login bem-sucedido → `/dashboard`

---

#### 2. Registro
- **Rota:** `/register`
- **Arquivo:** `apps/admin/src/app/(auth)/register/page.tsx`
- **Método:** GET
- **Autenticação:** ❌ Não requerida
- **Descrição:** Página de criação de nova conta
- **Funcionalidades:**
  - Formulário de registro (email, senha, nome, slug da loja)
  - Validação de dados
  - Auto-login após registro bem-sucedido
  - Redirecionamento para `/onboarding`
- **Validações:**
  - Email único no sistema
  - Slug único para a loja
  - Senha mínima de 8 caracteres
  - Nome mínimo de 2 caracteres

---

### Rotas Protegidas (Admin)

> ⚠️ **Todas as rotas abaixo requerem autenticação**

#### 3. Página Inicial
- **Rota:** `/`
- **Arquivo:** `apps/admin/src/app/page.tsx`
- **Método:** GET
- **Autenticação:** ✅ Requerida
- **Descrição:** Página inicial do painel administrativo
- **Funcionalidades:**
  - Visão geral do sistema
  - Links rápidos para funcionalidades principais

---

#### 4. Dashboard Analytics
- **Rota:** `/dashboard`
- **Arquivo:** `apps/admin/src/app/(authenticated)/dashboard/page.tsx`
- **Método:** GET
- **Autenticação:** ✅ Requerida
- **Descrição:** Dashboard com métricas e analytics do catálogo
- **Funcionalidades:**
  - **Cards de Métricas:**
    - Total de visualizações
    - Cliques em WhatsApp
    - Produtos ativos
    - Taxa de conversão
  - **Gráfico de Tendências:** Visualizações e cliques ao longo do tempo
  - **Top 5 Produtos:** Produtos mais visualizados
  - **Feed de Atividades:** Eventos em tempo real
- **Filtros:**
  - Período: Últimos 7 dias, 30 dias, 90 dias
- **Tecnologia:** React Query para cache e atualização de dados

---

#### 5. Gerenciamento de Usuários
- **Rota:** `/users`
- **Arquivo:** `apps/admin/src/app/(authenticated)/users/page.tsx`
- **Método:** GET
- **Autenticação:** ✅ Requerida
- **Autorização:** 🔒 **Apenas SUPER_ADMIN**
- **Descrição:** Gerenciamento de lojistas (CRUD completo)
- **Funcionalidades:**
  - **Listar Usuários:**
    - Nome e email
    - Role (SUPER_ADMIN ou STORE_OWNER)
    - Status (ativo/inativo)
    - Quantidade de produtos
  - **Criar Usuário:**
    - Formulário modal com validação
    - Campos: email, senha, nome, slug, role
  - **Deletar Usuário:**
    - Dialog de confirmação
    - Prevenção de auto-exclusão
- **Regras de Negócio:**
  - Usuário não pode deletar a própria conta
  - Apenas SUPER_ADMIN pode acessar esta página

---

#### 6. Lista de Produtos
- **Rota:** `/products`
- **Arquivo:** `apps/admin/src/app/products/page.tsx`
- **Método:** GET
- **Autenticação:** ✅ Requerida
- **Descrição:** Listagem completa de produtos com filtros e ações
- **Funcionalidades:**
  - **Listagem:**
    - Tabela responsiva com todos os produtos
    - Imagem, nome, SKU, preço, estoque, status
  - **Filtros:**
    - Busca por nome/SKU
    - Filtro por marca
    - Filtro por categoria
    - Filtro por status (ativo/inativo)
  - **Paginação:**
    - 20 produtos por página
    - Navegação entre páginas
  - **Ações:**
    - Editar produto → `/products/[id]/edit`
    - Deletar produto (com confirmação)
    - Importar produtos em massa → `/products/import`
- **Tecnologia:** React Query + Server Components

---

#### 7. Novo Produto
- **Rota:** `/products/new`
- **Arquivo:** `apps/admin/src/app/products/new/page.tsx`
- **Método:** GET
- **Autenticação:** ✅ Requerida
- **Descrição:** Formulário de criação de novo produto
- **Funcionalidades:**
  - **Formulário Completo:**
    - Informações básicas: nome, SKU, descrição
    - Precificação: preço
    - Estoque: quantidade
    - Categorização: marca, categoria
    - Mídia: upload de imagem
    - Status: ativo/inativo
  - **Validações:**
    - Nome obrigatório
    - SKU único
    - Preço ≥ 0
    - Estoque ≥ 0
  - **Upload de Imagem:**
    - Preview da imagem
    - Validação de tipo (JPEG, PNG, WebP)
    - Otimização automática
- **Redirecionamento:** `/products` após criação bem-sucedida

---

#### 8. Editar Produto
- **Rota:** `/products/[id]/edit`
- **Arquivo:** `apps/admin/src/app/products/[id]/edit/page.tsx`
- **Método:** GET
- **Autenticação:** ✅ Requerida
- **Parâmetros:** `id` (UUID do produto)
- **Descrição:** Formulário de edição de produto existente
- **Funcionalidades:**
  - Formulário pré-preenchido com dados atuais
  - Mesmos campos do formulário de criação
  - Preview da imagem atual
  - Upload de nova imagem (opcional)
- **Validações:** Mesmas da criação
- **Redirecionamento:** `/products` após atualização

---

#### 9. Importar Produtos
- **Rota:** `/products/import`
- **Arquivo:** `apps/admin/src/app/products/import/page.tsx`
- **Método:** GET
- **Autenticação:** ✅ Requerida
- **Descrição:** Importação em massa de produtos via CSV/Excel
- **Funcionalidades:**
  - **Upload de Arquivo:**
    - Suporte a CSV e Excel (.xlsx)
    - Validação de formato
    - Preview dos dados antes da importação
  - **Download Template:**
    - Botão para baixar template CSV
    - Colunas: nome, sku, preço, estoque, marca, categoria, etc.
  - **Processamento:**
    - Validação linha por linha
    - Relatório de erros (se houver)
    - Confirmação antes de importar
  - **Feedback:**
    - Barra de progresso
    - Resumo: X produtos importados, Y erros
- **Formatos Aceitos:** CSV, XLSX

---

#### 10. Onboarding
- **Rota:** `/onboarding`
- **Arquivo:** `apps/admin/src/app/onboarding/page.tsx`
- **Método:** GET
- **Autenticação:** ✅ Requerida
- **Descrição:** Fluxo de configuração inicial após registro
- **Funcionalidades:**
  - Wizard multi-step
  - Configurações básicas da loja
  - Upload de logo (opcional)
  - Redirecionamento para `/brand-settings` ou `/products`
- **Quando aparece:** Primeira vez que o usuário loga após registro

---

#### 11. Configurações da Marca
- **Rota:** `/brand-settings`
- **Arquivo:** `apps/admin/src/app/brand-settings/page.tsx`
- **Método:** GET
- **Autenticação:** ✅ Requerida
- **Descrição:** Personalização da identidade visual do catálogo
- **Funcionalidades:**
  - **Logo:**
    - Upload de logo da marca
    - Preview em tempo real
    - Remoção de logo
  - **Cores:**
    - Cor primária (color picker)
    - Cor secundária
    - Preview da paleta
  - **Border Radius:**
    - Slider para ajustar arredondamento (0-20px)
    - Aplicado em botões e cards
  - **WhatsApp:**
    - Número de WhatsApp para contato
    - Mensagem padrão customizável
    - Preview do link
  - **Botão de Salvar:**
    - Salva todas as configurações
    - Toast de confirmação
- **Tecnologia:** React Hook Form + Zod

---

### API Endpoints (Admin)

> 📝 **Nota:** Todos os endpoints de API (exceto autenticação) requerem header `x-tenant-id` injetado pelo middleware

---

#### Autenticação

##### POST `/api/auth/register`
**Arquivo:** `apps/admin/src/app/api/auth/register/route.ts`
**Autenticação:** ❌ Não requerida
**Descrição:** Registro de novo usuário no sistema

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "João Silva",
  "slug": "loja-joao"
}
```

**Validações:**
- Email: formato válido, único no sistema
- Senha: mínimo 8 caracteres
- Nome: mínimo 2 caracteres
- Slug: mínimo 3 caracteres, único, formato kebab-case

**Response (201 - Created):**
```json
{
  "user": {
    "id": "uuid-123",
    "email": "user@example.com",
    "name": "João Silva",
    "slug": "loja-joao",
    "role": "STORE_OWNER"
  }
}
```

**Erros:**
- `400` - Dados inválidos
- `409` - Email ou slug já existe
- `500` - Erro interno

---

##### GET/POST `/api/auth/[...nextauth]`
**Arquivo:** `apps/admin/src/app/api/auth/[...nextauth]/route.ts`
**Autenticação:** Varia conforme endpoint
**Descrição:** Endpoints do NextAuth.js

**Endpoints disponíveis:**
- `GET /api/auth/providers` - Lista providers disponíveis
- `GET /api/auth/session` - Retorna sessão atual
- `GET /api/auth/csrf` - Token CSRF
- `POST /api/auth/signin` - Login (credentials)
- `POST /api/auth/signout` - Logout
- `GET /api/auth/callback/*` - Callbacks OAuth

---

#### Produtos

##### GET `/api/products`
**Arquivo:** `apps/admin/src/app/api/products/route.ts`
**Autenticação:** ✅ Requerida
**Descrição:** Lista produtos do tenant autenticado com filtros e paginação

**Query Parameters:**
- `search` (string) - Busca por nome ou SKU
- `brand` (string) - Filtro por marca
- `category` (string) - Filtro por categoria
- `isActive` (boolean) - Filtro por status
- `page` (number) - Página atual (padrão: 1)
- `limit` (number) - Itens por página (padrão: 20)

**Exemplo:**
```
GET /api/products?search=perfume&brand=Natura&page=1&limit=20
```

**Response (200):**
```json
{
  "products": [
    {
      "id": "uuid-1",
      "name": "Perfume Kaiak",
      "sku": "NAT-KAIAK-001",
      "description": "Fragrância masculina",
      "price": 149.90,
      "stock": 50,
      "imageUrl": "https://...",
      "brand": "Natura",
      "category": "Perfumaria",
      "isActive": true,
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-15T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Erros:**
- `401` - Não autenticado
- `500` - Erro interno

---

##### POST `/api/products`
**Arquivo:** `apps/admin/src/app/api/products/route.ts`
**Autenticação:** ✅ Requerida
**Descrição:** Cria novo produto

**Request Body:**
```json
{
  "name": "Perfume Kaiak",
  "sku": "NAT-KAIAK-001",
  "description": "Fragrância masculina inspirada no mar",
  "price": 149.90,
  "stock": 50,
  "imageUrl": "https://cdn.example.com/kaiak.jpg",
  "brand": "Natura",
  "category": "Perfumaria",
  "isActive": true
}
```

**Validações:**
- Nome: obrigatório, min 1 caractere
- SKU: obrigatório, único por tenant
- Preço: ≥ 0
- Estoque: ≥ 0 (inteiro)
- ImageUrl: URL válida (opcional)

**Response (201):**
```json
{
  "product": {
    "id": "uuid-novo",
    "name": "Perfume Kaiak",
    "sku": "NAT-KAIAK-001",
    ...
  }
}
```

**Erros:**
- `400` - Validação falhou
- `401` - Não autenticado
- `409` - SKU duplicado
- `500` - Erro interno

---

##### GET `/api/products/[id]`
**Arquivo:** `apps/admin/src/app/api/products/[id]/route.ts`
**Autenticação:** ✅ Requerida
**Descrição:** Busca produto específico por ID

**Parâmetros:**
- `id` (UUID) - ID do produto

**Response (200):**
```json
{
  "product": {
    "id": "uuid-123",
    "name": "Perfume Kaiak",
    ...
  }
}
```

**Erros:**
- `401` - Não autenticado
- `404` - Produto não encontrado
- `500` - Erro interno

---

##### PATCH `/api/products/[id]`
**Arquivo:** `apps/admin/src/app/api/products/[id]/route.ts`
**Autenticação:** ✅ Requerida
**Descrição:** Atualiza produto existente

**Request Body:** (todos os campos são opcionais)
```json
{
  "name": "Perfume Kaiak Oceano",
  "price": 159.90,
  "stock": 75,
  "isActive": true
}
```

**Response (200):**
```json
{
  "product": {
    "id": "uuid-123",
    "name": "Perfume Kaiak Oceano",
    "price": 159.90,
    ...
  }
}
```

**Erros:**
- `400` - Validação falhou
- `401` - Não autenticado
- `404` - Produto não encontrado
- `409` - SKU duplicado (se alterar SKU)
- `500` - Erro interno

---

##### DELETE `/api/products/[id]`
**Arquivo:** `apps/admin/src/app/api/products/[id]/route.ts`
**Autenticação:** ✅ Requerida
**Descrição:** Remove produto (soft delete)

**Response (200):**
```json
{
  "message": "Product deleted successfully"
}
```

**Erros:**
- `401` - Não autenticado
- `404` - Produto não encontrado
- `500` - Erro interno

---

##### GET `/api/products/brands-categories`
**Arquivo:** `apps/admin/src/app/api/products/brands-categories/route.ts`
**Autenticação:** ✅ Requerida
**Descrição:** Lista marcas e categorias disponíveis do tenant

**Response (200):**
```json
{
  "brands": ["Natura", "O Boticário", "Avon"],
  "categories": ["Perfumaria", "Cosméticos", "Maquiagem"]
}
```

---

##### POST `/api/products/import`
**Arquivo:** `apps/admin/src/app/api/products/import/route.ts`
**Autenticação:** ✅ Requerida
**Content-Type:** `multipart/form-data`
**Descrição:** Importa produtos em massa via CSV/Excel

**Request (FormData):**
```
file: [arquivo.csv ou arquivo.xlsx]
```

**Formato CSV esperado:**
```csv
name,sku,description,price,stock,brand,category,imageUrl,isActive
Perfume Kaiak,NAT-001,Fragrância masculina,149.90,50,Natura,Perfumaria,https://...,true
```

**Response (200):**
```json
{
  "success": true,
  "imported": 45,
  "errors": [
    {
      "row": 12,
      "sku": "NAT-999",
      "error": "SKU duplicado"
    }
  ],
  "summary": {
    "total": 47,
    "imported": 45,
    "failed": 2
  }
}
```

**Erros:**
- `400` - Arquivo inválido ou formato incorreto
- `401` - Não autenticado
- `413` - Arquivo muito grande (limite: 5MB)
- `500` - Erro interno

---

##### GET `/api/products/import/template`
**Arquivo:** `apps/admin/src/app/api/products/import/template/route.ts`
**Autenticação:** ✅ Requerida
**Descrição:** Download do template CSV para importação

**Response (200):**
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="template-produtos.csv"`

**Conteúdo do arquivo:**
```csv
name,sku,description,price,stock,brand,category,imageUrl,isActive
Exemplo Produto,EX-001,Descrição exemplo,99.90,10,Marca Exemplo,Categoria,https://exemplo.com/img.jpg,true
```

---

##### POST `/api/products/bulk`
**Arquivo:** `apps/admin/src/app/api/products/bulk/route.ts`
**Autenticação:** ✅ Requerida
**Descrição:** Operações em massa (ativar/desativar/deletar múltiplos produtos)

**Request Body:**
```json
{
  "action": "activate",  // activate | deactivate | delete
  "productIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Response (200):**
```json
{
  "success": true,
  "affected": 3,
  "action": "activate"
}
```

**Erros:**
- `400` - Ação inválida ou IDs vazios
- `401` - Não autenticado
- `500` - Erro interno

---

#### Tenant / Configurações da Marca

##### GET `/api/tenant/brand`
**Arquivo:** `apps/admin/src/app/api/tenant/brand/route.ts`
**Autenticação:** ✅ Requerida
**Descrição:** Busca configurações de marca do tenant

**Response (200):**
```json
{
  "brand": {
    "logoUrl": "https://cdn.example.com/logo.png",
    "primaryColor": "#FF6B35",
    "secondaryColor": "#004E89",
    "borderRadius": 8
  }
}
```

---

##### PATCH `/api/tenant/brand`
**Arquivo:** `apps/admin/src/app/api/tenant/brand/route.ts`
**Autenticação:** ✅ Requerida
**Descrição:** Atualiza configurações de marca

**Request Body:** (campos opcionais)
```json
{
  "primaryColor": "#FF6B35",
  "secondaryColor": "#004E89",
  "borderRadius": 12
}
```

**Validações:**
- primaryColor: formato hexadecimal (#RRGGBB)
- secondaryColor: formato hexadecimal
- borderRadius: 0-20 (pixels)

**Response (200):**
```json
{
  "brand": {
    "primaryColor": "#FF6B35",
    "secondaryColor": "#004E89",
    "borderRadius": 12,
    "updatedAt": "2024-01-20T10:30:00Z"
  }
}
```

---

##### POST `/api/tenant/logo`
**Arquivo:** `apps/admin/src/app/api/tenant/logo/route.ts`
**Autenticação:** ✅ Requerida
**Content-Type:** `multipart/form-data`
**Descrição:** Upload de logo da marca

**Request (FormData):**
```
logo: [arquivo de imagem]
```

**Validações:**
- Formatos aceitos: JPEG, PNG, WebP, SVG
- Tamanho máximo: 2MB
- Dimensões recomendadas: 200x200px

**Response (200):**
```json
{
  "logoUrl": "https://cdn.example.com/logos/tenant-123.png",
  "uploadedAt": "2024-01-20T10:30:00Z"
}
```

**Erros:**
- `400` - Formato inválido ou arquivo muito grande
- `401` - Não autenticado
- `500` - Erro no upload

---

##### GET `/api/tenant/whatsapp`
**Arquivo:** `apps/admin/src/app/api/tenant/whatsapp/route.ts`
**Autenticação:** ✅ Requerida
**Descrição:** Busca configurações de WhatsApp

**Response (200):**
```json
{
  "whatsapp": {
    "phoneNumber": "+5511999999999",
    "defaultMessage": "Olá! Vi este produto no catálogo e gostaria de mais informações."
  }
}
```

---

##### PATCH `/api/tenant/whatsapp`
**Arquivo:** `apps/admin/src/app/api/tenant/whatsapp/route.ts`
**Autenticação:** ✅ Requerida
**Descrição:** Atualiza configurações de WhatsApp

**Request Body:**
```json
{
  "phoneNumber": "+5511999999999",
  "defaultMessage": "Olá! Tenho interesse neste produto."
}
```

**Validações:**
- phoneNumber: formato internacional (+DDI DDD NUMBER)
- defaultMessage: máximo 500 caracteres

**Response (200):**
```json
{
  "whatsapp": {
    "phoneNumber": "+5511999999999",
    "defaultMessage": "Olá! Tenho interesse neste produto.",
    "updatedAt": "2024-01-20T10:30:00Z"
  }
}
```

---

#### Usuários (Super Admin)

##### GET `/api/users`
**Arquivo:** `apps/admin/src/app/api/users/route.ts`
**Autenticação:** ✅ Requerida
**Autorização:** 🔒 **SUPER_ADMIN apenas**
**Descrição:** Lista todos os usuários do sistema

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid-1",
      "email": "lojista@example.com",
      "name": "João Silva",
      "slug": "loja-joao",
      "role": "STORE_OWNER",
      "isActive": true,
      "createdAt": "2024-01-01T10:00:00Z",
      "_count": {
        "products": 45
      }
    },
    {
      "id": "uuid-2",
      "email": "admin@cms.com",
      "name": "Super Admin",
      "slug": "super-admin",
      "role": "SUPER_ADMIN",
      "isActive": true,
      "createdAt": "2024-01-01T09:00:00Z",
      "_count": {
        "products": 0
      }
    }
  ]
}
```

**Erros:**
- `401` - Não autenticado
- `403` - Não é SUPER_ADMIN
- `500` - Erro interno

---

##### POST `/api/users`
**Arquivo:** `apps/admin/src/app/api/users/route.ts`
**Autenticação:** ✅ Requerida
**Autorização:** 🔒 **SUPER_ADMIN apenas**
**Descrição:** Cria novo usuário (STORE_OWNER ou SUPER_ADMIN)

**Request Body:**
```json
{
  "email": "novousuario@example.com",
  "password": "SecurePassword123!",
  "name": "Maria Santos",
  "slug": "loja-maria",
  "role": "STORE_OWNER"
}
```

**Validações:**
- Email: formato válido, único
- Senha: mínimo 8 caracteres
- Nome: mínimo 2 caracteres
- Slug: mínimo 3 caracteres, único
- Role: SUPER_ADMIN ou STORE_OWNER

**Response (201):**
```json
{
  "user": {
    "id": "uuid-novo",
    "email": "novousuario@example.com",
    "name": "Maria Santos",
    "slug": "loja-maria",
    "role": "STORE_OWNER"
  }
}
```

**Erros:**
- `400` - Validação falhou
- `401` - Não autenticado
- `403` - Não é SUPER_ADMIN
- `409` - Email ou slug já existe
- `500` - Erro interno

---

##### DELETE `/api/users/[id]`
**Arquivo:** `apps/admin/src/app/api/users/[id]/route.ts`
**Autenticação:** ✅ Requerida
**Autorização:** 🔒 **SUPER_ADMIN apenas**
**Descrição:** Remove usuário do sistema

**Parâmetros:**
- `id` (UUID) - ID do usuário a ser removido

**Regras de Negócio:**
- ❌ Não pode deletar a própria conta
- ✅ Deleta em cascata todos os produtos do usuário

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

**Erros:**
- `400` - Tentativa de auto-exclusão
- `401` - Não autenticado
- `403` - Não é SUPER_ADMIN
- `404` - Usuário não encontrado
- `500` - Erro interno

---

#### Utilitários

##### POST `/api/upload/image`
**Arquivo:** `apps/admin/src/app/api/upload/image/route.ts`
**Autenticação:** ✅ Requerida
**Content-Type:** `multipart/form-data`
**Descrição:** Upload genérico de imagens (produtos, logos, etc.)

**Request (FormData):**
```
image: [arquivo de imagem]
```

**Validações:**
- Formatos: JPEG, PNG, WebP
- Tamanho máximo: 5MB
- Otimização automática (compressão, redimensionamento)

**Response (200):**
```json
{
  "url": "https://cdn.example.com/uploads/image-123.jpg",
  "size": 245678,
  "dimensions": {
    "width": 800,
    "height": 600
  }
}
```

---

##### GET `/api/hello`
**Arquivo:** `apps/admin/src/app/api/hello/route.ts`
**Autenticação:** ❌ Não requerida
**Descrição:** Health check endpoint

**Response (200):**
```json
{
  "message": "Hello from Admin API!",
  "timestamp": "2024-01-20T10:30:00Z"
}
```

---

## Catálogo Público (Catalog)

### Estrutura de Diretórios

```
apps/catalog/src/app/
├── [slug]/            # Rota dinâmica por tenant
│   ├── layout.tsx     # Layout com tema
│   ├── page.tsx       # Catálogo de produtos
│   ├── loading.tsx    # Skeleton loading
│   └── not-found.tsx  # 404 tenant
├── api/               # API routes
└── page.tsx           # Landing page
```

---

### Rotas Públicas (Catalog)

> ✅ **Todas as rotas do catálogo são públicas (sem autenticação)**

#### 1. Landing Page
- **Rota:** `/`
- **Arquivo:** `apps/catalog/src/app/page.tsx`
- **Método:** GET
- **Autenticação:** ❌ Não requerida
- **Descrição:** Página de entrada/marketing do catálogo
- **Funcionalidades:**
  - Informações sobre o sistema
  - Link para catálogo de demonstração
  - CTA para criar conta no admin

---

#### 2. Catálogo do Tenant
- **Rota:** `/[slug]`
- **Arquivo:** `apps/catalog/src/app/[slug]/page.tsx`
- **Método:** GET
- **Autenticação:** ❌ Não requerida
- **Parâmetros:** `slug` (identificador único da loja)
- **Descrição:** Catálogo público de produtos de um tenant específico
- **Funcionalidades:**
  - **Cabeçalho com Branding:**
    - Logo da marca
    - Nome da loja
    - Cores personalizadas
  - **Grade de Produtos:**
    - Cards responsivos (1-4 colunas)
    - Imagem do produto
    - Nome e descrição
    - Preço formatado
    - Botão WhatsApp por produto
  - **Filtragem:** (futuro)
    - Por marca
    - Por categoria
    - Por faixa de preço
  - **Estado Vazio:**
    - Mensagem quando não há produtos
    - Sugestão para admin adicionar produtos
  - **Loading State:**
    - Skeleton com 8 cards enquanto carrega
- **Tematização:**
  - CSS Variables injetadas dinamicamente
  - `--primary-color`
  - `--secondary-color`
  - `--border-radius`
- **Analytics:**
  - Rastreamento de visualizações de produtos
  - Rastreamento de cliques em WhatsApp
- **Exemplos:**
  - `http://localhost:3001/perfumaria-elegance`
  - `http://localhost:3001/loja-joao`

---

#### 3. 404 - Loja Não Encontrada
- **Rota:** `/[slug]` (quando slug inválido)
- **Arquivo:** `apps/catalog/src/app/[slug]/not-found.tsx`
- **Método:** GET
- **Descrição:** Página exibida quando o slug não corresponde a nenhum tenant
- **Conteúdo:**
  - Mensagem "Loja não encontrada"
  - Link para voltar à homepage
  - Design neutro (sem tema aplicado)

---

### API Endpoints (Catalog)

#### GET `/api/theme/[slug]`
**Arquivo:** `apps/catalog/src/app/api/theme/[slug]/route.ts`
**Autenticação:** ❌ Não requerida
**Descrição:** Retorna configurações de tema do tenant

**Parâmetros:**
- `slug` (string) - Identificador do tenant

**Response (200):**
```json
{
  "theme": {
    "primaryColor": "#FF6B35",
    "secondaryColor": "#004E89",
    "borderRadius": 8,
    "logoUrl": "https://cdn.example.com/logo.png",
    "tenant": {
      "name": "Perfumaria Elegance",
      "slug": "perfumaria-elegance"
    }
  }
}
```

**Cache:**
- `max-age=60` (60 segundos)
- `stale-while-revalidate=300` (5 minutos)

**Erros:**
- `404` - Tenant não encontrado
- `500` - Erro interno

---

#### POST `/api/analytics`
**Arquivo:** `apps/catalog/src/app/api/analytics/route.ts`
**Autenticação:** ❌ Não requerida
**CORS:** ✅ Habilitado (para tracking externo)
**Descrição:** Registra eventos de analytics do catálogo

**Request Body:**
```json
{
  "tenantId": "uuid-tenant",
  "eventType": "product_view",  // product_view | whatsapp_click
  "productId": "uuid-product",   // opcional
  "metadata": {                  // opcional
    "referrer": "https://instagram.com",
    "userAgent": "Mozilla/5.0..."
  }
}
```

**Tipos de Eventos:**
- `product_view` - Visualização de produto
- `whatsapp_click` - Clique no botão WhatsApp

**Response (200):**
```json
{
  "eventId": "uuid-event",
  "type": "product_view",
  "timestamp": "2024-01-20T10:30:00Z"
}
```

**Erros:**
- `400` - Dados inválidos
- `500` - Erro ao salvar evento

---

#### OPTIONS `/api/analytics`
**Arquivo:** `apps/catalog/src/app/api/analytics/route.ts`
**Descrição:** Preflight CORS para requisições cross-origin

**Response (200):**
- Headers CORS configurados
- Allow: POST, OPTIONS

---

#### GET `/api/hello`
**Arquivo:** `apps/catalog/src/app/api/hello/route.ts`
**Autenticação:** ❌ Não requerida
**Descrição:** Health check endpoint

**Response (200):**
```json
{
  "message": "Hello, from Catalog API!",
  "timestamp": "2024-01-20T10:30:00Z"
}
```

---

## Fluxos de Usuário

### 1. Fluxo: Novo Lojista

```
1. Acessa /register
2. Preenche formulário
   - Email
   - Senha
   - Nome
   - Slug da loja
3. Submit → POST /api/auth/register
4. Auto-login (NextAuth)
5. Redirecionamento → /onboarding
6. Wizard de configuração inicial
7. Redirecionamento → /brand-settings
8. Personaliza marca (logo, cores)
9. Redirecionamento → /products/new
10. Adiciona primeiro produto
11. Acessa catálogo público: /{slug}
```

---

### 2. Fluxo: Login Existente

```
1. Acessa /login
2. Preenche email e senha
3. Submit → POST /api/auth/signin
4. NextAuth valida credenciais
5. Redirecionamento → /dashboard
6. Visualiza métricas do catálogo
```

---

### 3. Fluxo: Adicionar Produto

```
1. Dashboard → Menu "Produtos"
2. Clica "Novo Produto"
3. Preenche formulário:
   - Nome, SKU, descrição
   - Preço, estoque
   - Marca, categoria
   - Upload de imagem
4. Submit → POST /api/products
5. Validação backend
6. Produto criado
7. Redirecionamento → /products
8. Produto aparece na listagem
9. Produto visível no catálogo público
```

---

### 4. Fluxo: Importar Produtos em Massa

```
1. Acessa /products/import
2. Opção 1: Download template
   - Clica "Baixar Template"
   - GET /api/products/import/template
   - Recebe arquivo CSV
3. Preenche arquivo CSV
4. Upload do arquivo
5. Sistema processa linha por linha
6. Preview de dados importados
7. Confirmação
8. POST /api/products/import
9. Feedback: X produtos importados, Y erros
10. Produtos aparecem em /products
```

---

### 5. Fluxo: Cliente Visualizando Catálogo

```
1. Cliente recebe link: /{slug}
2. Acessa catálogo público
3. GET /api/theme/{slug} (carrega tema)
4. Tema aplicado (cores, logo, border-radius)
5. Produtos carregados (Server Component)
6. Cliente vê grade de produtos
7. Cliente clica em "WhatsApp" de um produto
8. POST /api/analytics (registra evento)
9. Redirecionamento para WhatsApp:
   https://wa.me/5511999999999?text=Olá...
```

---

### 6. Fluxo: Super Admin Criando Lojista

```
1. Login como SUPER_ADMIN
2. Acessa /users
3. Middleware valida role
4. Clica "Criar Usuário"
5. Modal de formulário abre
6. Preenche:
   - Email
   - Senha
   - Nome
   - Slug
   - Role (STORE_OWNER)
7. Submit → POST /api/users
8. Validação (SUPER_ADMIN only)
9. Usuário criado
10. Aparece na listagem
11. Lojista pode fazer login
```

---

## Autenticação e Autorização

### NextAuth.js v5 (Beta)

**Configuração:** `apps/admin/src/auth.ts`

**Provider:** Credentials (email + senha)

**Estratégia de Sessão:** JWT
- Duração: 30 dias
- Token assinado com `NEXTAUTH_SECRET`

**JWT Payload:**
```json
{
  "id": "uuid-user",
  "email": "user@example.com",
  "name": "João Silva",
  "role": "STORE_OWNER",
  "tenantId": "uuid-tenant",
  "iat": 1705750800,
  "exp": 1708342800
}
```

---

### Middleware de Autenticação

**Arquivo:** `apps/admin/middleware.ts`

**Função:**
1. Intercepta todas as requisições (exceto assets estáticos)
2. Valida sessão JWT
3. Rotas públicas: permite acesso
4. Rotas protegidas: redireciona para `/login` se não autenticado
5. Já autenticado acessando `/login`: redireciona para `/dashboard`
6. API routes: injeta headers `x-tenant-id` e `x-user-role`

**Headers Injetados:**
```
x-tenant-id: uuid-do-tenant
x-user-role: SUPER_ADMIN | STORE_OWNER
```

---

### Roles e Permissões

| Role | Descrição | Permissões |
|------|-----------|------------|
| **SUPER_ADMIN** | Administrador da plataforma | • Acesso a `/users`<br>• Criar/deletar usuários<br>• Todas as permissões de STORE_OWNER |
| **STORE_OWNER** | Dono de loja | • Gerenciar produtos da própria loja<br>• Configurar marca<br>• Ver analytics da própria loja<br>• ❌ Não acessa `/users` |

---

### Isolamento Multi-Tenant

**Implementação:**
- Middleware injeta `x-tenant-id` em todas as requisições API
- Todas as queries Prisma filtram por `tenantId`
- Lojista A nunca vê produtos do Lojista B
- Cada tenant tem seu próprio slug público

**Exemplo de Query Isolada:**
```typescript
// Automático via middleware
const products = await prisma.product.findMany({
  where: {
    tenantId: req.headers.get('x-tenant-id'), // Injetado automaticamente
  },
});
```

---

## Resumo de Rotas

### Admin (Porta 3000)

| Tipo | Quantidade | Status |
|------|------------|--------|
| Páginas Públicas | 2 | ✅ `/login`, `/register` |
| Páginas Protegidas | 8 | ✅ Dashboard, produtos, usuários, etc. |
| API Endpoints | 15 | ✅ CRUD completo |
| Total | 25 | ✅ |

### Catalog (Porta 3001)

| Tipo | Quantidade | Status |
|------|------------|--------|
| Páginas Públicas | 3 | ✅ Landing, `[slug]`, 404 |
| API Endpoints | 3 | ✅ Theme, analytics, hello |
| Total | 6 | ✅ |

---

## Tecnologias Utilizadas

- **Framework:** Next.js 15 (App Router)
- **Autenticação:** NextAuth.js v5
- **Validação:** Zod
- **Formulários:** React Hook Form
- **State Management:** TanStack Query (React Query)
- **Database ORM:** Prisma
- **Estilização:** Tailwind CSS + Shadcn/ui
- **Upload:** Multipart form handling
- **Analytics:** Custom event tracking

---

**Documento gerado em:** 02/02/2026
**Última atualização:** 02/02/2026
**Versão:** 1.0
