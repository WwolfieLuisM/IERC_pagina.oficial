# Fase 3: CMS → HTML (boletines/sermones → marcadores estáticos) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El contenido de boletines y sermones vive en registros del CMS (`content/boletines/`, `content/sermones/`) y un generador lo compila a los 4 bloques marcados de los HTML existentes, con validación de esquema y la regeneración obligatoria en CI como puerta de fusión.

**Architecture:** Extender `scripts/build-cms-content.mjs` (validación multi-colección + render por marcadores `<!-- IERC:BEGIN/END -->`), añadir dos colecciones a `.pages.yml`, migrar el contenido actual a registros `published` y ampliar el workflow de CI para que todo PR regenere y verifique `git diff --exit-code -- '*.html'`; después el check pasa a ser obligatorio en la protección de `master`. Cero cambios de diseño: el render reproduce el marcado actual byte a byte.

**Tech Stack:** Node 22 ESM (sin dependencias nuevas), YAML frontmatter plano (parser propio), GitHub Pages + GitHub Actions, GitHub CLI (`gh`) para PRs.

**Spec:** `docs/diseno-fase3-integracion.md` (diseño aprobado — el plan argumenta desde él; el implementador lo lee).

## Global Constraints

- Español; `<html lang="es">` intacto en todo. **Cero datos inventados**: cada registro es reflejo literal de lo ya publicado en vivo (boletín N° 142 y 6 filas de sermones actuales); nada nuevo se da por oficial (la oficialidad la decide la congregación, pendiente en README).
- **Marcadores EXACTOS**, una sección por nombre: `<!-- IERC:BEGIN <sección> -->` / `<!-- IERC:END <sección> -->` con `<sección>` ∈ {`boletin-body` (ierc-boletin.html, INCLUYE la cabecera «Edición N° … · fecha · temporada»), `sermon-filas` (ierc-sermones.html), `sermon-tira`, `boletin-tarjeta` (ierc-index.html)}. Dentro de cada bloque, una línea de advertencia («generado — no editar a mano»). **Solo el generador escribe entre marcadores.** Los chips de año se quedan FUERA de los marcadores (mantenimiento manual, documentado en `integracion-cms-estatica.md`).
- Archivos modificables: `.pages.yml`, `docs/esquema-contenidos.md`, `scripts/build-cms-content.mjs`, `scripts/test-cms-content.mjs`, `.github/workflows/cms-static-pipeline.yml`, `ierc-boletin.html`, `ierc-sermones.html`, `ierc-index.html`, y docs de cierre (`fases-implementacion-cms.md`, `README.md`, `integracion-cms-estatica.md`). Archivos NUEVOS: solo `content/boletines/*.md` y `content/sermones/*.md`. **INTACTOS**: `ierc-sermon.html`, `index.html` (raíz), la colección piloto `content/cms-pilot/` y su contenido ficticio, `preview/cms-content.json` (solo lo genera el piloto).
- **Campos exactos.** Comunes (ambas colecciones): `title`, `slug`, `status`, `summary`, `updatedAt`, `reviewNotes`. Boletines: `editionDate` (ISO `yyyy-mm-dd`, requerido), `editionNumber` (entero ≥ 1, requerido), `season` (opcional, texto), `attachmentUrl` (opcional, URL), `body` (HTML literal **en el cuerpo del .md**, después del frontmatter; inyectado tal cual). Sermones: `sermonDate` (ISO, requerido), `topic` (opcional; si está, ∈ conjunto cerrado = exactamente los valores de `data-tema` hoy en `ierc-sermones.html` — el implementador los extrae y los lista en `esquema-contenidos.md` y en el generador), `durationMinutes` (opcional, entero → renderiza «N min»), `preacher`, `scriptureReference`, `audioUrl` (opcionales), `body` (opcional, HTML literal en el cuerpo del .md).
- `status`: solo `published` genera HTML. `reviewNotes` **nunca** aparece en HTML (ni en el JSON de preview, ya garantizado).
- `slug` minúsculas/guiones (mismo `slugPattern` actual) y `filename === slug + ".md"`; slugs únicos **globalmente** entre las 3 colecciones.
- Entorno: **una sola env `CMS_ROOT`** (default = raíz del repo); se eliminan `CMS_CONTENT_DIR`/`CMS_OUTPUT_FILE` y el harness de tests se migra. Rutas relativas a `CMS_ROOT`: `content/cms-pilot|boletines|sermones`, `preview/cms-content.json`, y los 3 HTML.
- Idempotencia: `node scripts/build-cms-content.mjs` dos veces seguidas deja `git diff --exit-code -- '*.html'` limpio. En CI el diff **excluye** `preview/cms-content.json` (lleva `generatedAt` con timestamp).
- CRLF: el parser normaliza BOM/CRLF al leer; el renderer **preserva el fin de línea del archivo** que reescribe (detecta si el HTML usa `\r\n`).
- Sin rediseño: el render emite exactamente las clases, atributos y `data-*` del marcado actual (el JS de buscador/chips y el scroll-spy no se tocan).
- **Todo cambio en el repo va por PR** (gate activo en `master`: PR obligatorio, `enforce_admins=true`, approvals=0). Edición de HTML/MD **solo con la herramienta edit** (lección mojibake: nunca Get/Set-Content de PowerShell).
- CI: workflow `name: CMS static content pipeline`; el **job name exacto** — y future `required_status_checks.context` — es `Validate CMS records and build preview data`.

