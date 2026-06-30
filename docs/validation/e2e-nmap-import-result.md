# E2E — Importación Nmap XML

## Estado

Validado correctamente.

## Objetivo

Registrar la validación end-to-end de la importación de XML de Nmap en CyberMap.

El flujo validado permite pegar XML de Nmap desde la UI de Exploration, enviarlo al backend, parsearlo de forma segura, crear assets en SQLite y mostrar un resumen de importación en el frontend.

## Alcance validado

- UI `/exploration` con formulario para pegar XML.
- Cliente frontend `importNmapXml`.
- Endpoint backend `POST /exploration/imports/nmap`.
- Parser seguro de XML Nmap.
- Servicio `NmapImportService`.
- Persistencia de assets en SQLite.
- Resumen visible en la UI.

## Componentes involucrados

### Backend

- `apps/api/app/schemas/nmap_import.py`
- `apps/api/app/routes/exploration.py`
- `apps/api/app/services/nmap_parser.py`
- `apps/api/app/services/nmap_import_service.py`
- `apps/api/app/repositories/exploration_sqlite_repository.py`
- `apps/api/tests/test_exploration_nmap_import_routes.py`
- `apps/api/tests/test_nmap_parser.py`
- `apps/api/tests/test_nmap_import_service.py`

### Frontend

- `apps/web/src/features/exploration/exploration-imports-api.ts`
- `apps/web/src/features/exploration/exploration-imports-api.test.ts`
- `apps/web/src/app/exploration/page.tsx`

## Contrato HTTP validado

Endpoint:

- `POST /exploration/imports/nmap`

Payload:

- `{ "xml": "<nmaprun>...</nmaprun>" }`

Respuesta esperada:

- `summary.assetsCreated`
- `summary.hostsSeen`
- `summary.openPortsSeen`
- `summary.warnings`

## Casos validados

| Caso | Resultado esperado |
|---|---|
| XML válido | `200 OK` |
| XML vacío | `400 Bad Request` |
| XML malformado | `400 Bad Request` |
| XML con DTD | `400 Bad Request` |
| XML con ENTITY | `400 Bad Request` |
| XML mayor al límite permitido | `413 Payload Too Large` |
| JSON con campo extra | `422 Unprocessable Entity` |
| XML realista con múltiples hosts | Assets persistidos |
| Puertos cerrados | No cuentan como abiertos |
| Host sin hostname | Usa IP como nombre |
| Summary frontend | Visible en `/exploration` |

## Validación ejecutada

Comando:

- `./bin/cybermap validate`

Resultado:

- `== Validation completed successfully ==`

## Resultado técnico

La importación Nmap quedó integrada verticalmente:

1. El usuario puede pegar XML desde `/exploration`.
2. El frontend envía el XML mediante `importNmapXml`.
3. El backend valida y parsea el XML sin ejecutar Nmap.
4. Los hosts importables se convierten en assets.
5. Los assets se persisten en SQLite.
6. La UI refresca la lista de assets.
7. La UI muestra resumen de importación.

## Decisiones de seguridad

- CyberMap no ejecuta `nmap`.
- CyberMap no acepta rutas locales.
- CyberMap no descarga URLs.
- El XML se recibe como string JSON.
- Se rechazan DTD y ENTITY.
- Se rechaza XML malformado.
- Se aplica límite de tamaño al XML.
- No se crean findings automáticamente desde puertos abiertos.

## Limitaciones pendientes

| Limitación | Bloque futuro |
|---|---|
| No hay deduplicación de assets por `kind + value` | Bloque 9 |
| No se persisten servicios/puertos como entidad propia | Bloque 10 |
| No se generan findings asistidos | Bloque 11 |
| Límite de XML todavía no es configurable por `.env` | Bloque 13 |
| No hay autenticación/autorización | Hardening posterior |
| No hay test visual E2E con navegador | Futuro |

## Veredicto

Bloque 8 queda funcionalmente completo para MVP local.

La importación Nmap XML ya cubre backend, frontend, persistencia, errores controlados y visualización básica de resumen.
