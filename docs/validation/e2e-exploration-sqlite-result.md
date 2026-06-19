# E2E Exploration SQLite result

## Objetivo

Validar que Exploration usa SQLite como persistencia local-first sin romper el contrato HTTP existente.

## Fecha

2026-06-19

## Entorno

- Backend: FastAPI con Uvicorn
- Frontend: Next.js
- Backend URL: `http://127.0.0.1:8000`
- Base SQLite local: `apps/api/data/cybermap.db`

## Servicios

Backend:

    cd /home/kalicrs/proyectos/cybermap/apps/api
    source .venv/bin/activate
    python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

## Health check

Comando:

    curl -i http://127.0.0.1:8000/health

Resultado:

    HTTP/1.1 200 OK
    {"status":"ok"}

## Asset creado

Comando:

    curl -s -X POST http://127.0.0.1:8000/exploration/assets \
      -H "Content-Type: application/json" \
      -d '{
        "name": "SQLite Host",
        "kind": "host",
        "value": "sqlite.local",
        "environment": "dev",
        "criticality": "high"
      }' | python3 -m json.tool

Resultado observado:

    {
        "name": "SQLite Host",
        "kind": "host",
        "value": "sqlite.local",
        "environment": "dev",
        "criticality": "high",
        "id": "asset_b112e9d5ceb84c6c941a39cce9ceba84",
        "createdAt": "2026-06-19T14:48:47.910001Z",
        "updatedAt": "2026-06-19T14:48:47.910001Z"
    }

## Verificacion de lectura

Comando:

    curl -s http://127.0.0.1:8000/exploration/assets | python3 -m json.tool

Resultado observado:

    {
        "items": [
            {
                "name": "SQLite Host",
                "kind": "host",
                "value": "sqlite.local",
                "environment": "dev",
                "criticality": "high",
                "id": "asset_b112e9d5ceb84c6c941a39cce9ceba84",
                "createdAt": "2026-06-19T14:48:47.910001Z",
                "updatedAt": "2026-06-19T14:48:47.910001Z"
            }
        ]
    }

## Verificacion de archivo local

Comando:

    find apps/api/data -maxdepth 1 -type f -print 2>/dev/null || true
    git status --short --ignored apps/api/data

Resultado:

    apps/api/data/cybermap.db
    apps/api/data/settings.json
    !! apps/api/data/

## Checklist

| Prueba | Estado |
|---|---:|
| Backend inicia correctamente | OK |
| `/health` responde 200 | OK |
| `POST /exploration/assets` responde 200 | OK |
| `GET /exploration/assets` responde datos persistidos | OK |
| SQLite crea `apps/api/data/cybermap.db` | OK |
| `apps/api/data/` sigue ignorado por Git | OK |
| Contrato HTTP camelCase se mantiene | OK |

## Riesgos conocidos

1. No se hizo migracion automatica desde JSON temporal.
2. SQLite local sigue siendo monousuario.
3. Aun falta documentar estrategia de migraciones versionadas.
4. Aun falta E2E completo desde UI con SQLite.

## Conclusion

Exploration queda migrado a SQLite local-first para rutas productivas.

Estado: OK.
