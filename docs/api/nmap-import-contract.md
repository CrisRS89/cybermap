# Nmap import API contract

## Objetivo

Definir el contrato HTTP inicial para importar resultados de Nmap XML.

## Endpoint previsto

    POST /exploration/imports/nmap

## Payload

El MVP acepta XML como string JSON.

    {
      "xml": "<nmaprun>...</nmaprun>"
    }

## Respuesta exitosa

    {
      "summary": {
        "assetsCreated": 1,
        "hostsSeen": 1,
        "openPortsSeen": 2,
        "warnings": []
      }
    }

## Validaciones

| Campo | Regla |
|---|---|
| `xml` | requerido |
| `xml` | string no vacio |
| `xml` | maximo 1 MiB |
| `xml` | XML bien formado |
| `xml` | sin DTD |
| `xml` | sin entidades externas |

## Codigos HTTP

| Codigo | Uso |
|---|---|
| 200 | Importacion procesada |
| 400 | XML invalido o malformado |
| 413 | Payload demasiado grande |
| 422 | Payload JSON invalido |

## Seguridad

1. El endpoint no ejecuta `nmap`.
2. El endpoint no acepta rutas de archivos locales.
3. El endpoint no descarga URLs.
4. El endpoint no resuelve entidades externas.
5. El endpoint no guarda el XML completo en logs.
6. El endpoint no genera findings automaticamente en el MVP.

## Conversion a Assets

Cada host con direccion valida crea un asset:

    {
      "name": "server.local",
      "kind": "ip",
      "value": "192.168.1.10",
      "environment": "unknown",
      "criticality": "medium"
    }

## Ejemplo minimo

Request:

    {
      "xml": "<?xml version=\"1.0\"?><nmaprun><host><status state=\"up\"/><address addr=\"192.168.1.10\" addrtype=\"ipv4\"/></host></nmaprun>"
    }

Response:

    {
      "summary": {
        "assetsCreated": 1,
        "hostsSeen": 1,
        "openPortsSeen": 0,
        "warnings": []
      }
    }

## Fuera de alcance

- subida multipart
- ejecucion de Nmap
- scheduling de scans
- findings automaticos
- deduplicacion avanzada
- autenticacion multiusuario
