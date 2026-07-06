# Validación de deduplicación Nmap XML

## Estado

Validado para MVP local.

## Objetivo

Evitar que la importación repetida de un mismo XML de Nmap cree assets duplicados en Exploration.

## Regla de deduplicación

La deduplicación se realiza por la combinación:

- `kind`
- `value`

Para hosts importados desde Nmap:

- `kind = ip`
- `value = <address del host>`

## Comportamiento esperado

Si no existe un asset con el mismo `kind + value`:

- se crea un nuevo asset;
- se incrementa `assetsCreated`.

Si ya existe un asset con el mismo `kind + value`:

- no se crea un duplicado;
- se incrementa `assetsSkipped`;
- el asset existente no se modifica.

## Componentes modificados

### Backend

- `ExplorationSQLiteRepository.find_asset_by_kind_and_value()`
- `NmapImportService`
- `NmapImportSummary`
- `POST /exploration/imports/nmap`

### Frontend

- `ImportNmapXmlSummary`
- UI de `/exploration`
- tarjeta de `Resumen de importación`

## Contrato HTTP resultante

```json
{
  "summary": {
    "assetsCreated": 1,
    "assetsSkipped": 0,
    "hostsSeen": 1,
    "openPortsSeen": 2,
    "warnings": []
  }
}
```

## Validaciones ejecutadas

- Tests de repositorio SQLite.
- Tests de importación Nmap por servicio.
- Tests HTTP de importación Nmap.
- Tests frontend del cliente de importación.
- Lint frontend.
- Build frontend Next.js.
- Validación integral con `./bin/cybermap validate`.

## Resultado

Bloque 9 validado funcionalmente:

- se importan hosts Nmap;
- se evitan duplicados por `kind + value`;
- se reportan assets creados y omitidos;
- la UI muestra `Assets creados`, `Assets omitidos`, `Hosts vistos` y `Puertos abiertos`.

## Limitaciones conocidas

- No se actualizan assets existentes durante una reimportación.
- No se deduplican servicios o puertos como entidades independientes porque todavía no existen como modelo propio.
- No se normalizan direcciones más allá del valor entregado por el parser.

## Veredicto

Bloque 9 cerrado para MVP local.
