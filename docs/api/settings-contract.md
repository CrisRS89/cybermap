# Settings API contract

## Objetivo

Documentar el contrato HTTP actual entre el frontend Next.js y el backend FastAPI para la sincronización de settings.

## Endpoints

| Método | Ruta | Propósito |
|---|---|---|
| GET | /settings | Obtener settings persistidos |
| PUT | /settings | Persistir settings enviados por el frontend |

## GET /settings

### Respuesta esperada

```json
{
  "values": {
    "theme": "Dark Pro",
    "aiProvider": "OpenAI"
  }
}
```

### Notas

- La respuesta puede ser parcial.
- El frontend completa valores faltantes usando defaults locales.
- El backend devuelve lo persistido en storage JSON local.

## PUT /settings

### Payload esperado

```json
{
  "values": {
    "theme": "Dark Pro",
    "mcpEnabled": false
  }
}
```

### Respuesta esperada

```json
{
  "values": {
    "theme": "Dark Pro",
    "mcpEnabled": false
  }
}
```

## Modelo conceptual

El frontend usa `CyberMapSettings` como modelo completo.

El backend acepta un subconjunto parcial de esos campos mediante un DTO Pydantic formal.

## Campos string

```text
theme
background
language
aiProvider
aiModel
aiBaseUrl
thinkingMode
aiTemperature
aiMaxTokens
aiPrivacyMode
agentPreset
agentIntegrationType
agentCommand
agentWorkingDirectory
agentTimeoutSeconds
mcpServerName
mcpTransport
mcpCommand
mcpArgs
mcpUrl
mcpAllowedTools
connectorPreset
connectorBaseUrl
connectorAuthMode
connectorSyncIntervalMinutes
```

## Campos boolean

```text
aiApiKeyConfigured
agentRequiresApproval
agentSandboxEnabled
agentNetworkAccess
mcpEnabled
mcpRequiresApproval
connectorEnabled
connectorSecretConfigured
connectorIngestFindings
connectorIngestAssets
connectorRequiresApproval
requireHumanApproval
sandboxEnabled
auditLogsEnabled
```

## Validaciones backend

| Caso | Resultado |
|---|---:|
| Campo conocido con tipo correcto | 200 |
| Payload parcial válido | 200 |
| Campo desconocido | 422 |
| Boolean enviado como string | 422 |
| String enviado como boolean/number/object | 422 |

## Reglas de persistencia

- Solo se persisten campos enviados explícitamente.
- Los campos omitidos no se guardan como `null`.
- La persistencia actual usa JSON local.
- El storage actual no debe contener secretos reales.

## Seguridad

- No guardar API keys reales en settings.
- No persistir tokens, passwords ni secretos de conectores.
- Usar flags como `aiApiKeyConfigured` o `connectorSecretConfigured` para representar configuración sensible sin exponerla.
- Mantener aprobación humana y sandbox habilitados por defecto en la UI.

## Archivos relacionados

| Capa | Archivo |
|---|---|
| Frontend type | apps/web/src/features/settings/settings-types.ts |
| Frontend HTTP contract | apps/web/src/features/settings/settings-contract.ts |
| Frontend API client | apps/web/src/features/settings/settings-api.ts |
| Backend schema | apps/api/app/schemas/settings.py |
| Backend route | apps/api/app/routes/settings.py |
| Backend tests | apps/api/tests/test_settings.py |

## Estado del contrato

Contrato híbrido:

- El frontend mantiene el modelo completo.
- El backend acepta payloads parciales.
- El backend valida campos conocidos y tipos básicos.
- Los defaults completos siguen viviendo en el frontend.
