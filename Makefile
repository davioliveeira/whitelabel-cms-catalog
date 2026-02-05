# ==============================================================================
# CMS Catálogo White Label - Makefile
# ==============================================================================
# Automation commands for development, build, and deployment.
#
# Quick Start:
#   make setup     - Complete project setup (first time)
#   make dev       - Start development servers
#   make build     - Build for production
#   make db-migrate - Run database migrations
#
# Run `make help` for all available commands.
# ==============================================================================

.DEFAULT_GOAL := help

# Define all phony targets (not files)
.PHONY: help setup install docker-up docker-down docker-logs docker-restart \
        db-generate db-migrate db-studio db-reset \
        dev dev-admin dev-catalog \
        build build-admin build-catalog \
        lint test clean check

# ==============================================================================
# COLORS (for pretty output)
# ==============================================================================
CYAN := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m
BOLD := \033[1m

# ==============================================================================
# VARIABLES
# ==============================================================================
PRISMA_SCHEMA := libs/database/prisma/schema.prisma
ADMIN_PORT := 8000
CATALOG_PORT := 8001

# ==============================================================================
# HELP
# ==============================================================================
help: ## Show this help message
	@echo ""
	@echo "$(BOLD)CMS Catálogo White Label$(RESET)"
	@echo "========================="
	@echo ""
	@echo "$(BOLD)Usage:$(RESET) make [target]"
	@echo ""
	@echo "$(BOLD)Available targets:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-15s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# ==============================================================================
# SETUP (First Time)
# ==============================================================================
install: ## Install npm dependencies
	@echo "$(CYAN)Installing dependencies...$(RESET)"
	npm install
	@echo "$(GREEN)Dependencies installed!$(RESET)"

docker-up: ## Start Docker containers (PostgreSQL, Redis)
	@echo "$(CYAN)Starting Docker containers...$(RESET)"
	docker-compose up -d
	@echo "$(GREEN)Containers started!$(RESET)"
	@echo "  PostgreSQL: localhost:5432"
	@echo "  Redis:      localhost:6379"

docker-down: ## Stop Docker containers
	@echo "$(YELLOW)Stopping Docker containers...$(RESET)"
	docker-compose down
	@echo "$(GREEN)Containers stopped!$(RESET)"

docker-restart: ## Restart Docker containers
	@echo "$(YELLOW)Restarting Docker containers...$(RESET)"
	docker-compose restart
	@echo "$(GREEN)Containers restarted!$(RESET)"

docker-logs: ## Show Docker container logs (follow mode)
	docker-compose logs -f

db-generate: ## Generate Prisma client
	@echo "$(CYAN)Generating Prisma client...$(RESET)"
	npx prisma generate --schema=$(PRISMA_SCHEMA)
	@echo "$(GREEN)Prisma client generated!$(RESET)"

db-migrate: ## Run database migrations
	@echo "$(CYAN)Running database migrations...$(RESET)"
	npx prisma migrate deploy --schema=$(PRISMA_SCHEMA)
	@echo "$(GREEN)Migrations applied!$(RESET)"

db-migrate-dev: ## Create new migration (development)
	@echo "$(CYAN)Creating new migration...$(RESET)"
	npx prisma migrate dev --schema=$(PRISMA_SCHEMA)

db-studio: ## Open Prisma Studio (database GUI)
	@echo "$(CYAN)Opening Prisma Studio...$(RESET)"
	npx prisma studio --schema=$(PRISMA_SCHEMA)

db-reset: ## Reset database (WARNING: destroys all data)
	@echo "$(RED)WARNING: This will destroy all data!$(RESET)"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	npx prisma migrate reset --schema=$(PRISMA_SCHEMA) --force

setup: ## Complete project setup (first time)
	@echo "$(BOLD)$(CYAN)"
	@echo "======================================"
	@echo "  CMS Catálogo White Label - Setup"
	@echo "======================================"
	@echo "$(RESET)"
	@$(MAKE) install
	@$(MAKE) docker-up
	@echo "$(YELLOW)Waiting for PostgreSQL to be ready...$(RESET)"
	@sleep 5
	@$(MAKE) db-generate
	@$(MAKE) db-migrate
	@echo ""
	@echo "$(BOLD)$(GREEN)Setup complete!$(RESET)"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Run $(CYAN)make dev$(RESET) to start development servers"
	@echo "  2. Admin panel: http://localhost:$(ADMIN_PORT)"
	@echo "  3. Catalog:     http://localhost:$(CATALOG_PORT)"
	@echo ""

# ==============================================================================
# DEVELOPMENT
# ==============================================================================
dev: ## Start both apps in development mode
	@echo "$(CYAN)Starting development servers...$(RESET)"
	@echo "  Admin:   http://localhost:$(ADMIN_PORT)"
	@echo "  Catalog: http://localhost:$(CATALOG_PORT)"
	@echo ""
	npx nx run-many --target=dev --projects=admin,catalog --parallel

dev-admin: ## Start admin app only (port 3000)
	@echo "$(CYAN)Starting admin app...$(RESET)"
	@echo "  URL: http://localhost:$(ADMIN_PORT)"
	npx nx dev admin

dev-catalog: ## Start catalog app only (port 3001)
	@echo "$(CYAN)Starting catalog app...$(RESET)"
	@echo "  URL: http://localhost:$(CATALOG_PORT)"
	npx nx dev catalog

# ==============================================================================
# BUILD
# ==============================================================================
build: ## Build both apps for production
	@echo "$(CYAN)Building for production...$(RESET)"
	NODE_ENV=production npx nx run-many --target=build --projects=admin,catalog
	@echo "$(GREEN)Build complete!$(RESET)"

build-admin: ## Build admin app only
	@echo "$(CYAN)Building admin app...$(RESET)"
	NODE_ENV=production npx nx build admin
	@echo "$(GREEN)Admin build complete!$(RESET)"

build-catalog: ## Build catalog app only
	@echo "$(CYAN)Building catalog app...$(RESET)"
	NODE_ENV=production npx nx build catalog
	@echo "$(GREEN)Catalog build complete!$(RESET)"

# ==============================================================================
# QUALITY
# ==============================================================================
lint: ## Run linter on all projects
	@echo "$(CYAN)Running linter...$(RESET)"
	npx nx run-many --target=lint --all

test: ## Run tests on all projects
	@echo "$(CYAN)Running tests...$(RESET)"
	npx nx run-many --target=test --all

check: ## Run lint and tests
	@$(MAKE) lint
	@$(MAKE) test

# ==============================================================================
# UTILITIES
# ==============================================================================
clean: ## Clean build artifacts and caches
	@echo "$(YELLOW)Cleaning build artifacts...$(RESET)"
	rm -rf apps/admin/.next
	rm -rf apps/catalog/.next
	rm -rf dist
	rm -rf .nx/cache
	@echo "$(GREEN)Clean complete!$(RESET)"

clean-all: clean ## Clean everything including node_modules
	@echo "$(YELLOW)Removing node_modules...$(RESET)"
	rm -rf node_modules
	@echo "$(GREEN)Full clean complete!$(RESET)"
	@echo "Run $(CYAN)make install$(RESET) to reinstall dependencies."
