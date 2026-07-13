# CyberMap — Handoff Técnico Completo

**Fecha de corte:** 2026-07-08  
**Proyecto:** CyberMap  
**Repositorio local:** `/home/kalicrs/proyectos/cybermap`  
**Branch principal:** `main`  
**Último commit confirmado:** `3aab66c chore(git): ignore local nmap scan outputs`  
**Estado conocido pendiente:** `?? proxies.txt` no trackeado, no debe commitearse salvo decisión explícita.

---

## 1. Objetivo del proyecto

CyberMap es una plataforma web de ciberseguridad orientada a exploración, inventario técnico, análisis asistido con IA y trazabilidad de hallazgos.

El objetivo funcional actual es construir una plataforma local que permita:

1. Registrar activos de exploración.
2. Registrar hallazgos iniciales.
3. Importar resultados de escaneo Nmap en formato XML.
4. Persistir hosts y servicios detectados.
5. Ejecutar análisis IA sobre la superficie detectada.
6. Guardar historial de ejecuciones IA.
7. Mostrar recomendaciones de análisis.
8. Preparar una arquitectura extensible para agentes, conectores, proveedores IA y automatización futura.

La visión posterior es que CyberMap evolucione hacia una plataforma con agentes capaces de asistir y eventualmente automatizar tareas de reconocimiento, análisis, documentación y priorización, pero siempre con controles de autorización, trazabilidad y seguridad.

---

## 2. Stack técnico actual

| Capa | Tecnología |
|---|---|
| Monorepo | Estructura `apps/api`, `apps/web`, `docs` |
| Backend | FastAPI, Python 3.13 |
| Frontend | Next.js 16.2.9, React 19, TypeScript |
| Estilos | Tailwind CSS v4 |
| Base de datos local | SQLite |
| Tests backend | Pytest |
| Tests frontend | Vitest |
| Lint frontend | ESLint |
| Build frontend | Next.js Turbopack |
| Control de versiones | Git + GitHub |

---

## 3. Estructura relevante del repositorio

```text
cybermap/
├── apps/
│   ├── api/
│   │   ├── app/
│   │   │   ├── ai/
│   │   │   │   ├── agents/
│   │   │   │   ├── providers/
│   │   │   │   └── orchestrator.py
│   │   │   ├── repositories/
│   │   │   │   ├── ai_runs_sqlite_repository.py
│   │   │   │   └── exploration_sqlite_repository.py
│   │   │   ├── routes/
│   │   │   │   ├── ai.py
│   │   │   │   └── exploration.py
│   │   │   ├── schemas/
│   │   │   │   ├── ai.py
│   │   │   │   ├── ai_run.py
│   │   │   │   └── exploration.py
│   │   │   ├── services/
│   │   │   │   ├── nmap_import_service.py
│   │   │   │   └── nmap_parser.py
│   │   │   ├── storage/
│   │   │   │   └── sqlite_migrations.py
│   │   │   └── main.py
│   │   └── tests/
│   │       ├── test_ai_routes.py
│   │       ├── test_ai_orchestrator.py
│   │       ├── test_ai_runs_sqlite_repository.py
│   │       ├── test_exploration_nmap_import_routes.py
│   │       ├── test_exploration_routes.py
│   │       ├── test_exploration_sqlite_repository.py
│   │       ├── test_nmap_import_service.py
│   │       └── test_nmap_parser.py
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   │   ├── exploration/
│       │   │   │   └── page.tsx
│       │   │   ├── blue-team/
│       │   │   ├── red-team/
│       │   │   └── settings/
│       │   └── features/
│       │       ├── ai/
│       │       │   ├── ai-api.ts
│       │       │   ├── ai-api.test.ts
│       │       │   └── ai-types.ts
│       │       ├── exploration/
│       │       └── settings/
├── bin/
│   └── cybermap
├── docs/
└── .gitignore
```

---

## 4. Estado funcional actual

### 4.1 Exploration

La página `/exploration` permite actualmente:

