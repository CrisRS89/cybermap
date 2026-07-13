.PHONY: help setup dev test validate clean docker-up docker-down docker-logs lint format

# Colors for output
BLUE=\033[0;34m
GREEN=\033[0;32m
YELLOW=\033[1;33m
RED=\033[0;31m
NC=\033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)CyberMap - Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

setup: ## Setup project (install deps, venv, config files)
	@echo "$(BLUE)Setting up CyberMap...$(NC)"
	@echo "$(YELLOW)→ Backend virtual environment$(NC)"
	cd apps/api && python -m venv .venv && \
		. .venv/bin/activate && \
		pip install -r requirements.txt
	@echo "$(YELLOW)→ Frontend dependencies$(NC)"
	npm --prefix apps/web install
	@echo "$(YELLOW)→ Environment files$(NC)"
	cp -n apps/api/.env.example apps/api/.env || true
	cp -n apps/web/.env.example apps/web/.env.local || true
	@echo "$(GREEN)✓ Setup completed$(NC)"

dev: ## Run development servers (backend + frontend)
	@echo "$(BLUE)Starting development servers...$(NC)"
	@echo "$(YELLOW)Backend will run on http://localhost:8000$(NC)"
	@echo "$(YELLOW)Frontend will run on http://localhost:3000$(NC)"
	@echo ""
	@echo "$(GREEN)Starting in separate processes...$(NC)"
	@make dev-backend & \
	make dev-frontend

dev-backend: ## Run backend in dev mode only
	cd apps/api && \
		. .venv/bin/activate && \
		python -m uvicorn app.main:app --reload --port 8000

dev-frontend: ## Run frontend in dev mode only
	npm --prefix apps/web run dev

test: ## Run all tests (backend + frontend)
	@echo "$(BLUE)Running tests...$(NC)"
	@make test-backend
	@make test-frontend

test-backend: ## Run backend tests only
	@echo "$(YELLOW)Backend tests:$(NC)"
	cd apps/api && \
		. .venv/bin/activate && \
		python -m pytest -v

test-frontend: ## Run frontend tests only
	@echo "$(YELLOW)Frontend tests:$(NC)"
	npm --prefix apps/web run test

validate: ## Run full validation (tests + lint + build)
	@echo "$(BLUE)Running full validation...$(NC)"
	./scripts/validate-local.sh

lint: ## Run linters (frontend ESLint)
	@echo "$(YELLOW)Linting frontend...$(NC)"
	npm --prefix apps/web run lint

format: ## Format code (Python + TypeScript)
	@echo "$(YELLOW)Formatting Python code...$(NC)"
	cd apps/api && . .venv/bin/activate && black . || true
	@echo "$(YELLOW)Formatting TypeScript code...$(NC)"
	npm --prefix apps/web run lint -- --fix || true

clean: ## Clean build artifacts and cache
	@echo "$(BLUE)Cleaning up...$(NC)"
	@echo "$(YELLOW)→ Python cache$(NC)"
	find . -type d -name __pycache__ -exec rm -rf {} + || true
	find . -type f -name "*.pyc" -delete || true
	@echo "$(YELLOW)→ Node cache$(NC)"
	rm -rf apps/web/.next apps/web/node_modules apps/web/.turbopack-build || true
	@echo "$(YELLOW)→ Build artifacts$(NC)"
	rm -rf dist build out || true
	@echo "$(GREEN)✓ Cleaned$(NC)"

docker-up: ## Start services with Docker Compose
	@echo "$(BLUE)Starting Docker services...$(NC)"
	docker compose up -d
	@echo "$(GREEN)✓ Services started$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:3000$(NC)"
	@echo "$(YELLOW)Backend API: http://localhost:8000$(NC)"
	@echo "$(YELLOW)Health check: http://localhost:8000/health$(NC)"

docker-down: ## Stop and remove Docker containers
	@echo "$(BLUE)Stopping Docker services...$(NC)"
	docker compose down
	@echo "$(GREEN)✓ Services stopped$(NC)"

docker-logs: ## Show Docker Compose logs
	docker compose logs -f

docker-build: ## Build Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker compose build

docker-clean: ## Remove Docker containers and volumes
	@echo "$(BLUE)Cleaning Docker resources...$(NC)"
	docker compose down -v
	@echo "$(GREEN)✓ Docker resources cleaned$(NC)"

rebuild: ## Rebuild Docker images (no cache)
	@echo "$(BLUE)Rebuilding Docker images...$(NC)"
	docker compose build --no-cache

shell-backend: ## Open shell in backend container
	docker compose exec backend /bin/bash

shell-frontend: ## Open shell in frontend container
	docker compose exec frontend /bin/sh

logs-backend: ## Show backend logs
	docker compose logs -f backend

logs-frontend: ## Show frontend logs
	docker compose logs -f frontend

status: ## Show Docker Compose status
	docker compose ps

version: ## Show version information
	@echo "$(BLUE)CyberMap Version Information:$(NC)"
	@echo "  Version: 0.1.0"
	@grep -E '^\s*"version"' apps/web/package.json | head -1
	@python --version 2>&1 || echo "Python not installed"
	@node --version 2>&1 || echo "Node.js not installed"

.DEFAULT_GOAL := help
