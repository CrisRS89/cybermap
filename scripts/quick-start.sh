#!/usr/bin/env bash
set -euo pipefail

# CyberMap Quick Start Script
# Este script automatiza la instalación y validación de CyberMap desde cero

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_DIR="$ROOT_DIR/apps/api/.venv"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo ""
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}" >&2
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Verificando requisitos"
    
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3.13+ no encontrado"
        echo "Instálalo desde: https://www.python.org/"
        exit 1
    fi
    print_success "Python: $(python3 --version)"
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js 20+ no encontrado"
        echo "Instálalo desde: https://nodejs.org/"
        exit 1
    fi
    print_success "Node.js: $(node --version)"
    
    if ! command -v npm &> /dev/null; then
        print_error "npm no encontrado"
        exit 1
    fi
    print_success "npm: $(npm --version)"
    
    if ! command -v git &> /dev/null; then
        print_error "Git no encontrado"
        exit 1
    fi
    print_success "Git: $(git --version)"
}

# Setup backend
setup_backend() {
    print_header "Configurando backend"
    
    print_info "Creando virtual environment..."
    cd "$ROOT_DIR/apps/api"
    python3 -m venv .venv
    
    print_info "Instalando dependencias..."
    # shellcheck source=/dev/null
    source .venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    
    print_info "Copiando archivos de configuración..."
    cp -n .env.example .env || true
    
    print_success "Backend configurado"
}

# Setup frontend
setup_frontend() {
    print_header "Configurando frontend"
    
    cd "$ROOT_DIR/apps/web"
    
    print_info "Instalando dependencias..."
    npm ci
    
    print_info "Copiando archivos de configuración..."
    cp -n .env.example .env.local || true
    
    print_success "Frontend configurado"
}

# Validate setup
validate_setup() {
    print_header "Validando instalación"
    
    cd "$ROOT_DIR"
    
    if [ ! -f "$VENV_DIR/bin/python" ]; then
        print_error "Virtual environment no existe"
        exit 1
    fi
    
    print_info "Ejecutando validación..."
    ./scripts/validate-local.sh
    
    print_success "Validación completada"
}

# Show next steps
show_next_steps() {
    print_header "¡Instalación completada!"
    
    echo ""
    echo -e "${YELLOW}Próximos pasos:${NC}"
    echo ""
    echo "  ${BLUE}Opción 1: Ejecutar con Docker Compose${NC}"
    echo "    docker compose up"
    echo "    Luego abre: http://localhost:3000"
    echo ""
    echo "  ${BLUE}Opción 2: Ejecutar localmente${NC}"
    echo "    Terminal 1 - Backend:"
    echo "      cd apps/api && source .venv/bin/activate"
    echo "      python -m uvicorn app.main:app --reload --port 8000"
    echo ""
    echo "    Terminal 2 - Frontend:"
    echo "      npm --prefix apps/web run dev"
    echo "    Luego abre: http://localhost:3000"
    echo ""
    echo "  ${BLUE}Opción 3: Usar Makefile${NC}"
    echo "    make dev"
    echo ""
    echo -e "${GREEN}🎉 ¡CyberMap está listo!${NC}"
}

# Main execution
main() {
    print_header "CyberMap Quick Setup"
    echo ""
    echo "Este script realizará:"
    echo "  1. Verificación de requisitos"
    echo "  2. Setup del backend (Python + FastAPI)"
    echo "  3. Setup del frontend (Node.js + Next.js)"
    echo "  4. Validación completa"
    echo ""
    
    check_prerequisites
    setup_backend
    setup_frontend
    validate_setup
    show_next_steps
}

# Run main function
main "$@"
