---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories", "step-04-final-validation"]
status: complete
inputDocuments:
  - docs/prd.md
  - docs/architecture.md
  - docs/front-end-architecture.md
  - docs/front-end-spec.md
  - docs/project-brief.md
---

# cms-catalogo-white-label - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for cms-catalogo-white-label, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

| ID | Requirement |
|----|-------------|
| FR1 | **Setup Whitelabel:** O lojista deve configurar sua identidade visual (logo, cores, fontes) e números de WhatsApp em um fluxo de onboarding. |
| FR2 | **Importação Massiva:** Upload de planilhas CSV/Excel para cadastro rápido de centenas de produtos. |
| FR3 | **Gestão Híbrida:** Adição e edição individual de produtos via formulário administrativo. |
| FR4 | **Lógica de Smart Grid:** O catálogo deve organizar produtos em grades 2x2. Se houver apenas 1 ou 2 itens em uma categoria/marca, o layout deve se ajustar para manter a elegância visual. |
| FR5 | **Click-to-WhatsApp:** Link dinâmico que envia o nome do produto e o preço final formatados para o atendente. |
| FR6 | **Dashboard de Cliques:** Contador de visualizações/cliques por produto para análise de performance. |

### NonFunctional Requirements

| ID | Requirement |
|----|-------------|
| NFR1 | **Infraestrutura Local:** Todo o ambiente deve rodar via Docker Compose (PostgreSQL, Redis, App). |
| NFR2 | **Desenvolvimento DX:** Uso de Nx para gerenciar o monorepo e Makefile para automação de comandos. |
| NFR3 | **Performance:** Carregamento de imagens otimizado (WebP/Lazy Loading) para suportar 100+ itens. Catálogo deve carregar em menos de 2 segundos no mobile. |
| NFR4 | **Isolamento:** Multi-tenancy robusto garantindo que os dados de um lojista nunca vazem para outro (via tenant_id). |

### Additional Requirements

**From Architecture:**
- ARCH-01: Monorepo Nx com estrutura apps/ (admin, catalog) e libs/ (ui, database, shared, theme-engine)
- ARCH-02: PostgreSQL 16 com Prisma ORM para type-safety e migrations
- ARCH-03: Redis para cache de busca e rate limiting
- ARCH-04: Docker Compose com serviços: postgres, redis, admin-app, catalog-app
- ARCH-05: Makefile com comandos: make setup, make dev, make db-migrate, make build
- ARCH-06: Nginx/Traefik sugerido para SSL termination e roteamento de domínios
- ARCH-07: Isolamento via coluna tenant_id em todas as tabelas sensíveis
- ARCH-08: Theme Engine dinâmico via CSS variables (sem rebuild necessário)
- ARCH-09: Database indexing no slug do tenant e brand_category para buscas rápidas

**From UX/Frontend Spec:**
- UX-01: Conceito "Luxo Minimalista" com shadcn/ui + Tailwind CSS
- UX-02: Espaços em branco, fontes Sans-serif, transições suaves (fade-in)
- UX-03: Product Card com foto proporção 1:1, Badge "Disponível", Preços "De/Por" (riscado/bold)
- UX-04: Smart Grid - Desktop 4 colunas, Mobile 2 colunas fixas, item único expande 100%
- UX-05: Skeleton Screens como placeholder animado durante loading
- UX-06: WhatsApp Trigger - Botão flutuante com ícone e label "Pedir Agora"
- UX-07: Whitelabel Tokens: --primary, --radius, --font-main
- UX-08: State Management com Zustand (global) + TanStack Query (server state)

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 2 | Setup Whitelabel (logo, cores, WhatsApp) |
| FR2 | Epic 3 | Importação Massiva (CSV/Excel) |
| FR3 | Epic 3 | Gestão Híbrida (CRUD individual) |
| FR4 | Epic 4 | Lógica de Smart Grid |
| FR5 | Epic 4 | Click-to-WhatsApp |
| FR6 | Epic 5 | Dashboard de Cliques |

## Epic List

### Epic 1: Project Foundation & Developer Setup
Developer can set up the complete development environment with a single command and have the foundational infrastructure running.

**User Outcome:** Developers can clone, setup, and run the entire stack locally with `make setup`.
**FRs Covered:** (Foundation for all FRs)
**NFRs Covered:** NFR1, NFR2
**ARCH Covered:** ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-05

