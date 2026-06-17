# CyberMap

CyberMap es una plataforma modular de ciberseguridad asistida por IA para ingestión de escaneos, análisis de superficie de ataque, priorización defensiva, generación de reportes y automatización controlada mediante agentes, MCP y conectores.

## Estado

Proyecto en fase inicial.

## Módulos previstos

- Exploration
- Blue Team
- Red Team
- AI Provider Gateway
- Agent Hub
- MCP y conectores
- Reportes
- Auditoría

## Seguridad

No almacenar API keys ni credenciales en el repositorio.
Usar variables de entorno o gestor de secretos.

## Validación MVP actual

- Frontend Next.js levanta localmente.
- Backend FastAPI levanta localmente.
- GET /health responde OK.
- GET /settings responde settings persistidos.
- PUT /settings persiste cambios desde la UI.
- La UI muestra estado de sincronización.
- Tests frontend y backend pasan.