1. Cargar assets.
2. Cargar findings.
3. Listar assets.
4. Listar findings.
5. Listar servicios detectados.
6. Importar XML de Nmap pegando texto en un textarea.
7. Ver resumen de importación.
8. Ver advertencias de importación.
9. Ejecutar análisis IA sobre assets, services y findings.
10. Ver resultado del análisis IA.
11. Ver historial de ejecuciones IA.
12. Usar presets de comandos Nmap.
13. Generar comandos Nmap asistidos.
14. Copiar comandos Nmap al portapapeles.

### 4.2 Backend Exploration

Endpoints relevantes:

```text
GET  /health
GET  /exploration/assets
POST /exploration/assets
GET  /exploration/findings
POST /exploration/findings
GET  /exploration/services
POST /exploration/imports/nmap
```

### 4.3 Backend IA

Endpoints relevantes:

```text
POST /ai/runs
GET  /ai/runs
```

`POST /ai/runs` ejecuta el agente mock `exploration_analyst` y persiste la ejecución.

`GET /ai/runs` devuelve historial persistido de ejecuciones IA.

---

## 5. Importación Nmap: estado actual y limitación importante

### 5.1 Lo que funciona

CyberMap ya puede importar XML real de Nmap cuando el contenido XML se envía como texto en el payload JSON:

```json
{
  "xml": "<?xml version=\"1.0\" ... <nmaprun>...</nmaprun>"
}
```

Validación manual confirmada:

```text
POST /exploration/imports/nmap HTTP/1.1 200 OK
```

Ejemplo de respuesta real confirmada:

```json
{
  "summary": {
    "assetsCreated": 1,
    "assetsSkipped": 0,
    "servicesCreated": 0,
    "servicesSkipped": 0,
    "hostsSeen": 1,
    "openPortsSeen": 0,
    "warnings": []
  }
}
```

También se validó XML mínimo con puerto abierto:

```json
{
  "summary": {
    "assetsCreated": 0,
    "assetsSkipped": 1,
    "servicesCreated": 1,
    "servicesSkipped": 0,
    "hostsSeen": 1,
    "openPortsSeen": 1,
    "warnings": []
  }
}
```

### 5.2 Lo que todavía NO funciona

**Todavía no existe importación directa de archivos `.xml` desde la UI.**

Actualmente el usuario debe:

1. Generar XML con Nmap.
2. Abrir el archivo XML.
3. Copiar su contenido.
4. Pegarlo manualmente en el textarea de CyberMap.
5. Presionar `Importar XML Nmap`.

Lo que falta es agregar un input real de archivo:

```tsx
<input type="file" accept=".xml,text/xml,application/xml" />
```

y leer el contenido con `FileReader` o `file.text()` para poblar automáticamente el textarea o importar directamente.

### 5.3 Corrección reciente importante

Se corrigió el parser para aceptar XML reales de Nmap con:

```xml
<!DOCTYPE nmaprun>
```

y también:

```xml
<!DOCTYPE nmaprun SYSTEM "https://nmap.org/schemas/nmap.dtd">
```

La lógica mantiene controles de seguridad:

1. Rechaza `<!ENTITY ...>`.
2. Rechaza DTD no soportados.
3. Rechaza subsets internos.
4. Remueve el `DOCTYPE nmaprun` permitido antes de parsear.
5. Evita resolución externa.

---

## 6. Comandos Nmap actuales en UI

La UI ya contiene:

1. Presets estáticos de comandos.
2. Generador asistido.
3. Botón copiar comando.

Perfiles existentes:

| Perfil | Comando generado |
|---|---|
| Básico | `nmap -oX scan.xml target` |
| Medio | `nmap -sV -O -oX scan.xml target` |
| Completo | `nmap -sV -O -A --version-all -oX scan.xml target` |
| Rápido | `nmap -F -sV -oX scan.xml target` |
| Puertos concretos | `nmap -sV -p ports -oX scan.xml target` |

Recomendación para pruebas locales útiles:

```bash
nmap -sV -p 3000,8000 -oX scan-real.xml 127.0.0.1
```