### Epic 2: Tenant Onboarding & Whitelabel Branding
Store owner can configure their brand identity and have a personalized storefront URL.

**User Outcome:** Lojista configura sua marca e tem um catálogo visual personalizado acessível via `/[slug]`.
**FRs Covered:** FR1
**NFRs Covered:** NFR4
**ARCH Covered:** ARCH-07, ARCH-08, ARCH-09
**UX Covered:** UX-01, UX-07

### Epic 3: Product Inventory Management
Store owner can manage their complete product catalog through both bulk import and individual CRUD.

**User Outcome:** Lojista importa planilha com 100+ produtos ou adiciona/edita produtos individualmente.
**FRs Covered:** FR2, FR3
**NFRs Covered:** NFR3
**UX Covered:** UX-03

### Epic 4: Public Catalog & WhatsApp Conversion
End customers can browse the catalog and initiate purchases via WhatsApp with pre-filled messages.

**User Outcome:** Cliente navega no catálogo elegante e clica para pedir via WhatsApp.
**FRs Covered:** FR4, FR5
**NFRs Covered:** NFR3
**UX Covered:** UX-02, UX-03, UX-04, UX-05, UX-06, UX-08

### Epic 5: Analytics Dashboard
Store owner can view product engagement metrics to make data-driven inventory decisions.

**User Outcome:** Lojista vê quais produtos são mais clicados para ajustar estoque.
**FRs Covered:** FR6

---

## Epic 1: Project Foundation & Developer Setup

Developer can set up the complete development environment with a single command and have the foundational infrastructure running.

### Story 1.1: Initialize Nx Monorepo Structure

As a **developer**,
I want **a pre-configured Nx monorepo with the base folder structure**,
So that **I can start building applications with shared libraries and consistent tooling**.

**Acceptance Criteria:**

**Given** a fresh clone of the repository
**When** I open the project
**Then** the following structure exists:
- `apps/admin/` - Next.js admin app skeleton
- `apps/catalog/` - Next.js catalog app skeleton
- `libs/ui/` - Shared UI components library
- `libs/database/` - Database schema library
- `libs/shared/` - Shared utilities library
- `libs/theme-engine/` - Theme injection library
**And** `nx.json` is properly configured
**And** `tsconfig.base.json` has path aliases for all libs

---

### Story 1.2: Configure Docker Compose Infrastructure

As a **developer**,
I want **Docker Compose configured with PostgreSQL and Redis services**,
So that **I can run the complete infrastructure locally without manual setup**.

**Acceptance Criteria:**

**Given** Docker and Docker Compose are installed
**When** I run `docker-compose up -d`
**Then** PostgreSQL 16 container starts on port 5432
**And** Redis container starts on port 6379
**And** a persistent volume is created for PostgreSQL data
**And** health checks are configured for both services
**And** `.env.example` file exists with required environment variables

---

### Story 1.3: Setup Prisma Schema Foundation

As a **developer**,
I want **Prisma configured with the initial tenant schema**,
So that **I can run migrations and have type-safe database access**.

**Acceptance Criteria:**

**Given** the database library exists at `libs/database/`
**When** I review the Prisma configuration
**Then** `schema.prisma` is configured for PostgreSQL
**And** the `Tenant` model exists with fields: `id`, `slug`, `name`, `createdAt`, `updatedAt`
**And** `prisma/migrations/` folder exists with initial migration
**And** Prisma Client is generated and exported from the library

---

### Story 1.4: Create Makefile Automation Commands

As a **developer**,
I want **a Makefile with standard automation commands**,
So that **I can execute common tasks with simple commands**.

**Acceptance Criteria:**

**Given** I have the repository cloned
**When** I run `make setup`
**Then** npm dependencies are installed
**And** Docker containers are started
**And** database migrations are executed
**And** Prisma Client is generated

**Given** I want to start development
**When** I run `make dev`
**Then** both admin and catalog apps start in development mode
**And** they are accessible at `localhost:3000` and `localhost:3001`

**Given** I want to run migrations
**When** I run `make db-migrate`
**Then** Prisma migrations are applied to the database

**Given** I want to build for production
**When** I run `make build`
**Then** production builds are generated for both apps

---

### Story 1.5: Configure Base Next.js Applications

As a **developer**,
I want **both Next.js apps configured with App Router and Tailwind CSS**,
So that **I have a working foundation for building the admin and catalog interfaces**.