## Review Focus

1. **Regeneración real idéntica**: tras T3+T4, regenerar sobre el repo deja los 3 HTML byte-idénticos salvo las líneas de marcadores → paso final de T4 (`git diff --exit-code -- '*.html'`) + step de diff en el CI de T5.
2. **Borradores fuera de producción**: un registro `draft` o `reviewNotes` jamás llega a un HTML → test de T4 («draft deja el HTML byte-idéntico» y «reviewNotes ausente en el HTML») + check de CI existente.
3. **Sección sin publicados**: se queda intacta y avisa (no genera sección vacía ni borra contenido) → test de T4 («cero publicados ⇒ HTML intacto + aviso»).
4. **CRLF/idempotencia Windows**: el renderer conserva `\r\n` y una segunda corrida no cambia nada → tests de T4 (fixture CRLF + doble corrida con diff vacío).
5. **Puerta real de CI**: un PR con registro inválido no es fusionable → verificación de T5: abrir PR roto a propósito, comprobar que `gh pr merge` sale rechazado por el check, cerrarlo.

---

### Task 1: Colecciones `boletines` y `sermones` en `.pages.yml` + esquema documentado

**Files:**
- Modify: `.pages.yml` (añadir las dos colecciones junto a la piloto)
- Modify: `docs/esquema-contenidos.md` (tabla de campos por colección, idéntica a Global Constraints)

**Interfaces:**
- Consumes: diseño `docs/diseno-fase3-integracion.md` §colecciones/campos (autoridad).
- Produce: nombres de colección `boletines` (dir `content/boletines/`) y `sermones` (dir `content/sermones/`), `filename: "{slug}.md"`, `format: yaml-frontmatter`, campos y tipos exactos — Task 2 los consume tal cual.

- [ ] **Step 1: Añadir las colecciones a `.pages.yml`**

Siguiendo la forma de la colección piloto existente (mismas claves: `name`, `directory`, `filename`, `format`, `fields`), añadir:

