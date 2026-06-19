# Exploration SQLite association result

## Objetivo

Validar la integridad referencial entre `Finding` y `Asset` usando SQLite.

## Fecha

2026-06-19

## Alcance

Esta validacion cubre:

- creacion de `Asset`
- creacion de `Finding` asociado a `Asset`
- rechazo de `Finding` con `assetId` inexistente
- traduccion de errores SQLite a HTTP controlado
- preservacion del contrato API usado por el frontend

## Resultado tecnico

`Finding.assetId` se persiste internamente como `exploration_findings.asset_id`.

La columna tiene una foreign key hacia:

    exploration_assets.id

Regla validada:

- si `assetId` es `null`, el finding se acepta sin asociacion
- si `assetId` existe, el finding se acepta
- si `assetId` no existe, la API devuelve `400 Bad Request`

## Error controlado

Cuando SQLite rechaza la FK con:

    FOREIGN KEY constraint failed

la API no expone el error crudo.

Respuesta esperada:

    HTTP 400

Payload:

    {
      "detail": "Associated asset does not exist"
    }

## Tests agregados

Se agregaron tests de ruta para:

| Test | Resultado esperado |
|---|---|
| Crear finding con asset existente | `200 OK` |
| Crear finding con asset inexistente | `400 Bad Request` |

## Seguridad

1. La integridad referencial queda validada en la capa de persistencia.
2. La API no expone excepciones internas de SQLite.
3. El frontend no necesita conocer detalles de la base de datos.
4. El contrato externo sigue usando `assetId` en camelCase.

## Conclusion

La relacion `Finding -> Asset` queda validada sobre SQLite.

Estado: OK.