**Acceptance Criteria:**

**Given** the admin app at `apps/admin/`
**When** I start the development server
**Then** Next.js 14+ with App Router is running
**And** Tailwind CSS is configured with the design system tokens
**And** shadcn/ui is installed and configured
**And** a basic layout with placeholder content renders

**Given** the catalog app at `apps/catalog/`
**When** I start the development server
**Then** Next.js 14+ with App Router is running
**And** Tailwind CSS is configured
**And** shadcn/ui is installed and configured
**And** a basic layout with placeholder content renders

---

## Epic 2: Tenant Onboarding & Whitelabel Branding

Store owner can configure their brand identity and have a personalized storefront URL.

### Story 2.1: Create Tenant Data Model and Registration

As a **store owner**,
I want **to register my store in the system**,
So that **I have a dedicated space to manage my catalog**.

**Acceptance Criteria:**

**Given** I am a new store owner
**When** I access the admin registration page
**Then** I can create an account with email and password
**And** a new Tenant record is created in the database
**And** a unique slug is generated from my store name
**And** I am redirected to the onboarding flow

**Given** a tenant slug already exists
**When** I try to register with the same store name
**Then** a unique slug variant is generated (e.g., `store-name-2`)

---

### Story 2.2: Implement Brand Identity Configuration

As a **store owner**,
I want **to configure my brand colors, logo, and fonts**,
So that **my catalog reflects my brand identity**.

**Acceptance Criteria:**

**Given** I am logged into the admin panel
**When** I access the brand settings page
**Then** I can upload my logo (PNG/JPG, max 2MB)
**And** I can select a primary color via color picker
**And** I can select a secondary color
**And** I can choose border radius style (sharp/rounded/pill)
**And** changes are saved to the Tenant record

**Given** I save my brand settings
**When** I view the preview
**Then** the colors are applied to the preview UI immediately
**And** my logo appears in the header area

---

### Story 2.3: Configure WhatsApp Contact Numbers

As a **store owner**,
I want **to configure my WhatsApp numbers for customer contact**,
So that **customers can reach me directly from the catalog**.

**Acceptance Criteria:**

**Given** I am in the brand settings
**When** I access the WhatsApp configuration section
**Then** I can add a primary WhatsApp number (with country code)
**And** I can optionally add a secondary number for offers/groups
**And** phone numbers are validated for correct format
**And** numbers are saved to the Tenant record

**Given** an invalid phone format is entered
**When** I try to save
**Then** a clear validation error message is displayed

---

### Story 2.4: Build Theme Engine for Dynamic CSS Variables

As a **developer**,
I want **a Theme Engine that injects tenant colors as CSS variables**,
So that **the catalog renders with the correct brand colors without rebuild**.

**Acceptance Criteria:**

**Given** a tenant has configured their brand colors
**When** a user visits the catalog at `/[slug]`
**Then** the Theme Engine fetches tenant settings from database
**And** CSS variables are injected into `:root`:
  - `--primary: {tenant.primaryColor}`
  - `--secondary: {tenant.secondaryColor}`
  - `--radius: {tenant.borderRadius}`
**And** all UI components use these CSS variables

**Given** the tenant updates their colors
**When** a user refreshes the catalog
**Then** the new colors are applied immediately (no cache issues)

---

### Story 2.5: Implement Multi-tenant Middleware and Slug Routing

As a **customer**,
I want **to access a store's catalog via its unique URL**,
So that **I see only that store's products and branding**.

**Acceptance Criteria:**

**Given** a tenant with slug `perfumaria-elegance` exists
**When** I visit `/perfumaria-elegance`
**Then** the catalog app loads with that tenant's branding
**And** only products belonging to that tenant are shown
**And** the tenant's logo appears in the header

**Given** I visit a non-existent slug `/invalid-store`
**When** the page loads
**Then** a friendly 404 page is displayed
**And** I am not shown any other tenant's data

**Given** the middleware processes a request
**When** the tenant is identified
**Then** the `tenant_id` is available in the request context
**And** all database queries are automatically filtered by `tenant_id`

---

## Epic 3: Product Inventory Management

Store owner can manage their complete product catalog through both bulk import and individual CRUD.

### Story 3.1: Create Product Data Model

As a **developer**,
I want **a Product model with all required fields**,
So that **products can be stored and retrieved with full details**.

