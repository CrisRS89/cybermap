# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-01-15

Initial distributable MVP release.

### Added

- FastAPI backend with uvicorn
- Next.js frontend with React 19 & TypeScript
- Settings UI and API with sync
- Settings validation and persistence (JSON)
- Exploration module with asset/finding management
- Nmap XML import with deduplication
- AI orchestrator (mock integration)
- Local SQLite for Exploration/AI data
- Frontend-backend sync status visualization
- Automated local validation script (`./scripts/validate-local.sh`)
- Fresh clone validation and setup guide
- Product CLI entrypoint (`./bin/cybermap`)
- Setup, dev, test and validation scripts
- Docker Compose support for zero-setup installation
- Makefile for convenience commands
- Quick-start automated setup script
- Professional README with badges and quickstart
- Contributing guide (CONTRIBUTING.md)
- Code of Conduct (CODE_OF_CONDUCT.md)
- Support guide (SUPPORT.md)
- MIT License
- Development guide (docs/DEVELOPMENT.md)
- Features documentation (docs/FEATURES.md)
- CI/CD validation workflow (GitHub Actions)
- Manual E2E validation documentation
- Repository access documentation

### Validated

- Backend: 110 pytest tests passing
- Frontend: 72 vitest tests passing, ESLint passing
- Frontend: production build successful
- Manual Settings E2E flow passes
- Manual Exploration (Nmap import) E2E flow passes
- Manual AI Analysis mock E2E flow passes
- Fresh clone validation passes
- Docker Compose validated
- `main` branch published to GitHub
- `v0.1.0` tag published to GitHub

### Limitations

This release does not include:

- Real AI provider execution (OpenAI, Claude, Gemini, etc.)
- Real MCP integration
- Real agent execution
- External connectors
- Multi-user authentication
- Production database (uses SQLite + JSON locally)
- Secret storage vault
- Docker Swarm/Kubernetes deployment
- Red Team features
- Blue Team features (beyond data storage)
- Report generation (beyond data export)
- Audit logging

### Security Notes

- No API keys or credentials in repository
- Environment variables used for configuration
- `.env` files excluded from Git
- Validation of all inputs
- CORS configured for local development only

### Installation Methods

- **Option 1:** Docker Compose (`docker compose up`)
- **Option 2:** Native setup (`./scripts/quick-start.sh`)
- **Option 3:** Manual setup (see docs/setup/fresh-clone.md)

---

## [Unreleased]

### Planned for 0.2.0

- Real AI provider integration (OpenAI, Claude, Gemini)
- Provider gateway with switching
- Token counting and cost tracking
- Rate limiting and quota management
- Improved AI orchestrator

### Planned for 0.3.0

- Agent hub with multiple agent types
- Aider, OpenCode, Cline integration
- Custom agent framework
- Sandbox execution model

### Planned for 1.0.0

- Production database (PostgreSQL)
- Multi-user authentication (OAuth, SAML)
- Role-based access control (RBAC)
- MCP server integration
- External connector marketplace
- Blue Team complete features
- Red Team complete features
- Report generation (technical + executive)
- Kubernetes deployment support
- Audit logging and compliance

---

## Release Versioning

- **0.x.y** - Pre-release (MVP development)
- **1.0.0** - First major stable release
- **x.y.z** - Semantic versioning (MAJOR.MINOR.PATCH)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute to CyberMap.
