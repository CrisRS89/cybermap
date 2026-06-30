# Nmap Import — Dedupe y normalización

## Estado

Diseño aprobado para implementación MVP.

## Objetivo

Evitar que la importación repetida de un mismo XML de Nmap cree assets duplicados en Exploration.

## Problema

La importación Nmap actual convierte cada host parseado en un asset nuevo.

Esto provoca duplicados cuando se importa dos o más veces el mismo XML o distintos XML que contienen el mismo host.

Ejemplo duplicado:

| kind | value |
|---|---|
| ip | 192.168.1.10 |
| ip | 192.168.1.10 |

## Regla MVP

La deduplicación se realiza por `kind + value`.

Para Nmap XML:

- `kind = ip`
- `value = address del host`

Si ya existe un asset con el mismo `kind` y `value`:

1. no se crea un asset nuevo;
2. se incrementa `assetsSkipped`;
3. no se modifica el asset existente.

Si no existe:

1. se crea el asset;
2. se incrementa `assetsCreated`.

## Decisión: no actualizar assets existentes

En el MVP no se actualizan automáticamente campos de assets ya existentes, aunque el XML nuevo traiga hostname distinto.

Campos no actualizados automáticamente:

- `name`
- `environment`
- `criticality`

Motivo:

- evita sobrescritura inesperada de datos manuales;
- reduce riesgo de regresión;
- mantiene la importación como operación conservadora.

## Summary esperado

El summary de importación se ampliará con `assetsSkipped`.

Respuesta esperada:

- `summary.assetsCreated`
- `summary.assetsSkipped`
- `summary.hostsSeen`
- `summary.openPortsSeen`
- `summary.warnings`

## Cambios previstos

### Backend

- Agregar búsqueda de asset existente por `kind + value`.
- Modificar `NmapImportService` para omitir duplicados.
- Ampliar `NmapImportSummary`.
- Ampliar schema HTTP `NmapImportSummaryResponse`.
- Actualizar tests.

### Frontend

- Ampliar tipo `ImportNmapXmlSummary`.
- Mostrar `assetsSkipped` en resumen de importación.
- Actualizar tests del cliente frontend.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Duplicados previos ya existentes | No se corrigen en esta fase |
| Diferencias de mayúsculas/minúsculas en value | Normalización futura |
| IPs con espacios | El parser ya entrega valores normalizados desde XML |
| Hostname nuevo no actualiza asset existente | Decisión explícita MVP |

## Futuro

Posibles mejoras posteriores:

- índice único por `kind + value`;
- normalización de dominios e IPs;
- modo `assetsUpdated`;
- auditoría de importaciones;
- merge manual de assets duplicados existentes.
