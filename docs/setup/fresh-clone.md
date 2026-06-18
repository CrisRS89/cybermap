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

## Instalacion desde cero

### 1. Clonar repositorio

    git clone https://github.com/CrisRS89/cybermap.git cybermap
    cd cybermap

### 2. Configurar backend

    cd apps/api
    python -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    cd ../../

### 3. Configurar frontend

    npm --prefix apps/web install

### 4. Configurar variables de entorno

Backend:

    cp apps/api/.env.example apps/api/.env

Frontend:

    cp apps/web/.env.example apps/web/.env.local

### 5. Validar proyecto

    ./scripts/validate-local.sh

La validacion ejecuta:

- tests backend FastAPI
- lint frontend
- tests frontend Vitest
- build frontend de produccion

## Ejecutar servicios

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

## Validacion manual minima

1. Abrir /settings.
2. Cambiar un setting visible.
3. Confirmar estado sincronizado en UI.
4. Consultar backend:

    curl -s http://localhost:8000/settings | python -m json.tool

5. Reiniciar backend.
6. Consultar nuevamente /settings.
7. Confirmar que el valor persiste.

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