```yaml
  boletines:
    directory: content/boletines
    filename: "{slug}.md"
    format: yaml-frontmatter
    fields:
      - { name: title, label: Título, type: text, required: true }
      - { name: slug, label: Slug, type: text, required: true }
      - { name: status, label: Estado, type: select, options: [draft, in_review, published, archived], required: true }
      - { name: summary, label: Resumen, type: text }
      - { name: updatedAt, label: Actualizado, type: datetime }
      - { name: reviewNotes, label: Notas de revisión, type: text }
      - { name: editionDate, label: Fecha de edición, type: date, required: true }
      - { name: editionNumber, label: Número de edición, type: number, required: true }
      - { name: season, label: Tiempo litúrgico, type: text }
      - { name: attachmentUrl, label: Adjunto (PDF), type: file }
      - { name: body, label: Cuerpo (HTML), type: text }   # multilínea; vive en el cuerpo del .md
  sermones:
    directory: content/sermones
    filename: "{slug}.md"
    format: yaml-frontmatter
    fields: [ comunes + sermonDate (date, required), topic (select, opciones = conjunto cerrado),
              durationMinutes (number), preacher, scriptureReference, audioUrl, body ]
```

(Los `options` de `topic` = valores extraídos de los `data-tema` actuales de `ierc-sermones.html`, en ese orden.)

- [ ] **Step 2: Actualizar `docs/esquema-contenidos.md`**

Añadir la tabla de campos por colección (comunes + boletines + sermones) con tipos/requeridos idénticos a Global Constraints, el conjunto cerrado de `topic` con su fuente, la nota «body = HTML literal en el cuerpo del .md», «chips de año: mantenimiento manual fuera de marcadores» y «migración = reflejo de lo en vivo, no declaración de oficialidad».

- [ ] **Step 3: Revisión y commit**

Leer el diff completo: nombres de campo en `snakeCase` exactamente como Global Constraints, sin campos de más. Crear la rama de trabajo y commitear (sin push todavía):

```bash
git checkout -b feat/fase3-cms-html
git add .pages.yml docs/esquema-contenidos.md
git commit -m "feat(cms): colecciones boletines y sermones + esquema"
```

Expected: rama creada y commit creado (las Tasks 2-4 siguen en esta misma rama; el push y PR van en Task 5/6 según flujo)

---

### Task 2: Validación multi-colección en `build-cms-content.mjs` (TDD)

**Files:**
- Modify: `scripts/build-cms-content.mjs`
- Modify: `scripts/test-cms-content.mjs`

**Interfaces:**
- Consumes: Task 1 (nombres de colección y campos).
- Produce: CLI sin argumentos, env única `CMS_ROOT`; valida las 3 colecciones; escribe `preview/cms-content.json` **solo con el piloto** (contrato JSON intacto); errores = `throw` → exit≠0 en stderr. Task 4 añade el render a esta misma función.

- [ ] **Step 1: Escribir los tests nuevos (RED)**

En `scripts/test-cms-content.mjs`, usando el patrón existente (`spawnSync(process.execPath,[generator],…)` + `mkdtemp` + fixture), añadir 5 casos que arman bajo un root temporal `content/boletines|sermones` con frontmatter válido y rompen UNA regla cada uno:

1. `boletin sin editionNumber → exit≠0 y stderr menciona editionNumber`
2. `boletin con editionNumber no numérico ("14a") → exit≠0`
3. `sermonDate "18/10/2026" (no ISO) → exit≠0`
4. `topic fuera del conjunto cerrado → exit≠0`
5. `slug repetido entre boletines y sermones → exit≠0`

- [ ] **Step 2: Verificar RED**

Run: `node scripts/test-cms-content.mjs`
Expected: los 5 nuevos tests FALLAN (el generador aún lee `CMS_CONTENT_DIR` y no valida nada de esto); los 3 existentes pueden pasar o fallar según el harness — migrarlos en el paso siguiente.

- [ ] **Step 3: Migrar el harness a `CMS_ROOT`**

Reemplazar el uso de `CMS_CONTENT_DIR`/`CMS_OUTPUT_FILE` por `CMS_ROOT`: las fixtures montan `content/cms-pilot|boletines|sermones` y `preview/` bajo el root temporal; las 3 pruebas existentes conservan sus aserciones (solo cambia la env). Eliminar las dos envs antiguas del generador y resolver `CMS_ROOT = process.env.CMS_ROOT ?? path.resolve(script, "..", "..")`.

