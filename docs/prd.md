# Product Requirements Document (PRD): Catálogo Whitelabel SaaS

## 1. Goals and Background Context

### Background
O projeto visa digitalizar a operação da **Prosperar Perfumaria**, que atualmente sofre com a gestão manual de catálogos no Canva. O fluxo atual de exportar PDFs e enviá-los manualmente é lento, propenso a erros de preço e dificulta a conversão direta via WhatsApp.

### Objetivos
* **Automatização Operacional**: Substituir o Canva por um CMS onde o estoque e os preços são atualizados em tempo real.
* **Escalabilidade SaaS**: Permitir que a plataforma seja vendida para outros lojistas (Whitelabel).
* **Alta Performance Técnica**: Utilizar um monorepo (Nx) e orquestração (Docker) para garantir um ambiente de desenvolvimento e produção profissional e rápido.

## 2. Requirements

### 2.1 Requisitos Funcionais (FR)
* **FR1 (Setup Whitelabel):** O lojista deve configurar sua identidade visual (logo, cores, fontes) e números de WhatsApp em um fluxo de onboarding.
* **FR2 (Importação Massiva):** Upload de planilhas CSV/Excel para cadastro rápido de centenas de produtos.
* **FR3 (Gestão Híbrida):** Adição e edição individual de produtos via formulário administrativo.
* **FR4 (Lógica de Smart Grid):** O catálogo deve organizar produtos em grades 2x2. Se houver apenas 1 ou 2 itens em uma categoria/marca, o layout deve se ajustar para manter a elegância visual.
* **FR5 (Click-to-WhatsApp):** Link dinâmico que envia o nome do produto e o preço final formatados para o atendente.
* **FR6 (Dashboard de Cliques):** Contador de visualizações/cliques por produto para análise de performance.

### 2.2 Requisitos Não-Funcionais (NFR)
* **NFR1 (Infraestrutura Local):** Todo o ambiente deve rodar via Docker Compose (PostgreSQL, Redis, App).
* **NFR2 (Desenvolvimento DX):** Uso de Nx para gerenciar o monorepo e Makefile para automação de comandos.
* **NFR3 (Performance):** Carregamento de imagens otimizado (WebP/Lazy Loading) para suportar 100+ itens.
* **NFR4 (Isolamento):** Multi-tenancy robusto garantindo que os dados de um lojista nunca vazem para outro.

## 3. Technical Constraints & Infrastructure
* **Monorepo:** Nx (Workspaces) para gerenciar as apps de `admin` e `catalog`.
* **Frontend:** Next.js 14+ (App Router).
* **Banco de Dados:** PostgreSQL (Self-hosted via Docker).
* **ORM:** Prisma ou Drizzle para migrações e acesso ao banco.
* **DevOps:** Makefile para orquestração de comandos (`make setup`, `make dev`, `make migrate`).

## 4. Epics & User Stories

### Epic 1: Onboarding e Branding (Whitelabel)
* **US 1.1:** Como lojista, quero configurar minhas cores e logo para que o catálogo pareça minha própria marca.
* **US 1.2:** Como lojista, quero configurar os números de WhatsApp de atendimento e grupos de ofertas.

### Epic 2: Gestão de Inventário
* **US 2.1:** Como lojista, quero importar uma planilha de perfumes para não ter que cadastrar tudo na mão.
* **US 2.2:** Como lojista, quero adicionar um produto unitário quando chegar uma novidade no estoque.
* **US 2.3:** Como lojista, quero gerenciar preços "De/Por" para criar senso de urgência no cliente.

### Epic 3: Experiência do Cliente (O Catálogo)
* **US 3.1:** Como cliente, quero ver os perfumes em uma grade 2x2 elegante e rápida no meu celular.
* **US 3.2:** Como cliente, quero clicar no produto e já cair no WhatsApp com a mensagem de interesse pronta.

### Epic 4: DevOps e DX (Developer Experience)
* **US 4.1:** Como desenvolvedor, quero rodar a aplicação inteira com um único comando `make setup`.
* **US 4.2:** Como desenvolvedor, quero que as migrações do banco de dados sejam controladas via código no monorepo Nx.

### Epic 5: Dashboard e Métricas
* **US 5.1:** Como lojista, quero ver quais perfumes estão sendo mais clicados para ajustar meu estoque.

## 5. Acceptance Criteria
* O catálogo deve carregar em menos de 2 segundos no mobile.
* A troca de cores no CMS deve refletir instantaneamente na pré-visualização.
* A importação de planilha deve reportar erros de formatação claramente ao usuário.