# Exploration domain

## Objetivo

Definir el dominio inicial del modulo Exploration/Ingesta de CyberMap.

Este modulo representa activos, hallazgos y futuras importaciones de herramientas externas.

## Alcance MVP

Incluye:

- modelado de activos
- modelado de findings
- storage local futuro
- API CRUD minima
- UI de tabla/listado

No incluye todavia:

- escaneo real
- explotacion
- conectores externos
- IA real
- normalizacion avanzada
- correlacion automatica

## Entidades

### Asset

| Campo | Tipo | Requerido | Descripcion |
|---|---|---:|---|
| id | string | si | Identificador unico |
| name | string | si | Nombre legible |
| kind | string | si | host, ip, domain, url, service |
| value | string | si | Valor tecnico principal |
| environment | string | no | dev, staging, prod, unknown |
| criticality | string | no | low, medium, high, critical |
| createdAt | string | si | ISO datetime |
| updatedAt | string | si | ISO datetime |

### Finding

| Campo | Tipo | Requerido | Descripcion |
|---|---|---:|---|
| id | string | si | Identificador unico |
| title | string | si | Titulo del hallazgo |
| description | string | no | Descripcion tecnica |
| severity | string | si | info, low, medium, high, critical |
| status | string | si | open, triaged, accepted, fixed, false_positive |
| assetId | string | no | Asset asociado |
| source | string | si | manual, import, scanner |
| evidence | string | no | Evidencia textual |
| recommendation | string | no | Recomendacion inicial |
| createdAt | string | si | ISO datetime |
| updatedAt | string | si | ISO datetime |

### ScanImport

| Campo | Tipo | Requerido | Descripcion |
|---|---|---:|---|
| id | string | si | Identificador unico |
| source | string | si | nmap, nuclei, manual, other |
| filename | string | no | Nombre del archivo importado |
| status | string | si | pending, processed, failed |
| summary | string | no | Resumen de procesamiento |
| createdAt | string | si | ISO datetime |

## Reglas de dominio

1. Todo Finding debe tener title, severity, status y source.
2. severity debe usar valores controlados.
3. status debe usar valores controlados.
4. assetId es opcional para permitir findings manuales sin asset todavia.
5. Ningun campo debe contener secretos.
6. La ejecucion de scanners reales queda fuera del MVP de Exploration.
7. La importacion inicial debe ser segura: texto/JSON local, sin ejecucion de comandos.

## Arquitectura prevista

    apps/web Exploration UI
            |
            v
    apps/api exploration routes
            |
            v
    exploration service
            |
            v
    repository/storage
            |
            v
    SQLite local-first

## Siguiente implementacion

1. Crear schemas Pydantic para Asset y Finding.
2. Crear servicio backend de Exploration.
3. Usar storage JSON temporal o SQLite inicial.
4. Exponer endpoints MVP.
5. Crear tests backend.