- [ ] **Step 4: Implementar la validación multi-colección (GREEN)**

En `build-cms-content.mjs`: recorrer las 3 colecciones con un `Set` global de slugs; por tipo aplicar los requeridos de Global Constraints (boletín: `editionDate` ISO `^\d{4}-\d{2}-\d{2}$` + `editionNumber` entero ≥1; sermón: `sermonDate` ISO; `topic` si presente ∈ `CLOSED_TOPICS` (array literal derivado en Task 1)); mantener el parseador plano, `slugPattern`, `filename===slug`, estados y el export JSON **solo del piloto** sin cambios de contrato.

- [ ] **Step 5: Verificar GREEN**

Run: `node scripts/test-cms-content.mjs`
Expected: los 8 tests PASS, salida sin warnings

- [ ] **Step 6: Commit**

Run: `git add scripts/build-cms-content.mjs scripts/test-cms-content.mjs && git commit -m "feat(cms): validación multi-colección con env única CMS_ROOT"`
Expected: commit creado

---

### Task 3: Marcadores en los 3 HTML + migración de contenido actual a registros `published`

**Files:**
- Modify: `ierc-boletin.html`, `ierc-sermones.html`, `ierc-index.html` (solo insertar bloques marcadores)
- Create: `content/boletines/edicion-142.md` (slug `edicion-142`)
- Create: `content/sermones/<slug-de-cada-título>.md` (6 registros; slug = filename = título en kebab-case)

**Interfaces:**
- Consumes: Task 1 (campos), Task 2 (validador ya en verde).
- Produce: 4 bloques marcados con su contenido actual dentro; 7 registros `status: published` que validan en 0 — Task 4 los renderiza.

- [ ] **Step 1: Extraer el contenido actual SIN editarlo aún**

Leer los 3 HTML y anotar, por sección, el rango exacto de líneas que irá dentro de los marcadores, los formatos de fecha reales (cabecera del boletín y columna de fecha de filas) y los valores `data-tema` de las 6 filas (conjunto cerrado de `topic`).

- [ ] **Step 2: Insertar los 4 bloques marcadores**

Con la herramienta `edit`, envolver el contenido actual de cada sección en sus marcadores `IERC:BEGIN/END` + línea de advertencia; **el contenido dentro no cambia ni una coma** (insertar solo las líneas de comentario, una antes y una después del bloque existente + la advertencia justo tras el BEGIN).

- [ ] **Step 3: Crear los 7 registros**

`edicion-142.md` con `editionNumber: 142`, `editionDate: 2026-10-18`, `season` = el texto actual exacto, `body` = el HTML actual del interior (después de la cabecera; ver Nota), `status: published`. Los 6 sermones con `sermonDate`/`topic`/`durationMinutes` copiados literalmente de las filas actuales, `title` = título actual, `summary`/`preacher`/`scriptureReference` = lo que las filas ya muestren (si un campo no aparece hoy, se omite del frontmatter — no se inventa). Todos `status: published`, `reviewNotes` vacío.

**Nota (frontera cabecera/cuerpo):** `boletin-body` incluye la cabecera; la cabecera se renderiza en Task 4 desde `editionNumber/editionDate/season`, así que en este paso `body` queda SOLO con el contenido bajo la cabecera (la cabecera se deja dentro del marcador a mano; T4 la sustituirá por su render hasta dejar byte-idéntico).

- [ ] **Step 4: Validar sin tocar el HTML**

Run: `node scripts/build-cms-content.mjs`
Expected: exit 0, imprime el resumen; luego `git diff --stat` muestra **solo** las 3 líneas-de-marcador por sección añadidas (comentarios) y ningún byte de contenido alterado

- [ ] **Step 5: Commit**

