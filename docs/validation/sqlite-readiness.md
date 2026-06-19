# SQLite readiness

## Objetivo

Certificar el estado de readiness de la persistencia SQLite local-first en CyberMap.

## Fecha

2026-06-19

## Alcance

Este documento cubre la migracion de Exploration/Ingesta desde storage JSON temporal hacia SQLite.

Incluye:

- repositorio SQLite
- rutas FastAPI usando SQLite
- migraciones versionadas
- integridad referencial `Finding -> Asset`
- validacion E2E
- compatibilidad con frontend existente

## Estado general

| Area | Estado |
|---|---:|
| SQLite como persistencia activa | OK |
| DB local en `apps/api/data/cybermap.db` | OK |
| Directorio `apps/api/data/` ignorado por Git | OK |
| Rutas `/exploration/*` usando SQLite | OK |
| Contrato HTTP preservado | OK |
| Frontend sin cambios requeridos | OK |
| Tests backend | OK |
| Tests frontend | OK |
| Build frontend | OK |

## Componentes implementados

| Componente | Archivo |
|---|---|
| Repositorio SQLite | `apps/api/app/repositories/exploration_sqlite_repository.py` |
| Migraciones SQLite | `apps/api/app/storage/sqlite_migrations.py` |
| Tests de repositorio | `apps/api/tests/test_exploration_sqlite_repository.py` |
| Tests de migraciones | `apps/api/tests/test_sqlite_migrations.py` |
| Rutas Exploration | `apps/api/app/routes/exploration.py` |

## Migraciones

Tabla de control:

    schema_migrations

Migracion inicial:

    001_exploration_initial

La migracion inicial crea:

- `exploration_assets`
- `exploration_findings`
- indices iniciales
- foreign key opcional `exploration_findings.asset_id -> exploration_assets.id`

## Integridad referencial

Reglas validadas:

| Caso | Resultado |
|---|---:|
| Finding sin `assetId` | OK |
| Finding con `assetId` existente | OK |
| Finding con `assetId` inexistente | HTTP 400 |
| Error SQLite crudo expuesto | No |

Respuesta esperada para asset inexistente:

    {
      "detail": "Associated asset does not exist"
    }

## Reinitialization

Se valido que una base existente puede reabrirse sin perder datos.

Tambien se valido que las migraciones no duplican registros en:

    schema_migrations

## Compatibilidad API

El contrato externo se mantiene en camelCase:

| API | SQLite |
|---|---|
| `assetId` | `asset_id` |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |

## Validaciones ejecutadas

Comando principal:

    ./bin/cybermap validate

Cobertura esperada:

- backend tests
- frontend lint
- frontend tests
- frontend build

## Riesgos pendientes

| Riesgo | Estado |
|---|---|
| Rollback automatico de migraciones | Pendiente |
| Migraciones destructivas | Pendiente |
| Backup/export de DB local | Pendiente |
| Paginacion y filtros | Pendiente |
| Multiusuario | Fuera de alcance MVP |
| Concurrencia avanzada | Fuera de alcance MVP |

## Criterio de cierre

Bloque 7 se considera listo si:

1. SQLite es usado por las rutas productivas de Exploration.
2. La DB local se crea bajo `apps/api/data/cybermap.db`.
3. `apps/api/data/` no se versiona.
4. Las migraciones son idempotentes.
5. `Finding.assetId` se valida con FK real.
6. La API devuelve errores controlados.
7. `./bin/cybermap validate` pasa.

## Conclusion

La persistencia SQLite local-first de Exploration queda lista para el siguiente bloque funcional.

Estado: OK.
