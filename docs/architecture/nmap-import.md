# Nmap XML import

## Objetivo

Definir el diseño inicial para importar resultados de Nmap XML en CyberMap.

La importacion debe convertir informacion relevante del XML en datos internos de Exploration, principalmente assets y, mas adelante, servicios y findings.

## Alcance MVP

El MVP de importacion Nmap XML incluye:

- recibir contenido XML como texto
- parsear hosts de Nmap
- extraer IPs
- extraer hostnames cuando existan
- extraer puertos abiertos
- convertir hosts en Assets
- devolver un resumen de importacion
- no ejecutar comandos del sistema

## Fuera de alcance

No incluye todavia:

- ejecucion de `nmap`
- subida de archivos desde frontend
- importacion masiva pesada
- deteccion avanzada de vulnerabilidades
- generacion automatica de findings
- correlacion historica
- deduplicacion avanzada
- normalizacion completa de servicios

## Seguridad XML

El parser debe seguir estas reglas:

1. No resolver entidades externas.
2. No permitir DTD.
3. No ejecutar comandos del sistema.
4. No descargar recursos remotos.
5. Limitar el tamano del payload.
6. Rechazar XML vacio.
7. Rechazar XML malformado con error controlado.
8. No registrar payload completo en logs.

## Limite de tamano

Limite inicial recomendado:

    1 MiB

Motivo:

- suficiente para pruebas MVP
- reduce riesgo de abuso local
- evita bloqueos por XML grande
- permite evolucion posterior con streaming si hace falta

## Modelo conceptual

### NmapImportSummary

Representa el resultado de una importacion.

| Campo | Tipo | Descripcion |
|---|---|---|
| `assetsCreated` | number | Assets creados |
| `hostsSeen` | number | Hosts observados en XML |
| `openPortsSeen` | number | Puertos abiertos observados |
| `warnings` | string[] | Advertencias no fatales |

### NmapHost

Representacion interna temporal durante parsing.

| Campo | Tipo | Descripcion |
|---|---|---|
| `address` | string | IP o direccion principal |
| `hostnames` | string[] | Hostnames detectados |
| `openPorts` | NmapPort[] | Puertos abiertos |

### NmapPort

Representacion interna temporal de puerto.

| Campo | Tipo | Descripcion |
|---|---|---|
| `port` | number | Numero de puerto |
| `protocol` | string | tcp o udp |
| `service` | string/null | Nombre de servicio si existe |

## Conversion inicial a Assets

Reglas MVP:

1. Cada host con direccion valida genera un Asset.
2. `kind` sera `ip` para direcciones IP.
3. `name` sera el primer hostname si existe; si no, la IP.
4. `value` sera la direccion.
5. `environment` sera `unknown`.
6. `criticality` sera `medium`.

Ejemplo:

Entrada Nmap:

    192.168.1.10 con hostname server.local

Asset resultante:

    name: server.local
    kind: ip
    value: 192.168.1.10
    environment: unknown
    criticality: medium

## Tratamiento de puertos

En el MVP, los puertos abiertos se cuentan en el resumen.

No se crean findings automaticamente todavia.

Razon:

- crear findings requiere politica de severidad
- no todo puerto abierto es vulnerabilidad
- se evita ruido y falsos positivos

## Flujo previsto

    XML input
        |
        v
    Nmap parser seguro
        |
        v
    NmapImportSummary + hosts normalizados
        |
        v
    Exploration repository
        |
        v
    Assets persistidos en SQLite

## Errores controlados

| Caso | Respuesta esperada |
|---|---|
| XML vacio | 400 |
| XML malformado | 400 |
| XML con DTD | 400 |
| XML mayor al limite | 413 |
| Host sin address | warning |
| Host sin puertos abiertos | valido |

## Criterio de aceptacion

La fase de importacion se considera valida cuando:

- parser tiene tests unitarios
- XML malformado se rechaza
- DTD se rechaza
- payload grande se rechaza
- hosts validos producen assets
- endpoints no rompen Exploration existente
- `./bin/cybermap validate` pasa