Run: `git add ierc-boletin.html ierc-sermones.html ierc-index.html content/ && git commit -m "feat(cms): marcadores IERC y migración de boletín 142 + sermones a registros"`
Expected: commit creado

---

### Task 4: Renderizador por marcadores en el generador (TDD)

**Files:**
- Modify: `scripts/build-cms-content.mjs` (función `renderHtmlSections`)
- Modify: `scripts/test-cms-content.mjs` (7 tests nuevos)

**Interfaces:**
- Consumes: Task 2 (CLI/env), Task 3 (marcadores y registros reales).
- Produce: el generador reescribe los 4 bloques entre marcadores; secciones/HTML ausentes → error; sección sin `published` → no toca + aviso. Env `CMS_ROOT` (fixtures de test montan HTML con marcadores).

- [ ] **Step 1: Escribir los tests del renderer (RED)**

Fixture por test: root temporal con HTML mini (un `<section>` con marcadores BEGIN/END reales y contenido de relleno) + colección correspondiente. Casos:

1. `publicado renderiza su marca entre los marcadores` (boletín: comprueba `Edición N° <n>` con el formato derivado)
2. `draft deja el HTML byte-idéntico` (compara contenido completo antes/después)
3. `cero publicados en la sección → HTML intacto + aviso por stderr, exit 0`
4. `marcador BEGIN sin END → exit≠0`
5. `doble corrida idempotente → git-diff equivalente vacío (bytes iguales)`
6. `reviewNotes no aparece en ningún HTML generado` (búsqueda en el archivo)
7. `fixture con CRLF → tras render el archivo conserva \r\n` (cuenta `\r\n`, cero `\n` sueltos)

- [ ] **Step 2: Verificar RED**

Run: `node scripts/test-cms-content.mjs`
Expected: los 7 nuevos FALLAN (no existe render), los 8 previos siguen PASS

- [ ] **Step 3: Implementar `renderHtmlSections(root)` (GREEN)**

Por sección: plantilla del marcado actual **copiada byte a byte** de los HTML (clases/`data-*` intactos); entrada = registros `published` ordenados (sermones por `sermonDate` desc; `sermon-tira` = 3 más recientes; `boletin-tarjeta` = boletín más reciente; fechas con mes en español derivado del HTML actual, array literal de 12 meses). Sustituir SOLO lo de dentro de los marcadores, uniendo con el EOL detectado en el archivo; marcador/HTML inexistente → `throw`; sin `published` → no escribir + `console.error` de aviso. Si la sección ya coincide byte a byte, no hay cambio visible.

- [ ] **Step 4: Verificar GREEN**

Run: `node scripts/test-cms-content.mjs`
Expected: los 15 tests PASS

- [ ] **Step 5: Regenerar sobre el repo real y exigir cero diff**

Run: `node scripts/build-cms-content.mjs && git diff --exit-code -- '*.html'`
Expected: exit 0 — si hay diff, ajustar plantilla/frontera cabecera (T3 Nota) hasta que el contenido actual reproduzca idéntico; NUNCA «arreglar» a mano el HTML para que cuadre

- [ ] **Step 6: Commit**

Run: `git add scripts/ && git commit -m "feat(cms): renderizador por marcadores idempotente con preservación de EOL"`
Expected: commit creado

---

### Task 5: CI como puerta real (workflow + required check en master)

**Files:**
- Modify: `.github/workflows/cms-static-pipeline.yml`
- Repo: protección de rama vía `gh api`

**Interfaces:**
- Consumes: Task 4 (generador completo) y Task 2/4 (tests).
- Produce: todo PR ejecuta tests + build + `git diff --exit-code -- '*.html'`; el check `Validate CMS records and build preview data` es obligatorio para mergear en `master`.

- [ ] **Step 1: Ampliar el workflow (en la rama de trabajo `feat/fase3-cms-html`)**

