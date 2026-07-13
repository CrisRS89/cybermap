# Soporte a CyberMap

¿Necesitas ayuda? Aquí encontrarás todas las formas de obtener soporte.

---

## 🆘 Tipos de Soporte

### 1️⃣ Problema Técnico / Bug

**¿Qué hacer?**
1. Busca en [Issues existentes](https://github.com/CrisRS89/cybermap/issues)
2. Lee [troubleshooting en docs/DEVELOPMENT.md](docs/DEVELOPMENT.md#troubleshooting)
3. Si no encuentras solución, [abre un Issue](https://github.com/CrisRS89/cybermap/issues/new)

**Template:**
- Descripción clara del problema
- Pasos para reproducir
- Error logs/mensajes
- Tu environment (SO, Python, Node versions)

---

### 2️⃣ Pregunta de Uso / Cómo Usar

**¿Qué hacer?**
1. Lee [documentación en docs/](docs/)
2. Lee [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
3. Busca en [Discussions](https://github.com/CrisRS89/cybermap/discussions)
4. [Abre una Discussion](https://github.com/CrisRS89/cybermap/discussions/new)

**Mejor lugar:** [Discussions](https://github.com/CrisRS89/cybermap/discussions) (no Issues)

---

### 3️⃣ Feature Request / Sugerencia

**¿Qué hacer?**
1. Lee [roadmap en docs/roadmap.md](docs/roadmap.md)
2. Busca en [Discussions](https://github.com/CrisRS89/cybermap/discussions)
3. [Abre una Discussion](https://github.com/CrisRS89/cybermap/discussions/new) con tu idea

**Mejor lugar:** [Discussions](https://github.com/CrisRS89/cybermap/discussions) (no Issues)

---

### 🔐 4️⃣ Reporte de Seguridad

**⚠️ NO abras un Issue público**

Si encontraste una vulnerabilidad de seguridad:
1. **No publiques en Issues o Discussions**
2. Envía email a: (por confirmar - contacto de seguridad)
3. Incluye:
   - Descripción de la vulnerabilidad
   - Pasos para reproducir
   - Impacto potencial
   - Sugerencias de fix (si tienes)

Responderemos en 48 horas y trabajaremos contigo en una solución.

---

## 📚 Documentación

Antes de pedir soporte, consulta:

| Tema | Archivo |
|------|---------|
| **Instalación rápida** | [README.md](README.md#-quickstart-docker) |
| **Instalación paso a paso** | [docs/setup/fresh-clone.md](docs/setup/fresh-clone.md) |
| **Solución de problemas** | [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md#troubleshooting) |
| **Guía de desarrollo** | [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) |
| **Arquitectura** | [docs/architecture.md](docs/architecture.md) |
| **Features actuales** | [docs/FEATURES.md](docs/FEATURES.md) |
| **Roadmap** | [docs/roadmap.md](docs/roadmap.md) |
| **Contratos API** | [docs/api/](docs/api/) |

---

## 🔗 Canales de Comunicación

### GitHub Issues
- **Para:** Bugs confirmados
- **Link:** [Abre un Issue](https://github.com/CrisRS89/cybermap/issues)
- **Tiempo de respuesta:** 3-7 días

### GitHub Discussions
- **Para:** Preguntas, ideas, features
- **Link:** [Abre una Discussion](https://github.com/CrisRS89/cybermap/discussions)
- **Tiempo de respuesta:** 3-7 días

### Pull Requests
- **Para:** Contribuciones, fixes
- **Link:** [Contribuir](CONTRIBUTING.md)
- **Tiempo de review:** 3-7 días

### Email (Security)
- **Para:** Vulnerabilidades
- **Confidencial:** Sí
- **Tiempo de respuesta:** 48 horas

---

## ⚡ Solución Rápida: Troubleshooting

### Backend no levanta

```bash
# Error: "No module named 'fastapi'"
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Error: "Port 8000 already in use"
# Cambiar puerto:
python -m uvicorn app.main:app --port 8001
```

### Frontend no levanta

```bash
# Error: "npm: command not found"
# Instalar Node.js desde https://nodejs.org

# Error: "Module not found"
npm --prefix apps/web install

# Error: "Port 3000 already in use"
npm --prefix apps/web run dev -- -p 3001
```

### Docker no funciona

```bash
# Error: "docker-compose: command not found"
# Usar: docker compose (sin guion)
docker compose up

# Error: "Cannot connect to Docker daemon"
# Docker no está corriendo. Inicia el servicio.

# Ver logs
docker compose logs -f
```

### Validación falla

```bash
# Correr validación
./scripts/validate-local.sh

# Si falla pytest
cd apps/api
source .venv/bin/activate
python -m pytest -v

# Si falla ESLint
npm --prefix apps/web run lint -- --fix
```

**¿Sigue sin funcionar?** Abre un [Issue](https://github.com/CrisRS89/cybermap/issues) con los logs.

---

## 💡 Tips para Obtener Mejor Soporte

✅ **Proporciona contexto:**
- Qué versión de CyberMap (tag/release)
- Qué SO, versiones de Python/Node
- Logs completos de error
- Pasos exactos para reproducir

✅ **Sé específico:**
- "No funciona" → menos útil
- "Al importar Nmap, error 'ValueError: invalid XML'" → más útil

✅ **Busca primero:**
- Issues y Discussions existentes
- Documentación
- Guías de troubleshooting

❌ **Evita:**
- Pedir en Issues lo que es una pregunta (usa Discussions)
- Reporting bugs sin logs
- Reportar seguridad en Issues públicos

---

## 🤝 Comunidad

CyberMap es un proyecto comunitario. Todos podemos ayudar:

- **Usa CyberMap**: da feedback
- **Reporta bugs**: abre Issues
- **Sugiere features**: abre Discussions
- **Contribuye código**: envía PRs
- **Mejora docs**: edita documentación
- **Ayuda otros**: responde en Discussions

---

## 📞 Contacto Rápido

| Necesidad | Canal | Respuesta |
|-----------|-------|-----------|
| Bug técnico | [Issues](https://github.com/CrisRS89/cybermap/issues) | 3-7 días |
| Pregunta | [Discussions](https://github.com/CrisRS89/cybermap/discussions) | 3-7 días |
| Feature idea | [Discussions](https://github.com/CrisRS89/cybermap/discussions) | 3-7 días |
| Seguridad | Email (privado) | 48 horas |
| Contribuir | [PR](CONTRIBUTING.md) | 3-7 días |

---

**¡No dudes en pedir ayuda!** La comunidad de CyberMap está aquí para apoyar. 🚀
