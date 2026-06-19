# SQLite migrations

## Objetivo

Documentar la estrategia de migraciones SQLite usada por CyberMap.

## Contexto

CyberMap usa SQLite como persistencia local-first para datos del MVP.

La primera migracion versionada se aplica desde:

    apps/api/app/storage/sqlite_migrations.py

## Tabla de control

Las migraciones aplicadas se registran en:

    schema_migrations

Schema:

    version TEXT PRIMARY KEY
    applied_at TEXT NOT NULL

## Convencion de nombres

Cada migracion debe usar el formato:

    NNN_descripcion_corta

Ejemplos:

    001_exploration_initial
    002_add_asset_tags
    003_add_scan_imports

Reglas:

1. El numero debe ser incremental.
2. La descripcion debe ser estable y clara.
3. No reutilizar versiones.
4. No modificar migraciones ya aplicadas en instalaciones reales.

## Idempotencia

Las migraciones deben poder ejecutarse multiples veces sin romper la base.

Reglas recomendadas:

- usar `CREATE TABLE IF NOT EXISTS`
- usar `CREATE INDEX IF NOT EXISTS`
- registrar version solo una vez en `schema_migrations`
- validar con tests que ejecutar dos veces no duplica registros

## Como agregar una migracion

1. Crear una constante SQL nueva en `sqlite_migrations.py`.
2. Crear una constante de version nueva.
3. Agregar la tupla `(version, sql)` al final de `MIGRATIONS`.
4. Agregar tests que verifiquen:
   - schema creado
   - migracion registrada
   - idempotencia
5. Ejecutar:

    ./bin/cybermap validate

## Rollback MVP

En el MVP no hay rollback automatico.

Opciones manuales:

| Caso | Accion |
|---|---|
| Datos descartables | borrar `apps/api/data/cybermap.db` |
| Error de schema local | borrar DB y regenerar |
| Datos utiles | exportar antes de borrar |

Comando de limpieza local:

    rm -f apps/api/data/cybermap.db

## Riesgos

| Riesgo | Mitigacion |
|---|---|
| Modificar migracion ya aplicada | crear migracion nueva |
| Cambiar columnas sin plan | documentar y testear upgrade |
| Perder datos locales | backup manual antes de borrar DB |
| Romper contrato API | mantener schemas Pydantic estables |
| SQL dinamico inseguro | usar SQL interno controlado y queries parametrizadas |

## Estado actual

Migracion existente:

    001_exploration_initial

Crea:

- `schema_migrations`
- `exploration_assets`
- `exploration_findings`
- indices iniciales para assets y findings

## Criterio de aceptacion

Una nueva migracion queda aceptada si:

- los tests backend pasan
- la migracion queda registrada una sola vez
- el schema resultante es verificable
- `./bin/cybermap validate` pasa
- no se rompe el contrato HTTP existente