**Acceptance Criteria:**

**Given** the database schema
**When** I review the Product model
**Then** it contains the following fields:
  - `id` (UUID, primary key)
  - `tenant_id` (UUID, foreign key to Tenant)
  - `name` (string, required)
  - `description` (text, optional)
  - `brand` (string, optional)
  - `category` (string, optional)
  - `originalPrice` (decimal, "De" price)
  - `salePrice` (decimal, "Por" price, required)
  - `imageUrl` (string, optional)
  - `isAvailable` (boolean, default true)
  - `createdAt`, `updatedAt` (timestamps)
**And** an index exists on `tenant_id` for fast queries
**And** an index exists on `brand` and `category` for filtering

---

### Story 3.2: Build Product CRUD API Endpoints

As a **store owner**,
I want **API endpoints to create, read, update, and delete products**,
So that **I can manage my inventory programmatically**.

**Acceptance Criteria:**

**Given** I am authenticated as a store owner
**When** I call `POST /api/products` with valid product data
**Then** a new product is created with my `tenant_id`
**And** the created product is returned with its ID

**Given** I want to list my products
**When** I call `GET /api/products`
**Then** only products matching my `tenant_id` are returned
**And** results can be filtered by `brand` or `category`

**Given** I want to update a product
**When** I call `PUT /api/products/[id]` with new data
**Then** the product is updated if it belongs to my tenant
**And** a 404 is returned if the product doesn't exist or belongs to another tenant

**Given** I want to delete a product
**When** I call `DELETE /api/products/[id]`
**Then** the product is soft-deleted (or hard-deleted per business rules)

---

### Story 3.3: Build Individual Product Form UI

As a **store owner**,
I want **a form to add and edit individual products**,
So that **I can manage products one at a time when needed**.

**Acceptance Criteria:**

**Given** I am in the admin panel
**When** I click "Add Product"
**Then** a form appears with fields for:
  - Name (required)
  - Description
  - Brand (with autocomplete from existing brands)
  - Category (with autocomplete)
  - Original Price ("De")
  - Sale Price ("Por", required)
  - Image upload
  - Availability toggle

**Given** I fill the form with valid data
**When** I click "Save"
**Then** the product is created
**And** I see a success toast notification
**And** the product appears in my product list

**Given** I click "Edit" on an existing product
**When** the form loads
**Then** all fields are pre-populated with current values
**And** I can update and save changes

---

### Story 3.4: Implement Product Image Upload and Optimization

As a **store owner**,
I want **to upload product images that are automatically optimized**,
So that **my catalog loads fast without manual image processing**.

**Acceptance Criteria:**

**Given** I upload an image in the product form
**When** the upload completes
**Then** the image is stored in the designated storage (local volume or S3)
**And** the image is resized to max 800x800 pixels
**And** the image is converted to WebP format
**And** the optimized image URL is saved to the product

**Given** an image larger than 5MB is uploaded
**When** the upload is attempted
**Then** a validation error is shown
**And** the upload is rejected

**Given** a non-image file is uploaded
**When** the upload is attempted
**Then** a validation error is shown ("Only JPG, PNG, WebP allowed")

---

### Story 3.5: Build CSV/Excel Bulk Import Feature

As a **store owner**,
I want **to import products from a CSV or Excel file**,
So that **I can add hundreds of products quickly**.

**Acceptance Criteria:**

**Given** I am in the admin panel
**When** I click "Import Products"
**Then** I can download a template CSV/Excel file
**And** the template shows expected columns: `name`, `brand`, `category`, `originalPrice`, `salePrice`, `imageUrl`, `isAvailable`

**Given** I upload a valid CSV/Excel file
**When** the import processes
**Then** each row creates a new product with my `tenant_id`
**And** a progress indicator shows import status
**And** a summary shows: X products imported successfully

**Given** some rows have validation errors
**When** the import completes
**Then** valid rows are imported
**And** a detailed error report shows which rows failed and why
**And** I can download the error report

**Given** I upload a file with 500+ products
**When** the import runs
**Then** processing happens in the background (async)
**And** I can navigate away and check status later

---

### Story 3.6: Build Product List with Filters and Search

As a **store owner**,
I want **to view and search my product list with filters**,
So that **I can quickly find and manage specific products**.

**Acceptance Criteria:**