Sin crear ramas nuevas — esta rama llevará todo el trabajo de T1-T4 y este cambio en un único PR. En el workflow: trigger `pull_request` **en todas las ramas y SIN filtro `paths`** (ruling de preflight: un check obligatorio que no corre en un PR bloquea su merge — los PRs solo-de-docs también deben dispararlo) y añadir `push: { branches: [master] }`. Al final del job, step:

```yaml
- name: Regenerate HTML and require zero diff
  run: |
    node scripts/build-cms-content.mjs
    git diff --exit-code -- '*.html'
```

- [ ] **Step 2: Push + PR con todo el trabajo + merge**

`git push -u origin feat/fase3-cms-html` → `gh pr create` (T1-T5: colecciones, validación, marcadores, render, CI) → esperar que el workflow nuevo corra en el PR y pase → `gh pr merge --squash --delete-branch`. Luego verificar que en `master` aparece una ejecución verde del workflow (`gh run list --branch master --limit 3`): **orden obligatorio** — GitHub exige que el check haya corrido una vez en la base antes de poder marcarlo como requerido.

- [ ] **Step 3: Añadir el required check (re-PUT de la protección completa)**

`gh api -X PUT repos/WwolfieLuisM/IERC_pagina.oficial/branches/master/protection` con TODO el JSON actual preservado (PR obligatorio, `enforce_admins: true`, `dismiss_stale_reviews: true`, `required_approving_review_count: 0`, `allow_force_pushes: false`, `allow_deletions: false`) **más**:

```json
"required_status_checks": { "strict": true, "contexts": ["Validate CMS records and build preview data"] }
```

- [ ] **Step 4: Verificar la puerta con un PR roto (Review Focus 5)**

Rama `test/pr-roto`, editar `content/sermones/*.md` a un `sermonDate` no ISO, push, `gh pr create`. Esperar el check en rojo → `gh pr merge --squash` → Expected: **rechazado** (required check failing). Cerrar el PR (`gh pr close`) y borrar la rama. Probar también la vía buena no es necesaria (la hará T6).

- [ ] **Step 5: Commit del estado**

Registrar en el PR de T6 (Task 6) los SHAs; aquí solo verificar con `gh api repos/…/branches/master/protection` que `required_status_checks.contexts` contiene el nombre exacto.

---

### Task 6: Cierre documental + PR final

**Files:**
- Modify: `docs/fases-implementacion-cms.md` (Fase 3 → completada; Fase 4 actualizada: required check activo, quedan approvals=1 con 2.º revisor y rollback de protección)
- Modify: `README.md` (checkbox de fase/estado + «próximo paso»)
- Modify: `docs/integracion-cms-estatica.md` (flujo del generador, env `CMS_ROOT`, marcadores, mantenimiento manual de chips de año, rollback = `git revert` del merge)
- Modify: `docs/esquema-contenidos.md` si Task 1 dejó algo fuera

**Interfaces:**
- Consumes: Tasks 1–5 (hechos y sus SHAs).

- [ ] **Step 1: Actualizar los 3-4 docs** con la herramienta `edit` (cero PowerShell), marcando qué queda pendiente (oficialidad, editores, approvals=1).

- [ ] **Step 2: Verificación final de regresión completa**

Run: `node scripts/test-cms-content.mjs && node scripts/build-cms-content.mjs && git diff --exit-code -- '*.html'`
Expected: 15 tests PASS, exit 0, cero diff

- [ ] **Step 3: Rama, PR, merge y comprobación en vivo**

Push de rama `docs/fase3-cierre`, `gh pr create`, esperar check verde, `gh pr merge --squash --delete-branch`. Abrir `https://wwolfieluism.github.io/IERC_pagina.oficial/` y las 3 páginas: idénticas a antes (0 errores de consola, sin overflow). Expected: visualmente sin cambios.

- [ ] **Step 4: Estado final en los docs**

Si el PR mergeó, marcar el plan como completado; reportar en el mensaje final: SHAs por tarea, evidencia de la puerta (PR roto rechazado), y lo delegado a humanos (oficialidad/editores).
