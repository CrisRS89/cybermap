# E2E manual settings validation

## Objetivo

Validar manualmente el flujo completo de settings entre frontend Next.js, backend FastAPI y persistencia JSON local.

## Alcance

Este checklist verifica:

- backend local levantado correctamente
- frontend local levantado correctamente
- endpoint `GET /health` operativo
- endpoint `GET /settings` operativo
- endpoint `PUT /settings` operativo desde la UI
- badge visual de sincronización
- persistencia local en JSON
- supervivencia del dato luego de reiniciar backend

## Precondiciones

| Requisito | Valor esperado |
|---|---|
| Backend URL | `http://localhost:8000` |
| Frontend URL | `http://localhost:3000` |
| Frontend env | `NEXT_PUBLIC_CYBERMAP_API_URL=http://localhost:8000` |
| Backend env | `CYBERMAP_API_DATA_DIR=data` |
| Backend venv | `apps/api/.venv` existente |

## Terminal 1 — levantar backend

Desde la raíz del repo:

```bash
cd apps/api
source .venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000
```

Resultado esperado:

```text
Uvicorn running on http://127.0.0.1:8000
```

## Terminal 2 — verificar backend

Desde la raíz del repo:

```bash
curl http://localhost:8000/health
curl http://localhost:8000/settings
```

Resultado esperado para health:

```json
{"status":"ok"}
```

Resultado esperado para settings:

```json
{"values":{}}
```

También es válido recibir settings previamente persistidos.

## Terminal 3 — levantar frontend

Desde la raíz del repo:

```bash
npm --prefix apps/web run dev
```

Resultado esperado:

```text
Local: http://localhost:3000
```

## Navegador — flujo manual

1. Abrir `http://localhost:3000/settings`.
2. Confirmar que la página carga sin error.
3. Cambiar un valor visible, por ejemplo:
   - tema
   - idioma
   - proveedor IA
   - flag de seguridad
4. Observar el badge de sincronización.
5. Confirmar transición esperada:

```text
Sincronizando -> Sincronizado
```

## Verificación por API

Luego de modificar un setting en la UI:

```bash
curl http://localhost:8000/settings
```

Resultado esperado:

- `values` contiene el cambio realizado desde la UI.
- No aparecen campos desconocidos.
- No aparecen secretos reales.

## Verificación de persistencia tras reinicio

1. Detener backend con `Ctrl+C`.
2. Levantar backend nuevamente:

```bash
cd apps/api
source .venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000
```

3. Consultar nuevamente:

```bash
curl http://localhost:8000/settings
```

Resultado esperado:

- El cambio anterior sigue presente.
- La persistencia JSON local funciona.

## Checklist

| Paso | Estado |
|---|---:|
| Backend levanta en puerto 8000 | Pendiente |
| `GET /health` responde `ok` | Pendiente |
| `GET /settings` responde `values` | Pendiente |
| Frontend levanta en puerto 3000 | Pendiente |
| `/settings` carga en navegador | Pendiente |
| Cambio en UI dispara sincronización | Pendiente |
| Badge pasa por `Sincronizando` | Pendiente |
| Badge termina en `Sincronizado` | Pendiente |
| Backend registra `PUT /settings 200` | Pendiente |
| `GET /settings` refleja el cambio | Pendiente |
| Reinicio de backend conserva settings | Pendiente |

## Criterios de aceptación

La prueba E2E manual se considera aprobada si:

- backend y frontend levantan sin errores
- la UI `/settings` permite modificar un valor
- el backend recibe `PUT /settings` con código `200`
- el badge visual finaliza en `Sincronizado`
- `GET /settings` devuelve el cambio persistido
- el valor persiste luego de reiniciar backend

## Riesgos observables

| Síntoma | Causa probable |
|---|---|
| Badge queda en `Local` | Falta `NEXT_PUBLIC_CYBERMAP_API_URL` o frontend sin API configurada |
| Badge queda en `Error de sincronización` | Backend apagado, CORS o endpoint inaccesible |
| `curl /settings` no refleja cambios | `PUT /settings` no llegó o storage apunta a otro directorio |
| Backend devuelve `422` | Payload con campo desconocido o tipo inválido |

## No cubre

Este checklist no valida:

- IA real
- MCP real
- ejecución de agentes
- conectores externos
- autenticación multiusuario
- base de datos productiva