**Given** I am in the product management section
**When** the page loads
**Then** I see a paginated list of my products (20 per page)
**And** each row shows: thumbnail, name, brand, sale price, availability

**Given** I want to filter products
**When** I select a brand from the filter dropdown
**Then** only products of that brand are shown

**Given** I want to search products
**When** I type in the search box
**Then** products matching the name are shown (debounced search)

**Given** I want to bulk edit availability
**When** I select multiple products via checkboxes
**Then** I can toggle availability for all selected products at once

---

## Epic 4: Public Catalog & WhatsApp Conversion

End customers can browse the catalog and initiate purchases via WhatsApp with pre-filled messages.

### Story 4.1: Build Public Catalog Page Structure

As a **customer**,
I want **to view a store's catalog on a clean, branded page**,
So that **I can browse products in an elegant interface**.

**Acceptance Criteria:**

**Given** I visit `/[slug]` for a valid tenant
**When** the page loads
**Then** I see the tenant's logo in the header
**And** the page uses the tenant's brand colors
**And** the design follows "Luxo Minimalista" aesthetic
**And** fonts are Sans-serif and modern
**And** there is generous whitespace

**Given** the tenant has no products
**When** the page loads
**Then** a friendly empty state message is displayed
**And** the branding is still visible

---

### Story 4.2: Implement Smart Grid Product Layout

As a **customer**,
I want **products displayed in an elegant responsive grid**,
So that **I can easily browse products on any device**.

**Acceptance Criteria:**

**Given** I view the catalog on desktop (>1024px)
**When** products are displayed
**Then** they appear in a 4-column grid
**And** spacing is consistent between cards

**Given** I view the catalog on mobile (<768px)
**When** products are displayed
**Then** they appear in a 2-column grid
**And** cards are appropriately sized for touch

**Given** a brand/category has only 1 product
**When** that section renders
**Then** the single product card expands to 100% width
**And** the layout remains visually balanced

**Given** a brand/category has only 2 products
**When** that section renders
**Then** the products display side by side
**And** they don't stretch unnaturally

---

### Story 4.3: Build Product Card Component

As a **customer**,
I want **attractive product cards showing key information**,
So that **I can quickly evaluate products**.

**Acceptance Criteria:**

**Given** a product is displayed in the grid
**When** I view the product card
**Then** I see:
  - Product image (1:1 aspect ratio)
  - Product name
  - "Disponível" badge (if available)
  - Original price crossed out ("De: R$ XX,XX")
  - Sale price in bold brand color ("Por: R$ XX,XX")
  - WhatsApp action button

**Given** the product has no original price
**When** the card renders
**Then** only the sale price is shown (no "De/Por")

**Given** the product is unavailable
**When** the card renders
**Then** no "Disponível" badge is shown
**And** the card may be visually muted

---

### Story 4.4: Implement Skeleton Loading States

As a **customer**,
I want **smooth loading placeholders while content loads**,
So that **the page feels fast and professional**.

**Acceptance Criteria:**

**Given** the catalog page is loading
**When** products are being fetched
**Then** skeleton placeholders are shown in the grid
**And** skeletons match the card dimensions (1:1 image, text lines)
**And** skeletons have a subtle animation (pulse/shimmer)

**Given** images are loading
**When** individual images load
**Then** each image fades in smoothly (transition)
**And** layout doesn't shift (proper aspect ratio reserved)

**Given** the page loads
**When** all content is ready
**Then** the transition from skeleton to content is smooth

---

### Story 4.5: Build Click-to-WhatsApp Feature

As a **customer**,
I want **to click a button and open WhatsApp with a pre-filled message**,
So that **I can easily express interest in a product**.

**Acceptance Criteria:**

**Given** I see a product I want
**When** I click the "Pedir Agora" WhatsApp button
**Then** WhatsApp opens (web or app depending on device)
**And** the message is pre-filled with:
  - "Olá! Tenho interesse no produto:"
  - "📦 {product.name}"
  - "💰 R$ {product.salePrice}"
**And** the tenant's WhatsApp number is the recipient

**Given** I'm on mobile
**When** I click the WhatsApp button
**Then** the native WhatsApp app opens (if installed)
**And** the message is ready to send

**Given** I'm on desktop
**When** I click the WhatsApp button
**Then** WhatsApp Web opens in a new tab
**And** the message is pre-filled

---

### Story 4.6: Implement Catalog Performance Optimizations

