# CyberMap Development Guide

Guía para desarrolladores que quieren trabajar en CyberMap.

---

## 📋 Tabla de Contenidos

1. [Setup Local](#setup-local)
2. [Estructura de Código](#estructura-de-código)
3. [Testing](#testing)
4. [Agregando una Feature](#agregando-una-feature)
5. [Debugging](#debugging)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## 🔧 Setup Local

### Opción 1: Quick Setup Script (Recomendado)

```bash
./scripts/quick-start.sh
```

Este script automatiza:
1. Verificar requisitos (Python 3.13+, Node 20+)
2. Crear virtual environment de Python
3. Instalar dependencias backend
4. Instalar dependencias frontend
5. Copiar archivos de configuración
6. Ejecutar validación completa

### Opción 2: Setup Manual

```bash
# Backend
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# Frontend (en otra terminal desde raíz)
npm --prefix apps/web install
cp apps/web/.env.example apps/web/.env.local

# Validar
./scripts/validate-local.sh
```

### Opción 3: Docker (Sin instalar nada localmente)

```bash
docker compose up
```

---

## 📁 Estructura de Código

```
cybermap/
├── apps/
│   ├── api/                    # Backend FastAPI
│   │   ├── app/
│   │   │   ├── main.py         # Entry point
│   │   │   ├── ai/             # AI orchestration
│   │   │   │   ├── agents/     # Agent implementations
│   │   │   │   ├── providers/  # AI provider integrations
│   │   │   │   └── orchestrator.py
│   │   │   ├── core/           # Core utilities
│   │   │   │   └── config.py
│   │   │   ├── repositories/   # Data access layer
│   │   │   │   ├── ai_runs_sqlite_repository.py
│   │   │   │   └── exploration_sqlite_repository.py
│   │   │   ├── routes/         # API endpoints
│   │   │   │   ├── ai.py
│   │   │   │   ├── exploration.py
│   │   │   │   └── settings.py
│   │   │   ├── schemas/        # Request/response models
│   │   │   │   ├── ai.py
│   │   │   │   ├── exploration.py
│   │   │   │   └── settings.py
│   │   │   ├── services/       # Business logic
│   │   │   │   ├── nmap_import_service.py
│   │   │   │   └── nmap_parser.py
│   │   │   └── storage/        # Database/persistence
│   │   │       ├── sqlite_migrations.py
│   │   │       └── json_store.py
│   │   ├── tests/              # Test suite
│   │   ├── requirements.txt
│   │   ├── .env.example
│   │   └── README.md
│   │
│   └── web/                    # Frontend Next.js
│       ├── src/
│       │   ├── app/            # Pages
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx
│       │   │   ├── exploration/page.tsx
│       │   │   ├── settings/page.tsx
│       │   │   ├── blue-team/page.tsx
│       │   │   └── red-team/page.tsx
│       │   ├── components/     # Reusable components
│       │   ├── features/       # Feature modules
│       │   │   ├── ai/
│       │   │   ├── exploration/
│       │   │   └── settings/
│       │   └── data/           # Constants, types
│       ├── tests/              # Test suite
│       ├── package.json
│       ├── .env.example
│       └── tsconfig.json
│
├── docs/                       # Documentación
│   ├── ARCHITECTURE.md
│   ├── FEATURES.md
│   ├── DEVELOPMENT.md (este archivo)
│   ├── roadmap.md
│   ├── api/                    # API contracts
│   ├── architecture/           # Design docs
│   └── setup/                  # Setup guides
│
├── scripts/                    # Automation scripts
│   ├── validate-local.sh       # Full validation
│   ├── quick-start.sh          # One-step setup
│   ├── dev.sh
│   └── setup.sh
│
└── Makefile                    # Convenience commands
```

---

## ✅ Testing

### Backend Tests

```bash
# Todos los tests
cd apps/api
source .venv/bin/activate
python -m pytest

# Con verbosity
python -m pytest -v

# Archivo específico
python -m pytest tests/test_settings.py

# Función específica
python -m pytest tests/test_settings.py::test_get_settings

# Con coverage
python -m pytest --cov=app tests/
```

### Frontend Tests

```bash
# Todos los tests
npm --prefix apps/web run test

# En modo watch
npm --prefix apps/web run test -- --watch

# Con UI
npm --prefix apps/web run test -- --ui

# Coverage
npm --prefix apps/web run test -- --coverage
```

### ESLint (Frontend Linting)

```bash
# Revisar
npm --prefix apps/web run lint

# Arreglar automáticamente
npm --prefix apps/web run lint -- --fix
```

### Validación Completa

```bash
# Ejecuta todos los tests, lint y build
./scripts/validate-local.sh
```

### Escrito de Tests

**Backend (pytest):**

```python
# tests/test_example.py
import pytest
from app.services.example_service import calculate_risk

def test_calculate_risk_positive():
    """Test risk calculation with positive input."""
    result = calculate_risk(severity=8, exposure=0.5)
    assert result == 4.0

def test_calculate_risk_zero():
    """Test risk calculation with zero severity."""
    result = calculate_risk(severity=0, exposure=1.0)
    assert result == 0.0

@pytest.mark.parametrize("severity,exposure,expected", [
    (10, 1.0, 10.0),
    (5, 0.5, 2.5),
    (0, 1.0, 0.0),
])
def test_calculate_risk_parametrized(severity, exposure, expected):
    """Test risk calculation with multiple inputs."""
    result = calculate_risk(severity=severity, exposure=exposure)
    assert result == expected
```

**Frontend (vitest):**

```typescript
// src/features/example/example.test.ts
import { describe, it, expect } from 'vitest';
import { calculateRisk } from './example';

describe('calculateRisk', () => {
  it('should calculate risk correctly', () => {
    const result = calculateRisk(severity=8, exposure=0.5);
    expect(result).toBe(4.0);
  });

  it('should handle zero severity', () => {
    const result = calculateRisk(severity=0, exposure=1.0);
    expect(result).toBe(0.0);
  });
});
```

---

## 🚀 Agregando una Feature

### 1. Crear Issue o Discussion

Primero, propón la feature:
- Abre [Discussion](https://github.com/CrisRS89/cybermap/discussions)
- Describe qué quieres lograr
- Espera feedback de la comunidad

### 2. Crear Rama de Feature

```bash
git checkout -b feature/descripcion-breve
```

Convenciones de nombres:
- `feature/nmap-import-batch` — nueva feature
- `fix/duplicate-detection-bug` — bug fix
- `docs/api-contract-update` — documentación
- `refactor/storage-abstraction` — refactoring
- `test/ai-orchestrator-coverage` — tests

### 3. Escribir Tests Primero (TDD)

**Backend:**
```bash
cd apps/api
source .venv/bin/activate

# Crear test en tests/test_new_feature.py
pytest tests/test_new_feature.py

# Implementar feature en app/...
# Verificar tests pasen
pytest tests/test_new_feature.py -v
```

**Frontend:**
```bash
# Crear test en src/features/new-feature.test.ts
npm --prefix apps/web run test -- src/features/new-feature.test.ts

# Implementar feature en src/features/new-feature.ts
# Verificar tests pasen
npm --prefix apps/web run test
```

### 4. Implementar Feature

Seguir patrones existentes en el codebase.

**Backend: Agregar endpoint API**

```python
# app/routes/exploration.py
from fastapi import APIRouter, Depends
from app.schemas.exploration import AssetCreate, Asset
from app.services.exploration_service import ExplorationService

router = APIRouter(prefix="/exploration", tags=["exploration"])

@router.post("/assets", response_model=Asset)
def create_asset(
    asset: AssetCreate,
    service: ExplorationService = Depends(ExplorationService)
) -> Asset:
    """Create a new asset."""
    return service.create_asset(asset)
```

**Frontend: Agregar componente**

```typescript
// src/features/exploration/AssetCard.tsx
import { Asset } from '@/data/types';

export function AssetCard({ asset }: { asset: Asset }) {
  return (
    <div className="border rounded p-4">
      <h3 className="font-bold">{asset.name}</h3>
      <p className="text-sm text-gray-600">{asset.ipAddress}</p>
    </div>
  );
}
```

### 5. Actualizar Documentación

```bash
# Actualizar docs/FEATURES.md
# Actualizar API contracts si corresponde
# Actualizar README.md si es feature mayor
```

### 6. Validar Completo

```bash
./scripts/validate-local.sh
```

Todos los tests, lint y build deben pasar.

### 7. Commit + Push

```bash
git add .
git commit -m "feat(exploration): add batch asset import

- Implement batch asset creation endpoint
- Add deduplication logic
- Add comprehensive tests
- Update API contract documentation"

git push origin feature/descripcion-breve
```

### 8. Pull Request

Abre PR en GitHub con template proporcionado.

Incluye:
- Descripción de cambios
- Cómo testear
- Links a issues/discussions relacionadas
- Screenshots (si aplica)

---

## 🐛 Debugging

### Backend Debugging

#### Con Print Statements

```python
# app/services/example.py
def process_data(data):
    print(f"DEBUG: Received data: {data}")
    result = calculate(data)
    print(f"DEBUG: Calculated result: {result}")
    return result
```

#### Con Debugger (pdb)

```python
def process_data(data):
    import pdb; pdb.set_trace()  # Se pausará aquí
    return calculate(data)
```

Comandos:
- `n` — próxima línea
- `c` — continuar
- `p variable` — print variable
- `l` — ver código
- `q` — salir

#### Ver Logs en FastAPI

```bash
# Terminal ejecutando FastAPI
python -m uvicorn app.main:app --reload --log-level debug
```

### Frontend Debugging

#### Con Console Logs

```typescript
function processData(data: unknown) {
  console.log('DEBUG: Received data:', data);
  const result = calculate(data);
  console.log('DEBUG: Result:', result);
  return result;
}
```

#### Con DevTools de Navegador

1. Abre Developer Tools (F12)
2. Tab "Sources"
3. Click en línea para breakpoint
4. Refresca página
5. Inspecciona variables

#### Con React DevTools

Extensión útil: React DevTools (Chrome/Firefox)

```bash
# Instalar
# Chrome: https://chrome.google.com/webstore
# Firefox: https://addons.mozilla.org
```

### Debugging Full Stack

Terminal 1 - Backend:
```bash
cd apps/api && source .venv/bin/activate
python -m uvicorn app.main:app --reload --log-level debug
```

Terminal 2 - Frontend:
```bash
npm --prefix apps/web run dev
```

Terminal 3 - Tests:
```bash
npm --prefix apps/web run test -- --watch
```

---

## 🆘 Troubleshooting

### "ModuleNotFoundError: No module named 'fastapi'"

**Solución:**
```bash
cd apps/api
source .venv/bin/activate
pip install -r requirements.txt
```

### "Cannot find module '@/data/types'"

**Solución:**
```bash
npm --prefix apps/web install
```

### "Port 8000 already in use"

**Solución 1:** Encontrar y matar proceso
```bash
lsof -i :8000
kill -9 <PID>
```

**Solución 2:** Usar otro puerto
```bash
python -m uvicorn app.main:app --reload --port 8001
```

### "Port 3000 already in use"

```bash
npm --prefix apps/web run dev -- -p 3001
```

### Tests fallan con "database locked"

**Solución:** Agregar waits en tests o usar en-memory DB
```python
import time
time.sleep(0.1)
```

### ESLint errors que no entiendes

```bash
npm --prefix apps/web run lint -- --fix
```

Arregla automáticamente muchos errores.

### Build produce huge bundle

```bash
# Analizar bundle
npm --prefix apps/web run build -- --analyze
```

---

## 💡 Best Practices

### Código

✅ **Bueno:**
```python
def calculate_risk_score(asset: Asset) -> float:
    """Calculate risk score for an asset.
    
    Args:
        asset: The asset to analyze
        
    Returns:
        Risk score from 0.0 to 10.0
    """
    if not asset.is_valid():
        raise ValueError("Asset must be valid")
    return asset.severity * asset.exposure
```

❌ **Evitar:**
```python
def calc(a):
    return a * 2
```

### Commits

✅ **Bueno:**
```
feat(exploration): add batch Nmap import

- Parse XML files with batching support
- Implement duplicate detection
- Add comprehensive test coverage
- Update API documentation

Closes #123
```

❌ **Evitar:**
```
WIP
fix stuff
updated
```

### PRs

✅ **Bueno:**
- Título descriptivo
- Descripción clara
- Link a issue
- Pasos para reproducir/testear
- Screenshots (si aplica)

❌ **Evitar:**
- PR genérico sin descripción
- Cambios no relacionados mezclados
- PR > 500 líneas sin justificación

### Testing

✅ **Bueno:**
- Tests para lógica crítica
- Coverage > 70%
- Nombres descriptivos

❌ **Evitar:**
- Tests que no prueban nada
- Tests frágiles
- Sin tests en features críticas

---

## 📞 Contacto & Ayuda

- **Preguntas técnicas:** Abre [Issue](https://github.com/CrisRS89/cybermap/issues)
- **Discusiones generales:** Abre [Discussion](https://github.com/CrisRS89/cybermap/discussions)
- **Contribuir:** Lee [CONTRIBUTING.md](../CONTRIBUTING.md)

---

**¡Happy coding! 🚀**
