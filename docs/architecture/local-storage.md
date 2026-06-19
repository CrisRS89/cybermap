# Local storage

## Objetivo

Documentar el storage local usado por CyberMap durante el MVP.

## Ubicacion

El backend usa datos locales bajo:

    apps/api/data/

Este directorio esta ignorado por Git porque contiene estado local de ejecucion.

## Archivos esperados

| Archivo | Proposito |
|---|---|
| `settings.json` | Persistencia local de settings |
| `exploration-assets.json` | Assets cargados en Exploration |
| `exploration-findings.json` | Findings cargados en Exploration |

## Reglas

1. No versionar archivos dentro de `apps/api/data/`.
2. No guardar secretos en archivos JSON locales.
3. No asumir concurrencia segura.
4. No usar este storage como base productiva multiusuario.
5. Mantener schemas y servicios desacoplados para facilitar migracion futura.

## Limpieza local

Para limpiar datos locales de Exploration:

    rm -f apps/api/data/exploration-assets.json
    rm -f apps/api/data/exploration-findings.json

Para limpiar settings locales:

    rm -f apps/api/data/settings.json

## Riesgos conocidos

| Riesgo | Impacto |
|---|---|
| Escritura concurrente | Puede sobrescribir datos |
| JSON corrupto | Puede romper lectura del servicio |
| Datos locales no versionados | No se comparten entre clones |
| Sin migraciones | No hay evolucion formal de schema |

## Migracion futura

El siguiente backend persistente deberia usar SQLite local-first.

Criterios para migrar:

- necesidad de relaciones entre assets y findings
- queries filtradas
- paginacion
- historial de cambios
- mayor robustez ante corrupcion de archivos
- soporte a futuras importaciones