As a **customer**,
I want **the catalog to load in under 2 seconds**,
So that **I have a fast, frustration-free experience**.

**Acceptance Criteria:**

**Given** a catalog with 100+ products
**When** I load the page on mobile 4G
**Then** the initial content is visible within 2 seconds
**And** images lazy-load as I scroll

**Given** products have images
**When** images are served
**Then** they are in WebP format
**And** they are appropriately sized (not oversized)
**And** Next.js Image optimization is used

**Given** I scroll through the catalog
**When** new products come into view
**Then** images load progressively
**And** there is no jank or layout shift

**Given** the same user returns
**When** they load the catalog again
**Then** cached assets load instantly

---

## Epic 5: Analytics Dashboard

Store owner can view product engagement metrics to make data-driven inventory decisions.

### Story 5.1: Create Analytics Data Model

As a **developer**,
I want **a data model to track product interactions**,
So that **analytics data can be stored and queried efficiently**.

**Acceptance Criteria:**

**Given** the database schema
**When** I review the Analytics model
**Then** it contains the following fields:
  - `id` (UUID, primary key)
  - `tenant_id` (UUID, foreign key)
  - `product_id` (UUID, foreign key)
  - `event_type` (enum: 'view', 'whatsapp_click')
  - `created_at` (timestamp)
  - `user_agent` (string, optional)
  - `referrer` (string, optional)
**And** indexes exist on `tenant_id`, `product_id`, `created_at`
**And** the model supports high-volume inserts

---

### Story 5.2: Implement Event Tracking API

As a **developer**,
I want **API endpoints to record analytics events**,
So that **product views and clicks are tracked**.

**Acceptance Criteria:**

**Given** a customer views a product in the catalog
**When** the product card becomes visible
**Then** a `view` event is recorded via `POST /api/analytics`
**And** the event includes `tenant_id` and `product_id`

**Given** a customer clicks the WhatsApp button
**When** the click occurs
**Then** a `whatsapp_click` event is recorded
**And** the event is tracked before opening WhatsApp

**Given** high traffic to the catalog
**When** many events are triggered
**Then** events are batched/debounced to prevent excessive API calls
**And** the system handles bursts without data loss

---

### Story 5.3: Build Analytics Dashboard UI

As a **store owner**,
I want **a dashboard showing my product engagement metrics**,
So that **I can understand which products are popular**.

**Acceptance Criteria:**

**Given** I am logged into the admin panel
**When** I navigate to the Dashboard section
**Then** I see an overview with:
  - Total views (last 7 days)
  - Total WhatsApp clicks (last 7 days)
  - Conversion rate (clicks / views)
  - Chart showing daily trends

**Given** I want to see detailed metrics
**When** I scroll down the dashboard
**Then** I see a table of top products by:
  - Most viewed
  - Most clicked
  - Highest conversion rate

**Given** I want to filter by date
**When** I select a date range
**Then** all metrics update to reflect the selected period

---

### Story 5.4: Build Product Performance Table

As a **store owner**,
I want **to see performance metrics for each product**,
So that **I can identify my best and worst performers**.

**Acceptance Criteria:**

**Given** I am on the analytics dashboard
**When** I view the product performance table
**Then** I see columns for:
  - Product name
  - Views count
  - WhatsApp clicks count
  - Conversion rate (%)
  - Trend indicator (↑ ↓ →)

**Given** I want to sort the table
**When** I click a column header
**Then** the table sorts by that column (ascending/descending)

**Given** I want to find a specific product
**When** I type in the search box
**Then** the table filters to matching products

**Given** I click on a product row
**When** the details expand
**Then** I see a mini-chart of that product's daily performance

---

### Story 5.5: Implement Real-time Dashboard Updates

As a **store owner**,
I want **the dashboard to show recent activity**,
So that **I can see engagement as it happens**.

**Acceptance Criteria:**

**Given** I am viewing the dashboard
**When** new events occur on my catalog
**Then** the total counts update within 30 seconds
**And** no full page refresh is required

**Given** I want to see live activity
**When** I enable "Live Mode" toggle
**Then** I see a feed of recent events:
  - "Product X was viewed"
  - "Product Y received a WhatsApp click"
**And** the feed updates in real-time

**Given** I leave the dashboard open for hours
**When** I return to it
**Then** it auto-refreshes data periodically
**And** no stale data is shown
