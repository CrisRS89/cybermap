# Diseño de servicios detectados

## Estado

Propuesta para Bloque 10 del MVP local de CyberMap.

## Objetivo

Persistir los servicios y puertos abiertos detectados durante la importación de XML de Nmap.

## Problema actual

La importación Nmap cuenta `openPortsSeen`, pero no conserva cada puerto abierto como entidad consultable.

## Entidad propuesta

Nombre técnico: `ExplorationService`.

Representa un servicio detectado sobre un asset existente.

## Relación principal

- Un asset puede tener cero o muchos servicios detectados.
- Un servicio detectado pertenece a un único asset.

## Campos propuestos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | Identificador interno. |
| `assetId` | string | Asset asociado. |
| `protocol` | string | Protocolo detectado, inicialmente `tcp` o `udp`. |
| `port` | integer | Puerto abierto detectado. |
| `name` | string/null | Nombre del servicio, por ejemplo `http` o `ssh`. |
| `product` | string/null | Producto detectado si Nmap lo informa. |
| `version` | string/null | Versión detectada si Nmap la informa. |
| `state` | string | Estado del puerto. Para MVP se persiste `open`. |
| `source` | string | Fuente del dato, inicialmente `nmap` o `manual`. |
| `createdAt` | datetime | Fecha de creación. |
| `updatedAt` | datetime | Fecha de actualización. |

## Regla de deduplicación

La clave lógica para evitar duplicados será:

```text
assetId + protocol + port
```

Si se importa dos veces el mismo XML:

- el asset se deduplica por `kind + value`;
- el servicio se deduplica por `assetId + protocol + port`;
- no se crean servicios duplicados.

## Integración con Nmap

Durante la importación:

1. Se parsean hosts y puertos abiertos.
2. Se crea o reutiliza el asset del host.
3. Por cada puerto abierto se crea o reutiliza un servicio detectado.
4. El summary reporta servicios creados y omitidos.

## Summary esperado

```json
{
  "summary": {
    "assetsCreated": 1,
    "assetsSkipped": 0,
    "servicesCreated": 2,
    "servicesSkipped": 0,
    "hostsSeen": 1,
    "openPortsSeen": 2,
    "warnings": []
  }
}
```

## Decisiones MVP

- Solo se persisten puertos abiertos.
- No se actualizan servicios existentes durante reimportación.
- No se ejecuta Nmap desde CyberMap.
- No se modelan vulnerabilidades en este bloque.
- No se modelan CPEs todavía.

## Riesgos

- Si un asset existente no se recupera correctamente, no se podrán asociar servicios.
- Si Nmap entrega datos incompletos de servicio, `name`, `product` y `version` pueden quedar en `null`.
- Si no se define índice único, pueden aparecer duplicados por importaciones repetidas.

## Veredicto

La entidad `ExplorationService` es necesaria para que Exploration deje de ser solo un inventario de assets y empiece a representar superficie de ataque observable.
