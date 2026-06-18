# MVP local closure

## Objetivo

Registrar el cierre formal del bloque MVP local de CyberMap.

## Estado final

| Área | Estado |
|---|---:|
| Frontend Next.js | Aprobado |
| Backend FastAPI | Aprobado |
| Settings UI | Aprobado |
| Settings API | Aprobado |
| Settings sync frontend-backend | Aprobado |
| Persistencia JSON local | Aprobado para MVP local |
| Validación automatizada | Aprobada |
| E2E manual settings | Aprobado |
| Documentación mínima | Aprobada |

## Evidencia

| Evidencia | Archivo |
|---|---|
| Script de validación local | `scripts/validate-local.sh` |
| Contrato Settings API | `docs/api/settings-contract.md` |
| Readiness MVP local | `docs/validation/mvp-local-readiness.md` |
| Checklist E2E manual | `docs/validation/e2e-settings-manual.md` |
| Resultado E2E manual | `docs/validation/e2e-settings-result.md` |

## Validación automatizada

Comando oficial:

```bash
./scripts/validate-local.sh
```

Debe cubrir:

- tests backend FastAPI
- lint frontend Next.js
- tests frontend Vitest
- build frontend de producción

## Validación E2E manual aprobada

El flujo UI -> API -> JSON -> reinicio backend -> API fue ejecutado y aprobado.

Valores persistidos observados:

```json
{
  "theme": "Dracula",
  "background": "Puntos",
  "language": "ES",
  "aiProvider": "Gemini",
  "thinkingMode": "Balanceado",
  "agentSandboxEnabled": true,
  "auditLogsEnabled": true
}
```

## Límites explícitos

El cierre del MVP local no habilita todavía:

- IA real
- MCP real
- ejecución real de agentes
- conectores externos reales
- almacenamiento de secretos reales
- autenticación multiusuario
- base de datos productiva
- ejecución automática de comandos desde la UI

## Criterio de cierre

El bloque MVP local queda cerrado porque:

- el backend levanta localmente
- el frontend levanta localmente
- Settings sincroniza contra FastAPI
- el contrato Settings API está endurecido
- la persistencia JSON local funciona
- la validación automatizada pasa
- el E2E manual fue aprobado
- el repositorio no contiene secretos reales versionados

## Próximo bloque recomendado

Bloque 5 — instalación reproducible desde cero y primer módulo funcional real.

Orden sugerido:

1. README fresh clone.
2. Validación fresh clone o simulación limpia.
3. Diseño de persistencia futura.
4. Primer módulo Exploration/Ingesta.