Motivo: detecta los servicios dev típicos del proyecto:

| Servicio | Puerto |
|---|---:|
| Next.js dev | 3000 |
| FastAPI/Uvicorn | 8000 |

---

## 7. IA actual

### 7.1 Orquestador

Existe un orquestador IA interno:

```text
apps/api/app/ai/orchestrator.py
```

Actualmente soporta:

```text
provider: mock
agent: exploration_analyst
```

### 7.2 Agente `exploration_analyst`

El agente analiza evidencia de Exploration:

1. Assets.
2. Servicios.
3. Findings.

Genera recomendaciones mock, por ejemplo:

1. Revisar exposición HTTP/HTTPS.
2. Validar endurecimiento de SSH.
3. Completar inventario de superficie cuando no hay servicios relevantes.

### 7.3 Persistencia de ejecuciones IA

La tabla `ai_runs` persiste:

```text
id
agent_id
provider_id
model
task
status
summary
recommendations_json
evidence_used_json
created_at
updated_at
```

La UI muestra historial IA en `/exploration`.

---

## 8. Commits recientes relevantes

```text
3aab66c chore(git): ignore local nmap scan outputs
af11515 fix(nmap): accept real xml exports and improve command profiles
e3ea975 feat(web): copy assisted nmap command
977c8a2 feat(web): add assisted nmap command generator
b3f53f2 feat(web): show nmap xml command presets
287c199 feat(web): show ai run history in exploration
6c07efb feat(web): add ai run history client
acb3895 feat(api): list ai run history
2968ac9 feat(api): persist ai run executions
92e15b6 feat(api): add ai runs repository
0d5ea68 feat(api): add ai runs migration
d41ba8f feat(web): run ai analysis from exploration
999b2e3 feat(web): add ai run api client
8f4f81b feat(api): add ai run endpoint
acd98dc feat(api): add ai run schemas
8909da8 feat(api): add ai orchestrator mock agent
39470a3 fix(api): make sqlite migrations idempotent
```

---

## 9. Validación actual confirmada

Última validación completa antes del handoff:

```text
Backend: 110 passed
Frontend test files: 14 passed
Frontend tests: 65 passed
Frontend lint: OK
Frontend build: OK
Validation: completed successfully
```

Comando de validación global:

```bash
./bin/cybermap validate
```

---

## 10. Comandos de ejecución local

### 10.1 Backend

```bash
cd /home/kalicrs/proyectos/cybermap
source apps/api/.venv/bin/activate

uvicorn app.main:app \
  --app-dir apps/api \
  --reload \
  --host 0.0.0.0 \
  --port 8000
```

Backend esperado:

```text
http://localhost:8000
```

### 10.2 Frontend

```bash
cd /home/kalicrs/proyectos/cybermap
npm --prefix apps/web run dev
```

Frontend esperado:

```text
http://localhost:3000
```

### 10.3 Validación

```bash
cd /home/kalicrs/proyectos/cybermap
./bin/cybermap validate
```

---

## 11. Problemas pendientes prioritarios

### P0 — Importación directa de archivos XML desde UI

**Problema:** CyberMap importa XML pegado como texto, pero todavía no permite seleccionar un archivo `.xml` desde el navegador.

**Objetivo:** agregar carga de archivo XML en `/exploration`.

#### Requisitos funcionales

1. Agregar input de archivo en el bloque `Importar XML de Nmap`.
2. Aceptar extensiones y MIME:
   - `.xml`
   - `text/xml`
   - `application/xml`
3. Leer archivo local con `await file.text()`.
4. Validar tamaño antes de leer o antes de setear estado.
5. Poblar el textarea con el XML leído o importar directamente.
6. Mostrar nombre del archivo cargado.
7. Mostrar error si:
   - no es XML;
   - está vacío;
   - supera tamaño permitido;
   - falla la lectura.
8. Mantener el flujo manual pegando XML.

#### Recomendación de UX

Agregar en UI:

```text
Seleccionar archivo XML
```

Y debajo:

