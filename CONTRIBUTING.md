# Contribuir a CyberMap

¡Gracias por tu interés en contribuir a CyberMap! Este documento explica cómo reportar bugs, sugerir features y enviar pull requests.

## 📋 Tabla de Contenidos

1. [Código de Conducta](#código-de-conducta)
2. [¿Cómo Reportar un Bug?](#cómo-reportar-un-bug)
3. [¿Cómo Sugerir una Feature?](#cómo-sugerir-una-feature)
4. [¿Cómo Enviar un PR?](#cómo-enviar-un-pr)
5. [Setup de Desarrollo](#setup-de-desarrollo)
6. [Guías de Código](#guías-de-código)
7. [Proceso de Review](#proceso-de-review)

---

## Código de Conducta

Lee [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) antes de participar. En resumen:
- Sé respetuoso
- No hagas discriminación
- Rechazamos harassment de cualquier tipo
- Reporta comportamiento inadecuado a los maintainers

---

## 🐛 Cómo Reportar un Bug

### Antes de reportar:

1. **Busca issues existentes** — tu bug podría estar ya reportado
2. **Revisa la documentación** — podría no ser un bug sino un malentendido
3. **Prueba con la última versión** — el bug podría estar ya arreglado

### Al reportar:

Usa el template de GitHub Issues y proporciona:

```markdown
## Descripción
[Descripción clara del bug]

## Pasos para reproducir
1. ...
2. ...
3. ...

## Resultado esperado
[Qué debería pasar]

## Resultado actual
[Qué pasa realmente]

## Environment
- OS: [Windows/Linux/macOS]
- Python: 3.13
- Node.js: 20
- Docker: [sí/no]

## Logs / Screenshots
[Logs, errores, screenshots si aplica]
```

### Criterios para un buen bug report:

- ✅ Título descriptivo y específico
- ✅ Pasos claros y reproducibles
- ✅ Comportamiento esperado vs actual
- ✅ Environment details (SO, versions)
- ✅ Logs/errores relevantes
- ❌ Reportes genéricos sin detalles

---

## 💡 Cómo Sugerir una Feature

### Proceso:

1. **Busca Discussions existentes** — tu idea podría estar en discusión
2. **Abre una Discussion** (no Issue) con:

```markdown
## Descripción de la Feature
[Qué quieres lograr]

## Problema que resuelve
[Qué problema soluciona]

## Solución propuesta
[Cómo lo implementarías]

## Alternativas consideradas
[Otros enfoques]

## Contexto adicional
[Screenshots, links, referencias]
```

3. **Comunidad/Maintainers discuten**
4. Si es aceptado → se crea Issue o se agrega al roadmap

### Criterios para features consideradas:

- ✅ Alineado con objetivo de CyberMap
- ✅ Aporta valor a la mayoría de usuarios
- ✅ Diseño claro (no ambiguo)
- ✅ Viable con recursos actuales
- ❌ Scope muy grande (mejor dividir)
- ❌ Fuera del objetivo del proyecto

---

## 🔧 Setup de Desarrollo

### 1. Fork + Clone

```bash
# Fork en GitHub
git clone https://github.com/TU_USER/cybermap.git
cd cybermap
git remote add upstream https://github.com/CrisRS89/cybermap.git
```

### 2. Crear rama

```bash
git fetch upstream main
git checkout -b fix/nombre-descriptivo upstream/main
# O para features:
git checkout -b feature/nombre-descriptivo upstream/main
```

**Convención de nombres:**
- `fix/description` — bug fixes
- `feature/description` — nuevas features
- `docs/description` — documentación
- `refactor/description` — refactoring
- `test/description` — tests

### 3. Setup local

Sigue [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md):

```bash
# Backend
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Frontend
npm --prefix apps/web install

# Validar
./scripts/validate-local.sh
```

### 4. Hacer cambios

Edita código, tests, docs según sea necesario.

### 5. Tests antes de push

```bash
# Backend
cd apps/api && source .venv/bin/activate
python -m pytest

# Frontend
npm --prefix apps/web run test
npm --prefix apps/web run lint

# Todo
./scripts/validate-local.sh
```

---

## 🎨 Guías de Código

### Python Backend (FastAPI)

```python
# ✅ Bueno
def calculate_risk_score(asset: Asset) -> float:
    """Calculate risk score for an asset.
    
    Args:
        asset: The asset to analyze
        
    Returns:
        Risk score from 0.0 to 10.0
        
    Raises:
        ValueError: If asset is invalid
    """
    if not asset.is_valid():
        raise ValueError("Asset must be valid")
    return asset.severity * asset.exposure
```

**Reglas:**
- PEP 8 style (auto-format con black si aplica)
- Type hints en funciones públicas
- Docstrings en módulos/clases/funciones
- Tests para lógica crítica
- No hardcode secrets

### TypeScript Frontend (React/Next.js)

```typescript
// ✅ Bueno
interface Asset {
  id: string;
  name: string;
  riskScore: number;
}

export function AssetCard({ asset }: { asset: Asset }) {
  return (
    <div className="...">
      <h2>{asset.name}</h2>
      <span>Risk: {asset.riskScore}</span>
    </div>
  );
}
```

**Reglas:**
- ESLint rules deben pasar
- TypeScript strict mode
- Componentes funcionales con hooks
- Props bien tipadas
- Tests para lógica de negocio

### Git Commits

```bash
# ✅ Bueno
git commit -m "feat: add risk score calculation for assets"
git commit -m "fix: resolve Nmap import duplicate detection"
git commit -m "docs: update architecture diagram"
git commit -m "test: add coverage for AI orchestrator"

# ❌ Evitar
git commit -m "fixes"
git commit -m "WIP"
git commit -m "updated stuff"
```

**Formato:** `type(scope): message`
- `feat` — nueva feature
- `fix` — bug fix
- `docs` — documentación
- `test` — tests
- `refactor` — refactoring
- `chore` — cambios build/deps

---

## ➡️ Cómo Enviar un PR

### 1. Push a tu fork

```bash
git push origin fix/descripcion
```

### 2. Abre PR en GitHub

Usa el template de PR:

```markdown
## Descripción
[Qué cambia y por qué]

## Tipo de cambio
- [ ] Bug fix
- [ ] Feature nueva
- [ ] Breaking change
- [ ] Documentación

## ¿Cómo fue testeado?
[Cómo validaste los cambios]

## Checklist
- [ ] Tests pasan (`./scripts/validate-local.sh`)
- [ ] Documentación actualizada
- [ ] Commits descriptivos
- [ ] Sin secretos en código
- [ ] ESLint / Black passes

## Links relacionados
Closes #123
Relates to #456
```

### 3. Responde feedback

Los maintainers podrían pedir cambios. Todos los PRs pasan por:
1. ✅ Tests automáticos (GitHub Actions)
2. ✅ Review por un maintainer
3. ✅ Cambios solicitados (si aplica)
4. ✅ Aprobación y merge

### 4. Después del merge

Tu contribución estará:
- En `main` branch
- En el siguiente release (ver [CHANGELOG.md](CHANGELOG.md))
- En los credits del proyecto

---

## 🔍 Proceso de Review

**Criterios que revisamos:**

✅ **Code Quality**
- Sigue guías de código
- Tests adecuados
- Sin duplicación

✅ **Funcionalidad**
- Resuelve el issue/feature
- Sin regressions
- Documentado

✅ **Seguridad**
- Sin hardcoded secrets
- Validación de inputs
- Error handling

✅ **Tests**
- Pasan en CI/CD
- Coverage razonable (70%+)
- Casos edge cubiertos

✅ **Documentación**
- README actualizado (si aplica)
- Docstrings claros
- Comentarios para lógica compleja

---

## 🤔 Preguntas Frecuentes

**P: ¿Cuánto tiempo tarda hacer merge a un PR?**  
R: 3-7 días típicamente. Depende de complejidad y disponibilidad de maintainers.

**P: ¿Mi PR debe tener tests?**  
R: Sí para código lógico. Docs/typos no requieren tests.

**P: ¿Puedo hacer un PR grande?**  
R: Mejor dividir en PRs pequeñas (< 400 líneas). Es más fácil revisar.

**P: ¿Qué pasa si mi PR causa conflictos?**  
R: Resuelve conflictos localmente con `git rebase upstream/main`.

**P: ¿Se pagan las contribuciones?**  
R: CyberMap es un proyecto comunitario sin presupuesto. Contribuciones son voluntarias.

---

## 💬 Canales de Comunicación

- **GitHub Issues** — bugs y features
- **GitHub Discussions** — preguntas y ideas
- **Pull Requests** — code review
- **Commits** — notas de cambios

---

**¡Gracias por contribuir a CyberMap! 🙏**

Para preguntas adicionales, abre una [Discussion](https://github.com/CrisRS89/cybermap/discussions).
