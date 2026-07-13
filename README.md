# CyberMap 🗺️

[![Build Status](https://github.com/CrisRS89/cybermap/actions/workflows/validate.yml/badge.svg?branch=main)](https://github.com/CrisRS89/cybermap/actions)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/CrisRS89/cybermap/releases/tag/v0.1.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.13+](https://img.shields.io/badge/Python-3.13%2B-3776ab.svg)](https://www.python.org/)
[![Node.js 20+](https://img.shields.io/badge/Node.js-20%2B-339933.svg)](https://nodejs.org/)

> **Una plataforma web modular de ciberseguridad asistida por IA para exploración, análisis y automatización.**

## ¿Qué es CyberMap?

CyberMap es una plataforma **local-first** y **self-hosted** diseñada para equipos de ciberseguridad que necesitan:

- 🔍 **Exploración**: Importar escaneos (Nmap, Nuclei) y visualizar activos
- 🛡️ **Análisis IA**: Priorizar vulnerabilidades con asistencia de IA
- 📊 **Inteligencia**: Generar reportes y mapear rutas de ataque
- 🔗 **Extensibilidad**: Integrar agentes, MCP, conectores y proveedores IA
- 🔐 **Seguridad**: Control total de datos, sin cloud innecesario

**Versión actual (0.1.0):** MVP local completo con Settings, Exploration (Nmap import) y análisis IA mock.

---

## 🚀 Quickstart (Docker)

La forma más rápida de empezar es con Docker Compose:

```bash
# 1. Clonar repositorio
git clone https://github.com/CrisRS89/cybermap.git
cd cybermap

# 2. Levantar servicios (backend + frontend)
docker compose up

# 3. Abrir navegador
# Frontend: http://localhost:3000
# API: http://localhost:8000/health
```

**¿Sin Docker?** Ver [instalación nativa](#instalación-nativa) abajo.

---

## ✨ Capacidades Actuales

| Feature | Status | Documentación |
|---------|--------|---|
| Settings UI & API | ✅ Completo | [API Contract](docs/api/settings-contract.md) |
| Exploration: Nmap Import | ✅ Completo | [Guía](docs/api/exploration-contract.md) |
| Exploration: Visualización activos | ✅ Completo | [UI Guide](docs/features.md) |
| AI Analysis (mock) | ✅ Completo | [Orchestrator](docs/architecture/ai-gateway.md) |
| Sync frontend-backend | ✅ Completo | [E2E Tests](apps/api/tests/) |
| Persistencia JSON/SQLite | ✅ Funcional | [Storage](docs/architecture/local-storage.md) |
| Validación automatizada | ✅ Funcional | [CI/CD](.github/workflows/validate.yml) |
| **Docker Compose** | ✅ Nuevo | Recién agregado |

**Próximas fases:** AI real (OpenAI, Claude, Gemini), agentes, MCP, conectores, Blue/Red Team.

---

## 📋 Requisitos

| Herramienta | Mínimo | Recomendado |
|---|---|---|
| **Python** | 3.13+ | 3.13+ |
| **Node.js** | 20+ | 20+ LTS |
| **Git** | 2.0+ | 2.40+ |
| **Docker** (opcional) | 20.10+ | 25+ |
| **RAM** | 2 GB | 4+ GB |
| **Disco** | 500 MB | 2+ GB |

---

## 🔧 Instalación Nativa

Si no usas Docker:

```bash
# 1. Clonar
git clone https://github.com/CrisRS89/cybermap.git && cd cybermap

# 2. Backend (Python)
cd apps/api
python -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 3. Frontend (Node.js) — en otra terminal desde raíz
npm --prefix apps/web install

# 4. Configurar variables de entorno
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 5. Validar
./scripts/validate-local.sh

# 6. Ejecutar (en dos terminales)
# Terminal 1: Backend
cd apps/api && source .venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
npm --prefix apps/web run dev
```

Abre **http://localhost:3000** en tu navegador.

---

## 🎯 Comandos Útiles

```bash
# Desarrollo rápido (ambos servicios con make)
make setup      # Setup inicial
make dev        # Dev mode
make test       # Ejecutar tests
make validate   # Validación completa

# Docker
docker compose up       # Levantar servicios
docker compose down     # Bajar servicios
docker compose logs -f  # Ver logs en tiempo real

# Backend manual
cd apps/api
source .venv/bin/activate
python -m uvicorn app.main:app --reload

# Frontend manual
npm --prefix apps/web run dev
```

---

## 📚 Documentación

| Tema | Archivo |
|------|---------|
| **Instalación** | [docs/setup/fresh-clone.md](docs/setup/fresh-clone.md) |
| **Arquitectura** | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| **Features** | [docs/FEATURES.md](docs/FEATURES.md) |
| **Desarrollo** | [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) |
| **Roadmap** | [docs/roadmap.md](docs/roadmap.md) |
| **Contribuir** | [CONTRIBUTING.md](CONTRIBUTING.md) |
| **Seguridad** | [docs/threat-model.md](docs/threat-model.md) |

---

## 🛣️ Roadmap

**Fase Actual (MVP Local):** ✅ Completa
- Frontend Next.js
- Backend FastAPI
- Settings sync
- Exploration (Nmap import)
- AI mock integration

**Fase 1 (AI Real):** 🔜 En 2-3 sprints
- OpenAI, Claude, Gemini integration
- Provider gateway
- Token/cost tracking

**Fase 2 (Agentes):** 🔜 Posterior
- Agent hub (Aider, OpenCode, Cline)
- MCP servers
- Sandbox execution

**Fase 3 (Blue/Red Team):** 🔜 Posterior
- Priorización de vulns
- Reportes técnicos
- Rutas de ataque

Ver [roadmap completo](docs/roadmap.md).

---

## 🐛 Problemas / Soporte

- **Bug reportado:** Abre un [Issue](https://github.com/CrisRS89/cybermap/issues)
- **Pregunta general:** Usa [Discussions](https://github.com/CrisRS89/cybermap/discussions)
- **Security:** No publicar en Issues. Lee [SECURITY.md](SECURITY.md)
- **Setup help:** Ver [troubleshooting](docs/DEVELOPMENT.md#troubleshooting)

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Lee [CONTRIBUTING.md](CONTRIBUTING.md) para:
- Reportar bugs
- Sugerir features
- Enviar PRs
- Guía de código

---

## 📄 Licencia

CyberMap está licenciado bajo **[MIT License](LICENSE)**.
Eres libre de usar, modificar y distribuir este software.

---

## 👋 Comunidad

- **GitHub:** [CrisRS89/cybermap](https://github.com/CrisRS89/cybermap)
- **Issues:** [Reporta aquí](https://github.com/CrisRS89/cybermap/issues)
- **Discussions:** [Pregunta aquí](https://github.com/CrisRS89/cybermap/discussions)
- **Roadmap:** [Ver planes](docs/roadmap.md)

---

**¿Preguntas?** Abre una [discusión](https://github.com/CrisRS89/cybermap/discussions) o un [issue](https://github.com/CrisRS89/cybermap/issues).

**¿Encontraste un bug?** [Reporta aquí](https://github.com/CrisRS89/cybermap/issues/new).

    git clone https://github.com/CrisRS89/cybermap.git
    cd cybermap
    ./bin/cybermap install
    ./bin/cybermap dev