```text
También podés pegar manualmente el contenido XML en el textarea.
```

#### Implementación sugerida frontend

Archivo:

```text
apps/web/src/app/exploration/page.tsx
```

Estados sugeridos:

```ts
const [selectedNmapFileName, setSelectedNmapFileName] = useState<string | null>(null);
const [nmapFileError, setNmapFileError] = useState<string | null>(null);
const [isReadingNmapFile, setIsReadingNmapFile] = useState(false);
```

Constante sugerida:

```ts
const MAX_NMAP_XML_FILE_BYTES = 1024 * 1024 * 5;
```

Handler sugerido:

```ts
async function handleNmapXmlFileChange(event: ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];

  setNmapFileError(null);
  setSelectedNmapFileName(null);
  setNmapImportSummary(null);

  if (!file) {
    return;
  }

  if (!file.name.toLowerCase().endsWith(".xml")) {
    setNmapFileError("Seleccioná un archivo .xml generado por Nmap.");
    return;
  }

  if (file.size > MAX_NMAP_XML_FILE_BYTES) {
    setNmapFileError("El XML supera el tamaño máximo permitido.");
    return;
  }

  setIsReadingNmapFile(true);

  try {
    const content = await file.text();

    if (!content.trim()) {
      setNmapFileError("El archivo XML está vacío.");
      return;
    }

    setNmapXml(content);
    setSelectedNmapFileName(file.name);
  } catch {
    setNmapFileError("No se pudo leer el archivo XML.");
  } finally {
    setIsReadingNmapFile(false);
  }
}
```

Import necesario:

```ts
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
```

#### Tests recomendados

Actualmente la página no tiene test de interacción. Se puede avanzar primero con validación manual, pero lo ideal es separar lógica de archivo en una función testeable.

Sugerencia:

Crear:

```text
apps/web/src/features/exploration/nmap-file.ts
apps/web/src/features/exploration/nmap-file.test.ts
```

Funciones:

```ts
export function isAcceptedNmapXmlFile(file: Pick<File, "name" | "size" | "type">): boolean
export function validateNmapXmlFile(file: Pick<File, "name" | "size" | "type">): string | null
```

---

### P1 — Mejorar feedback cuando `openPortsSeen = 0`

**Problema:** si Nmap detecta host pero ningún puerto abierto, CyberMap importa el asset, pero puede parecer que falló porque no crea servicios.

**Estado actual:** esto no es error. Ejemplo real:

```json
{
  "assetsCreated": 1,
  "servicesCreated": 0,
  "hostsSeen": 1,
  "openPortsSeen": 0
}
```

**Mejora UX recomendada:** mostrar nota cuando `hostsSeen > 0 && openPortsSeen === 0`:

```text
El XML fue importado correctamente, pero Nmap no detectó puertos abiertos. Por eso no se crearon servicios.
```

Archivo probable:

```text
apps/web/src/app/exploration/page.tsx
```

---

### P1 — Crear findings desde recomendaciones IA

**Problema:** las recomendaciones IA se muestran como texto, pero todavía no se pueden convertir en findings persistidos.

**Objetivo:** cada recomendación con `suggestedFinding = true` debería tener botón:

```text
Crear finding
```

#### Flujo esperado

```text
Análisis IA genera recomendación
  ↓
Usuario revisa recomendación
  ↓
Click Crear finding
  ↓
CyberMap crea ExplorationFinding
  ↓
Finding aparece en listado
```

#### Consideraciones

1. No crear findings automáticamente sin confirmación.
2. El usuario debe mantener control humano.
3. El finding debe registrar evidencia mínima.
4. La severidad debe mapear desde la recomendación.
5. El título debe venir de la recomendación.

Archivo probable:

```text
apps/web/src/app/exploration/page.tsx
```

Cliente existente:

```ts
createExplorationFinding(...)
```

---

### P2 — Separar componentes grandes de `/exploration/page.tsx`

**Problema:** `page.tsx` está creciendo demasiado.

Se recomienda dividir en componentes:

