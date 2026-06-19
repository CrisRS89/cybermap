# Exploration SQLite persistence

## Objetivo

Definir la persistencia SQLite local-first para el modulo Exploration/Ingesta.

Esta fase reemplaza el storage JSON temporal por una base SQLite local, manteniendo estable el contrato HTTP existente.

## Motivacion

El storage JSON temporal fue suficiente para el primer vertical slice, pero tiene limitaciones:

| Limitacion | Impacto |
|---|---|
| Sin queries filtradas | Dificulta busqueda y paginacion |
| Sin integridad referencial | `Finding.assetId` puede apuntar a assets inexistentes |
| Sin control transaccional real | Riesgo de inconsistencia |
| Escritura concurrente pobre | Riesgo de sobrescritura |
| Sin migraciones | Evolucion de schema manual |

SQLite resuelve estas limitaciones manteniendo instalacion local simple.

## Ubicacion de base local

La base SQLite vivira bajo:

    apps/api/data/cybermap.db

Este archivo no debe versionarse.

## Tablas

### exploration_assets

| Columna | Tipo | Requerido | Descripcion |
|---|---|---:|---|
| `id` | TEXT PRIMARY KEY | si | Identificador `asset_*` |
| `name` | TEXT | si | Nombre legible |
| `kind` | TEXT | si | host, ip, domain, url, service |
| `value` | TEXT | si | Valor tecnico |
| `environment` | TEXT | si | dev, staging, prod, unknown |
| `criticality` | TEXT | si | low, medium, high, critical |
| `created_at` | TEXT | si | ISO datetime UTC |
| `updated_at` | TEXT | si | ISO datetime UTC |

### exploration_findings

| Columna | Tipo | Requerido | Descripcion |
|---|---|---:|---|
| `id` | TEXT PRIMARY KEY | si | Identificador `finding_*` |
| `title` | TEXT | si | Titulo |
| `description` | TEXT | si | Descripcion |
| `severity` | TEXT | si | info, low, medium, high, critical |
| `status` | TEXT | si | open, triaged, accepted, fixed, false_positive |
| `asset_id` | TEXT NULL | no | Asset asociado |
| `source` | TEXT | si | manual, import, scanner |
| `evidence` | TEXT | si | Evidencia textual |
| `recommendation` | TEXT | si | Recomendacion |
| `created_at` | TEXT | si | ISO datetime UTC |
| `updated_at` | TEXT | si | ISO datetime UTC |

## Integridad referencial

`exploration_findings.asset_id` debe referenciar opcionalmente:

    exploration_assets.id

Regla:

- si `asset_id` es `NULL`, el finding no esta asociado
- si `asset_id` tiene valor, debe existir en `exploration_assets`

## Indices

Indices iniciales:

    CREATE INDEX idx_exploration_assets_kind ON exploration_assets(kind);
    CREATE INDEX idx_exploration_findings_severity ON exploration_findings(severity);
    CREATE INDEX idx_exploration_findings_status ON exploration_findings(status);
    CREATE INDEX idx_exploration_findings_asset_id ON exploration_findings(asset_id);

## Migracion desde JSON

Para esta fase no se requiere migracion automatica desde JSON.

Motivo:

- el proyecto sigue en MVP local
- los datos actuales son de prueba E2E
- una migracion real se implementara si aparecen datos utiles que conservar

## Compatibilidad HTTP

El contrato externo no cambia.

La API debe seguir devolviendo modelos con formato camelCase:

- `assetId`
- `createdAt`
- `updatedAt`

Internamente SQLite puede usar snake_case:

- `asset_id`
- `created_at`
- `updated_at`

## Seguridad

1. Usar queries parametrizadas.
2. No construir SQL con input directo.
3. No almacenar secretos.
4. Mantener `apps/api/data/` ignorado por Git.
5. No ejecutar comandos del sistema desde payloads.

## Rollback

Si el repositorio SQLite falla durante el desarrollo, el rollback consiste en:

1. restaurar `get_exploration_service`
2. volver a usar `ExplorationService`
3. mantener endpoints sin cambios

## Criterio de aceptacion

La migracion se considera valida cuando:

- backend tests pasan
- frontend tests pasan
- build Next pasa
- los endpoints existentes responden igual
- la UI `/exploration` sigue creando assets y findings
- los findings asociados a assets siguen funcionando
