# CyberMap API

Backend local de CyberMap construido con FastAPI.

## Stack

| Tecnología | Uso |
|---|---|
| FastAPI | API HTTP |
| Uvicorn | Servidor ASGI |
| Pytest | Tests |
| JSON local | Persistencia inicial |

## Configuración

Crear archivo local si necesitás sobreescribir valores:

```bash
cp .env.example .env
```

Variables disponibles:

```env
CYBERMAP_API_APP_NAME=CyberMap API
CYBERMAP_API_ENVIRONMENT=local
CYBERMAP_API_CORS_ORIGINS=http://localhost:3000
CYBERMAP_API_DATA_DIR=data
```

No guardar secretos reales en archivos versionados.

## Instalación

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Desarrollo

```bash
cd apps/api
source .venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000
```

API local:

```text
http://localhost:8000
```

## Endpoints actuales

| Método | Ruta | Descripción |
|---|---|---|
| GET | /health | Estado básico de API |
| GET | /settings | Lee settings persistidos |
| PUT | /settings | Persiste settings enviados por frontend |

## Validación manual

Con el servidor activo:

```bash
curl http://localhost:8000/health
curl http://localhost:8000/settings
```

Resultado esperado para health:

```json
{"status":"ok"}
```

## Tests

Desde raíz:

```bash
source apps/api/.venv/bin/activate
python -m pytest apps/api
```

Desde apps/api:

```bash
source .venv/bin/activate
python -m pytest
```

## Persistencia

La persistencia inicial usa JSON local en:

```text
apps/api/data/settings.json
```

Este mecanismo es suficiente para el MVP local. En fases posteriores puede migrarse a SQLite o a una base de datos relacional.

## Seguridad backend

- No guardar secretos reales en JSON local.
- Validar inputs antes de persistir.
- Mantener CORS restringido al frontend local durante desarrollo.
- Evitar ejecutar agentes, conectores o herramientas externas sin aprobación humana.