```text
apps/web/src/features/exploration/components/
├── ExplorationHeader.tsx
├── NmapImportPanel.tsx
├── NmapCommandGenerator.tsx
├── NmapImportSummary.tsx
├── AiAnalysisPanel.tsx
├── AiRunHistoryPanel.tsx
├── AssetForm.tsx
├── FindingForm.tsx
├── AssetsTable.tsx
├── ServicesTable.tsx
└── FindingsList.tsx
```

Esto facilitaría tests y mantenimiento.

---

### P2 — Generar comando Nmap desde módulo testeable

Actualmente `buildNmapCommand()` vive en `page.tsx`.

Recomendación:

```text
apps/web/src/features/exploration/nmap-command-builder.ts
apps/web/src/features/exploration/nmap-command-builder.test.ts
```

Casos a testear:

1. básico;
2. medio;
3. completo;
4. rápido;
5. puertos concretos;
6. target vacío;
7. output vacío;
8. puertos vacíos en perfil custom.

---

### P2 — Mejorar seguridad del generador de comandos

Como el usuario copia comandos a una terminal, el generador debería validar caracteres peligrosos.

Riesgo actual: si el usuario escribe en target:

```bash
127.0.0.1; rm -rf /
```

CyberMap solo genera texto, no ejecuta, pero igual debería evitar producir comandos peligrosos.

Recomendación:

1. Validar target con allowlist básica.
2. Validar output filename.
3. Validar puertos con regex.
4. Mostrar error si hay caracteres de shell peligrosos.

Caracteres a rechazar en primera versión:

```text
; & | ` $ > < \n \r
```

---

### P3 — Agentes reales y proveedores IA

Actualmente solo existe provider mock.

Roadmap:

1. Definir interfaz final de provider.
2. Agregar configuración por variables de entorno.
3. Implementar provider OpenAI.
4. Implementar provider Gemini.
5. Implementar provider Claude/OpenRouter si corresponde.
6. Implementar provider local Ollama.
7. Registrar modelo usado en `ai_runs`.
8. Registrar costo/tokens si el provider lo devuelve.

Variables sugeridas:

```env
OPENAI_API_KEY=
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
OPENROUTER_API_KEY=
OLLAMA_BASE_URL=http://localhost:11434
```

Nunca hardcodear secretos.

---

### P3 — Ejecución controlada de Nmap desde agente local

Todavía no debe implementarse sin diseño de seguridad.

Si se avanza, debe ser una fase separada:

```text
Nmap Execution Agent
```

Controles obligatorios:

1. Scope explícito.
2. Confirmación humana.
3. Allowlist de targets.
4. Timeout.
5. Logging de comando.
6. Sin shell libre.
7. Usar `subprocess.run([...], shell=False)`.
8. Guardar XML en directorio controlado.
9. Importar automáticamente solo si el proceso termina bien.
10. Registrar auditoría.

---

## 12. Próximo bloque recomendado

### Bloque 14.1 — Importar XML desde archivo en UI

Este debería ser el próximo bloque prioritario.

#### Objetivo

Agregar soporte para seleccionar archivos `.xml` desde `/exploration`.

#### Alcance

Solo frontend:

```text
apps/web/src/app/exploration/page.tsx
```

Opcional con módulo testeable:

```text
apps/web/src/features/exploration/nmap-file.ts
apps/web/src/features/exploration/nmap-file.test.ts
```

#### Validación esperada

```bash
npm --prefix apps/web run lint
npm --prefix apps/web run build
npm --prefix apps/web test
./bin/cybermap validate
```

#### Criterio de aceptación

1. El usuario puede seleccionar `scan-real.xml`.
2. El contenido se carga en el textarea.
3. El usuario puede presionar `Importar XML Nmap`.
4. Backend responde `200 OK`.
5. El resumen aparece en UI.
6. Si el archivo no es XML, muestra error.
7. Si el archivo está vacío, muestra error.
8. Si el archivo supera el límite, muestra error.

---

## 13. Comandos útiles para el próximo agente

### Ver estado Git

```bash
cd /home/kalicrs/proyectos/cybermap
git status --short
git log --oneline --decorate -16
```

### Validar todo

```bash
./bin/cybermap validate
```

### Backend focalizado Nmap

```bash
source apps/api/.venv/bin/activate
pytest apps/api/tests/test_nmap_parser.py -q
pytest apps/api/tests/test_exploration_nmap_import_routes.py -q
```

### Frontend focalizado

```bash
npm --prefix apps/web run lint
npm --prefix apps/web run build
npm --prefix apps/web test
```

### Generar XML real útil

```bash
nmap -sV -p 3000,8000 -oX scan-real.xml 127.0.0.1
```

### Importar XML por curl

```bash
python - <<'PY'
import json
from pathlib import Path

