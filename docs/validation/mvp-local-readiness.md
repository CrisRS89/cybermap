# MVP local readiness

## Objetivo

Registrar el estado de preparación del MVP local de CyberMap antes de avanzar hacia módulos externos, IA real, MCP, agentes o conectores.

## Estado general

| Área | Estado |
|---|---:|
| Frontend Next.js | Listo para MVP local |
| Backend FastAPI | Listo para MVP local |
| Settings UI | Listo para MVP local |
| Settings API | Endurecido y documentado |
| Persistencia JSON local | Suficiente para MVP local |
| Validación automatizada | Disponible |
| Documentación base | Disponible |

## Validaciones disponibles

La validación local principal se ejecuta con:

```bash
./scripts/validate-local.sh
```

Este script cubre:

- tests backend FastAPI
- lint frontend Next.js
- tests frontend Vitest
- build frontend de producción

## Funcionalidad MVP cubierta

| Funcionalidad | Estado |
|---|---:|
| Levantar backend local | Cubierto |
| Levantar frontend local | Cubierto |
| GET /health | Cubierto |
| GET /settings | Cubierto |
| PUT /settings | Cubierto |
| Persistencia de settings en JSON local | Cubierto |
| Estado visual de sincronización frontend-backend | Cubierto |
| Validación de contrato settings en backend | Cubierto |
| Documentación del contrato settings | Cubierto |

## Controles de seguridad actuales

| Control | Estado |
|---|---:|
| No versionar secretos reales | Cubierto |
| `.env` y `.env.local` ignorados | Cubierto |
| `.env.example` sin secretos reales | Cubierto |
| API keys reales no persistidas en frontend | Documentado |
| Flags de configuración sensible sin secretos | Cubierto |
| Campos desconocidos en settings rechazados por backend | Cubierto |
| Tipos boolean/string estrictos en settings backend | Cubierto |

## No avanzar todavía a

Estas capacidades quedan explícitamente fuera del siguiente paso inmediato hasta cerrar mejor la base del MVP:

- ejecución real de agentes
- conexión real a servidores MCP
- conectores externos reales
- almacenamiento de secretos reales
- ejecución automática de comandos del sistema desde la UI
- integración con proveedores IA reales
- base de datos productiva
- autenticación multiusuario

## Pendientes técnicos recomendados

| Pendiente | Prioridad | Motivo |
|---|---:|---|
| Documentar flujo completo de ejecución local | Alta | Facilita instalación desde cero |
| Crear checklist E2E manual final | Alta | Verifica UI + API juntas |
| Evaluar separar DTO backend de storage model | Media | Reduce acoplamiento futuro |
| Definir estrategia futura de secretos | Alta | Requisito antes de IA/conectores reales |
| Definir persistencia futura SQLite/PostgreSQL | Media | JSON local es suficiente solo para MVP |

## Criterio de cierre del bloque MVP local

El bloque MVP local puede considerarse estable cuando:

- `./scripts/validate-local.sh` pasa completo
- la UI `/settings` sincroniza contra FastAPI local
- `GET /settings` devuelve los cambios persistidos
- la documentación permite clonar, configurar y validar el proyecto
- no existen secretos reales versionados
- no se ejecutan integraciones externas sin aprobación humana

## Próxima fase recomendada

Fase 4.11 — checklist E2E manual final.

Objetivo: documentar y ejecutar una prueba manual completa desde cero: backend, frontend, `/settings`, cambio de valores, sincronización visual y verificación con `GET /settings`.
