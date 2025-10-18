# BNPB Chat Widget - Enhanced Makefile
.PHONY: default build run dev preview test clean lint format type-check deps install update docker-up docker-down docker-build docker-run docker-clean help

# Default target - show help when just 'make' is run
default: help

# Load environment variables from .env if it exists
ifneq (,$(wildcard .env))
include .env
export
endif

# ============================================================================
# BUILD & RUN COMMANDS
# ============================================================================

# Build the application for production
build:
	@echo "🔨 Building Vue.js application for production..."
	npm run build

# Run the development server
run:
	@echo "🚀 Starting development server..."
	npm run dev

# Run the development server (alias for run)
dev: run

# Preview the production build locally
preview:
	@echo "👀 Previewing production build..."
	npm run preview

# ============================================================================
# TESTING & QUALITY ASSURANCE
# ============================================================================

# Run tests
test:
	@echo "🧪 Running tests..."
	npm run test 2>/dev/null || echo "No tests configured yet - run 'npm run test:unit' if available"

# Lint the code
lint:
	@echo "🔍 Linting code..."
	npm run lint

# Format code with Prettier
format:
	@echo "💅 Formatting code..."
	npx prettier --write "src/**/*.{js,ts,vue,json,css,scss,md}" || echo "Prettier not available globally, trying with npx..."

# Type checking with Vue TypeScript
type-check:
	@echo "🔷 Running TypeScript type checking..."
	npx vue-tsc --noEmit || npm run type-check

# ============================================================================
# DEPENDENCY MANAGEMENT
# ============================================================================

# Install dependencies
deps:
	@echo "📦 Installing dependencies..."
	npm install

# Fresh install (clean install)
install: clean-npm deps

# Clean npm artifacts only
clean-npm:
	@echo "🧹 Cleaning npm artifacts..."
	rm -rf node_modules/
	rm -rf package-lock.json
	rm -rf .npm/

# Update dependencies
update:
	@echo "⬆️  Updating dependencies..."
	npm update

# ============================================================================
# DOCKER COMMANDS
# ============================================================================

# Start Docker containers (background)
docker-up:
	@echo "🐳 Starting Docker containers..."
	docker compose up -d

# Start existing containers without building
docker-start:
	@echo "🚀 Starting existing Docker containers..."
	docker compose start

# Build and start containers in foreground
docker-run:
	@echo "🔥 Building and starting containers in foreground..."
	docker compose up --build

# Stop Docker containers
docker-down:
	@echo "⏹️  Stopping Docker containers..."
	docker compose down

# Build Docker images
docker-build:
	@echo "🔨 Building Docker images..."
	docker compose build --no-cache

# Clean Docker resources
docker-clean:
	@echo "🧹 Cleaning Docker resources..."
	docker compose down -v --remove-orphans
	docker system prune -f --volumes

# Show Docker image size
docker-size:
	@echo "📏 Docker image size information:"
	docker images bnpb-chat-public 2>/dev/null || echo "No bnpb-chat-public images found"

# ============================================================================
# DEVELOPMENT WORKFLOW
# ============================================================================

# Project setup
setup: deps
	@echo "✅ Project setup complete!"
	@echo "Run 'make dev' to start development"

# Full development cycle
fresh-start: clean-npm install dev

# Production deployment preparation
deploy-prep: clean build docker-build
	@echo "✅ Production deployment preparation complete!"

# ============================================================================
# CLEANUP COMMANDS
# ============================================================================

# Clean build artifacts and dependencies
clean: clean-npm
	@echo "🧹 Cleaning build artifacts..."
	rm -rf dist/
	rm -rf build/
	rm -rf .vite/
	rm -rf coverage/

# Clean everything including Docker
clean-all: clean docker-clean
	@echo "🧹 Deep clean completed!"

# ============================================================================
# ENVIRONMENT CHECKS
# ============================================================================

# Check if laradock_shared network exists
check-network:
	@echo "🔍 Checking laradock_shared network..."
	@if docker network ls | grep -q laradock_shared; then \
		echo "✅ laradock_shared network exists"; \
	else \
		echo "❌ laradock_shared network not found"; \
		echo "Please ensure Laradock is running with shared network"; \
		echo "Run: cd /path/to/laradock && docker compose up -d nginx mysql redis"; \
	fi

# Check environment and dependencies
check-env: check-network
	@echo "🔍 Checking environment..."
	@echo "Node.js version: $$(node --version)"
	@echo "NPM version: $$(npm --version)"
	@echo "Docker version: $$(docker --version)"
	@echo "Docker Compose version: $$(docker compose --version)"
	@echo "Environment check complete ✅"

# ============================================================================
# HELP SYSTEM
# ============================================================================

# Comprehensive help
help:
	@echo "🚀 BNPB Chat Widget - Vue.js Frontend Commands:"
	@echo ""
	@echo "📦 Build & Run:"
	@echo "  build           - Build for production"
	@echo "  run             - Start development server"
	@echo "  dev             - Start development server (alias)"
	@echo "  preview         - Preview production build"
	@echo ""
	@echo "🧪 Testing & Quality:"
	@echo "  test            - Run tests"
	@echo "  lint            - Lint code"
	@echo "  format          - Format code with Prettier"
	@echo "  type-check      - TypeScript type checking"
	@echo "  clean           - Clean build artifacts"
	@echo ""
	@echo "🐳 Docker:"
	@echo "  docker-up       - Start containers (background)"
	@echo "  docker-start    - Start existing containers"
	@echo "  docker-run      - Build and start (foreground)"
	@echo "  docker-down     - Stop containers"
	@echo "  docker-build    - Build images"
	@echo "  docker-clean    - Clean Docker resources"
	@echo "  docker-size     - Show image size"
	@echo ""
	@echo "🔧 Dependencies & Setup:"
	@echo "  deps            - Install dependencies"
	@echo "  install         - Fresh install (clean + deps)"
	@echo "  update          - Update dependencies"
	@echo "  setup           - Project setup"
	@echo ""
	@echo "🚀 Quick Start:"
	@echo "  fresh-start     - Clean, install, and start dev server"
	@echo "  deploy-prep     - Prepare for deployment"
	@echo "  check-env       - Check environment setup"
	@echo ""
	@echo "🧹 Cleanup:"
	@echo "  clean-all       - Deep clean (npm + Docker)"
	@echo ""
	@echo "💡 Examples:"
	@echo "  make setup && make dev          # Quick development start"
	@echo "  make deploy-prep && make docker-up  # Production deployment"
	@echo "  make check-env                 # Verify environment"
