# CyberMap Web

Frontend de CyberMap construido con Next.js, React, TypeScript y Tailwind CSS.

## Stack

| Tecnología | Uso |
|---|---|
| Next.js 16 | Framework web |
| React 19 | UI |
| TypeScript | Tipado |
| Tailwind CSS v4 | Estilos |
| Vitest | Tests |

## Configuración

Crear archivo local:

```bash
cp .env.example .env.local
```

Variable requerida:

```env
NEXT_PUBLIC_CYBERMAP_API_URL=http://localhost:8000
```

No colocar secretos en variables NEXT_PUBLIC_*.

## Instalación

```bash
npm install
```

Desde la raíz del repo también se puede usar:

```bash
npm --prefix apps/web install
```

## Desarrollo

Desde la raíz:

```bash
npm --prefix apps/web run dev
```

Abrir:

```text
http://localhost:3000
```

Settings:

```text
http://localhost:3000/settings
```

## Validación

```bash
npm --prefix apps/web run lint
npm --prefix apps/web run test
npm --prefix apps/web run build
```

## Settings

El módulo de settings incluye:

- persistencia local en localStorage
- sincronización con FastAPI usando PUT /settings
- contrato formal en settings-contract.ts
- estado observable de sincronización
- badge visual en la UI

Estados de sincronización:

| Estado | Descripción |
|---|---|
| local | API no configurada o estado inicial local |
| syncing | Enviando cambios al backend |
| synced | Última sincronización correcta |
| error | Falló la sincronización |

## Seguridad frontend

- No guardar secretos reales en localStorage.
- No exponer API keys en variables NEXT_PUBLIC_*.
- Usar solo flags como aiApiKeyConfigured o connectorSecretConfigured.