xml = Path("scan-real.xml").read_text(encoding="utf-8", errors="replace")
Path("/tmp/cybermap-nmap-payload.json").write_text(
    json.dumps({"xml": xml}),
    encoding="utf-8",
)
PY

curl -s -i \
  -X POST http://localhost:8000/exploration/imports/nmap \
  -H "Content-Type: application/json" \
  --data-binary @/tmp/cybermap-nmap-payload.json
```

---

## 14. Riesgos y decisiones de seguridad

### 14.1 XML

Riesgos:

1. XXE.
2. DTD malicioso.
3. XML demasiado grande.
4. XML truncado.
5. Carga accidental de archivos no relacionados.

Controles actuales:

1. Rechazo de `<!ENTITY>`.
2. Solo se permite `DOCTYPE nmaprun` simple o `SYSTEM`.
3. Se remueve DOCTYPE permitido antes de parsear.
4. Límite de tamaño backend actual: revisar `MAX_NMAP_XML_BYTES` en `nmap_parser.py`.

### 14.2 Nmap

CyberMap no ejecuta Nmap actualmente. Esta decisión es intencional.

Motivo:

1. Evita escaneos no autorizados.
2. Reduce riesgo legal.
3. Mantiene control humano.
4. Evita ejecución de procesos desde la app.

### 14.3 Agentes IA

Actualmente mock. No hay llamadas reales a providers externos.

Cuando se agreguen providers reales:

1. Usar variables de entorno.
2. No guardar prompts con secretos.
3. Auditar contexto enviado.
4. Permitir seleccionar provider/model.
5. Registrar ejecución.

---

## 15. Resumen ejecutivo para el próximo agente

CyberMap ya tiene una base funcional full-stack con FastAPI, SQLite y Next.js. El módulo Exploration puede gestionar assets/findings/services, importar XML de Nmap pegado como texto, ejecutar análisis IA mock, persistir historial y mostrarlo en UI. Se corrigió el parser para aceptar XML reales de Nmap con `DOCTYPE nmaprun`, manteniendo controles contra entidades y DTD no soportados. La UI incluye presets, generador asistido y copia de comandos Nmap.

El problema principal pendiente es que el usuario todavía no puede importar directamente un archivo `.xml`; debe copiar y pegar el contenido. El próximo paso prioritario es implementar carga de archivo XML en la UI, con validaciones de extensión, MIME, tamaño, lectura y errores. Después conviene mejorar feedback cuando el XML no tiene puertos abiertos, permitir crear findings desde recomendaciones IA, y refactorizar `/exploration/page.tsx` en componentes más pequeños.

---

## 16. Orden recomendado de trabajo

1. **Bloque 14.1:** importar XML desde archivo en UI.
2. **Bloque 14.2:** feedback UX para `openPortsSeen = 0`.
3. **Bloque 14.3:** crear findings desde recomendaciones IA.
4. **Bloque 14.4:** separar componentes de `/exploration/page.tsx`.
5. **Bloque 14.5:** extraer `buildNmapCommand()` a módulo testeable.
6. **Bloque 14.6:** validar seguridad del generador de comandos.
7. **Bloque 15:** integrar providers IA reales.
8. **Bloque 16:** diseñar agente de ejecución Nmap controlada, solo con confirmación humana y allowlist.

