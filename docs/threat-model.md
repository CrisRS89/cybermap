# CyberMap Threat Model

## Riesgos principales

- Exposición de API keys
- Ejecución arbitraria de comandos
- Escaneos fuera de alcance autorizado
- Prompt injection
- Fuga de datos sensibles hacia proveedores IA externos
- Modificación no autorizada de archivos
- Abuso de conectores o MCP tools

## Controles mínimos

- Secret manager
- Sandbox para agentes
- Approval humano
- Scope autorizado
- Logs de auditoría
- RBAC
- Rate limiting
- Validación de inputs
