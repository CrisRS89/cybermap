# Fresh clone setup

## Objetivo

Documentar como instalar CyberMap desde cero en un entorno local limpio.

Esta guia cubre el MVP local actual:

- Frontend Next.js
- Backend FastAPI
- Settings UI
- Settings API
- Sync frontend-backend
- Persistencia JSON local
- Validacion automatizada

## Requisitos

| Herramienta | Uso |
|---|---|
| Git | Clonar repositorio |
| Node.js + npm | Frontend Next.js |
| Python 3.13+ | Backend FastAPI |
| Bash | Scripts locales |

**Opcional (para Docker):**
- Docker 20.10+
- Docker Compose

## Instalacion desde cero

### Opción 1: Docker Compose (Recomendado - más rápido)

**Ventajas:** Setup en ~2 minutos, sin instalar dependencias locales

```bash
# 1. Clonar repositorio
git clone https://github.com/CrisRS89/cybermap.git cybermap
cd cybermap

# 2. Levantar servicios
docker compose up

# 3. Abrir en navegador
# Frontend: http://localhost:3000
# API: http://localhost:8000/health
```

Eso es todo. Los servicios se actualizarán automáticamente si cambias el código.

**Parar servicios:**
```bash
docker compose down
```

**Ver logs:**
```bash
docker compose logs -f
```

#### Fallback Linux/Kali con firewalld

Si Docker levanta pero falla al publicar puertos con errores de iptables como
`No chain/target/match by that name` o `ZONE_CONFLICT`, podés usar el override
local con `network_mode: host`:

```bash
docker compose -f docker-compose.yml -f docker-compose.local-host.yml up -d
```

Abrir:

- Frontend: http://localhost:3000
- Backend: http://localhost:8000/health

Este modo evita DNAT/port publishing y es útil para entornos Linux donde
firewalld o NetworkManager interfiere con las cadenas Docker de iptables.

---

### Opción 2: Instalación Nativa (Control total)

#### 1. Clonar repositorio

    git clone https://github.com/CrisRS89/cybermap.git cybermap
    cd cybermap

#### 2. Configurar backend

    cd apps/api
    python -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    cd ../../

#### 3. Configurar frontend

    npm --prefix apps/web install

#### 4. Configurar variables de entorno

Backend:

    cp apps/api/.env.example apps/api/.env

Frontend:

    cp apps/web/.env.example apps/web/.env.local

#### 5. Validar proyecto

    ./scripts/validate-local.sh

La validacion ejecuta:

- tests backend FastAPI
- lint frontend
- tests frontend Vitest
- build frontend de produccion

## Ejecutar servicios (Nativa)

### Backend

    cd apps/api
    source .venv/bin/activate
    python -m uvicorn app.main:app --reload --port 8000

Verificar:

    curl http://localhost:8000/health
    curl http://localhost:8000/settings

### Frontend

    npm --prefix apps/web run dev

Abrir:

    http://localhost:3000
    http://localhost:3000/settings

## Usando Makefile (Convenience)

Si prefieres comandos cortos, usa el Makefile:

```bash
# Setup inicial (instala todo)
make setup

# Dev mode (levanta backend + frontend)
make dev

# Tests
make test

# Validación completa
make validate

# Docker
make docker-up
make docker-down
make docker-logs

# Ver todos los comandos
make help
```

## Validacion manual minima

1. Abrir /settings.
2. Cambiar un setting visible.
3. Confirmar estado sincronizado en UI.
4. Consultar backend:

    curl -s http://localhost:8000/settings | python -m json.tool

5. Reiniciar backend.
6. Consultar nuevamente /settings.
7. Confirmar que el valor persiste.

## Troubleshooting

### Backend no levanta

**Error: "ModuleNotFoundError: No module named 'fastapi'"**
```bash
cd apps/api
source .venv/bin/activate
pip install -r requirements.txt
```

**Error: "Address already in use"**
```bash
# Cambiar puerto
python -m uvicorn app.main:app --reload --port 8001
```

### Frontend no levanta

**Error: "npm: command not found"**
- Instalar Node.js desde https://nodejs.org

**Error: "Cannot find module"**
```bash
npm --prefix apps/web install
```

**Error: "Port 3000 already in use"**
```bash
npm --prefix apps/web run dev -- -p 3001
```

### Docker no funciona

**Error: "docker: command not found"**
- Instalar Docker desde https://docker.com

**Error: "Cannot connect to Docker daemon"**
- Iniciar el servicio Docker

**Ver logs del error:**
```bash
docker compose logs
```

### Tests fallan

**Backend tests:**
```bash
cd apps/api
source .venv/bin/activate
python -m pytest -v
```

**Frontend tests:**
```bash
npm --prefix apps/web run test
```

## Siguientes pasos

Una vez funcionando CyberMap:

1. Lee [docs/architecture.md](../architecture.md) para entender la estructura
2. Lee [docs/FEATURES.md](../FEATURES.md) para ver capacidades actuales
3. Lee [docs/roadmap.md](../roadmap.md) para ver el futuro del proyecto
4. Lee [docs/DEVELOPMENT.md](../DEVELOPMENT.md) para desarrollar features
5. Lee [CONTRIBUTING.md](../../CONTRIBUTING.md) si quieres contribuir

## Resultado esperado

| Area | Resultado esperado |
|---|---:|
| Backend /health | status ok |
| Backend /settings | JSON con values |
| Frontend /settings | Carga correctamente |
| Sync UI -> API | PUT /settings 200 OK |
| Persistencia | Valores sobreviven reinicio backend |
| Validacion automatica | Pasa completa |

## Problemas comunes

### Backend no encuentra dependencias

Ejecutar:

    cd apps/api
    source .venv/bin/activate
    pip install -r requirements.txt

### validate-local.sh no encuentra Python del backend

Ejecutar:

    cd apps/api
    python -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    cd ../../

### Frontend falla por dependencias ausentes

Ejecutar:

    npm --prefix apps/web install

### No usar reparacion automatica forzada de npm

No ejecutar:

    npm audit fix --force

Motivo:

- puede degradar versiones criticas
- puede romper compatibilidad Next.js / React
- debe analizarse manualmente

## Limites del fresh clone actual

Esta instalacion no configura todavia:

- IA real
- MCP real
- agentes reales
- conectores externos
- secretos reales
- autenticacion multiusuario
- base de datos productiva

## Criterio de aceptacion

La instalacion fresh clone se considera correcta si:

1. ./scripts/validate-local.sh pasa completo.
2. Backend responde /health.
3. Frontend carga /settings.
4. Un cambio desde UI persiste en /settings.
5. El repo no requiere secretos reales para operar el MVP local.
