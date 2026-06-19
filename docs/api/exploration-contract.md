# Exploration API contract

## Objetivo

Definir el contrato HTTP inicial del modulo Exploration.

## Base path

    /exploration

## Endpoints previstos

### GET /exploration/assets

Lista assets registrados.

### POST /exploration/assets

Crea un asset manual.

Payload esperado:

    {
      "name": "Localhost",
      "kind": "host",
      "value": "localhost",
      "environment": "dev",
      "criticality": "medium"
    }

### GET /exploration/findings

Lista findings registrados.

### POST /exploration/findings

Crea un finding manual.

Payload esperado:

    {
      "title": "Example finding",
      "description": "Example description",
      "severity": "medium",
      "status": "open",
      "assetId": "asset_1",
      "source": "manual",
      "evidence": "",
      "recommendation": ""
    }

## Validaciones

### Asset

- name: string no vacio
- kind: enum controlado
- value: string no vacio
- environment: enum opcional
- criticality: enum opcional

### Finding

- title: string no vacio
- severity: enum controlado
- status: enum controlado
- source: enum controlado
- assetId: opcional

## Seguridad

- No aceptar campos desconocidos.
- No ejecutar comandos del sistema.
- No almacenar secretos.
- No permitir payloads arbitrarios sin validacion.
- Mantener logs sin datos sensibles.

## Fuera de alcance

- scanners reales
- conectores externos
- IA real
- subida de archivos
- autenticacion multiusuario
