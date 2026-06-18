# CyberMap

CyberMap es una plataforma modular de ciberseguridad asistida por IA para ingestión de escaneos, análisis de superficie de ataque, priorización defensiva, generación de reportes y automatización controlada mediante agentes, MCP y conectores.

## Estado

Proyecto en fase inicial.

## Módulos previstos

- Exploration
- Blue Team
- Red Team
- AI Provider Gateway
- Agent Hub
- MCP y conectores
- Reportes
- Auditoría

## Seguridad

No almacenar API keys ni credenciales en el repositorio.
Usar variables de entorno o gestor de secretos.

## Validación MVP actual

- Frontend Next.js levanta localmente.
- Backend FastAPI levanta localmente.
- GET /health responde OK.
- GET /settings responde settings persistidos.
- PUT /settings persiste cambios desde la UI.
- La UI muestra estado de sincronización.
- Tests frontend y backend pasan.

## Validación local automatizada

El repositorio incluye un script para ejecutar la validación técnica principal del MVP local.

```bash
./scripts/validate-local.sh
```

Este script ejecuta:

- tests del backend FastAPI usando `apps/api/.venv/bin/python`
- lint del frontend Next.js
- tests del frontend con Vitest
- build de producción del frontend

### Precondición

Antes de ejecutarlo, el entorno virtual del backend debe existir y tener dependencias instaladas:

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Uso recomendado

Ejecutar antes de cada commit funcional o de documentación relevante:

```bash
./scripts/validate-local.sh
```

## Cierre MVP local

El bloque MVP local está cerrado y documentado en:

- `docs/validation/mvp-local-closure.md`
- `docs/validation/mvp-local-readiness.md`
- `docs/validation/e2e-settings-result.md`

Validación principal:

```bash
./scripts/validate-local.sh
```

## Instalación desde cero

Guía recomendada para instalar CyberMap desde un clon limpio:

- `docs/setup/fresh-clone.md`

Validación principal:

    ./scripts/validate-local.sh

## Acceso al repositorio

Guia para clonar CyberMap como repositorio publico o privado:

- `docs/setup/repository-access.md`

Flujo recomendado para usuarios:

    git clone https://github.com/CrisRS89/cybermap.git
    cd cybermap
    ./bin/cybermap install
    ./bin/cybermap dev
