# E2E Exploration manual result

## Objetivo

Validar manualmente el vertical slice inicial de Exploration/Ingesta.

El flujo probado cubre:

- backend FastAPI
- endpoints de Exploration
- persistencia JSON temporal
- frontend Next.js
- comunicacion frontend-backend via CORS
- visualizacion de assets y findings en `/exploration`

## Fecha

2026-06-19

## Entorno

- OS: Kali portable
- Backend: FastAPI con Uvicorn
- Frontend: Next.js 16.2.9
- Backend URL: `http://127.0.0.1:8000`
- Frontend URL: `http://localhost:3000`

## Servicios levantados

Backend:

    cd /home/kalicrs/proyectos/cybermap/apps/api
    source .venv/bin/activate
    python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

Frontend:

    cd /home/kalicrs/proyectos/cybermap
    npm --prefix apps/web run dev

## Verificacion de salud

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
        "name": "Localhost",
        "kind": "host",
        "value": "localhost",
        "environment": "dev",
        "criticality": "medium"
      }' | python3 -m json.tool

Resultado observado:

    {
        "name": "Localhost",
        "kind": "host",
        "value": "localhost",
        "environment": "dev",
        "criticality": "medium",
        "id": "asset_73e057cbad2349e9af40cf764f836081",
        "createdAt": "2026-06-19T14:18:26.418070Z",
        "updatedAt": "2026-06-19T14:18:26.418070Z"
    }

## Finding creado

Comando:

    curl -s -X POST http://127.0.0.1:8000/exploration/findings \
      -H "Content-Type: application/json" \
      -d '{
        "title": "Puerto expuesto de prueba",
        "severity": "medium",
        "status": "open",
        "source": "manual",
        "evidence": "Finding creado durante E2E manual"
      }' | python3 -m json.tool

Resultado observado:

    {
        "title": "Puerto expuesto de prueba",
        "description": "",
        "severity": "medium",
        "status": "open",
        "assetId": null,
        "source": "manual",
        "evidence": "Finding creado durante E2E manual",
        "recommendation": "",
        "id": "finding_da4c8fba62c44bf49ee9d3afce9ec492",
        "createdAt": "2026-06-19T14:18:26.445572Z",
        "updatedAt": "2026-06-19T14:18:26.445572Z"
    }

## Verificacion de persistencia

Comando:

    curl -s http://127.0.0.1:8000/exploration/assets | python3 -m json.tool
    curl -s http://127.0.0.1:8000/exploration/findings | python3 -m json.tool

Resultado:

- `GET /exploration/assets` devuelve el asset `Localhost`.
- `GET /exploration/findings` devuelve el finding `Puerto expuesto de prueba`.

## Verificacion frontend

URL:

    http://localhost:3000/exploration

Resultado observado:

- La ruta `/exploration` responde 200.
- El frontend consulta `/exploration/assets`.
- El frontend consulta `/exploration/findings`.
- El backend responde 200 a requests CORS `OPTIONS`.
- Los datos creados por API quedan disponibles para la UI.

## Checklist

| Prueba | Estado |
|---|---:|
| Backend inicia correctamente | OK |
| Frontend inicia correctamente | OK |
| `/health` responde 200 | OK |
| `POST /exploration/assets` responde 200 | OK |
| `POST /exploration/findings` responde 200 | OK |
| `GET /exploration/assets` persiste datos | OK |
| `GET /exploration/findings` persiste datos | OK |
| `/exploration` responde 200 | OK |
| CORS frontend-backend | OK |

## Riesgos conocidos

1. El storage JSON temporal no tiene control de concurrencia.
2. No existe asociacion UI entre `Finding` y `Asset` todavia.
3. No hay autenticacion ni multiusuario.
4. Los datos E2E quedan en storage local si no se limpian manualmente.

## Conclusion

El vertical slice inicial de Exploration queda validado manualmente.

Estado: OK.
