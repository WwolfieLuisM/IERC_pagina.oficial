# Diseño — Fase 3: integración CMS → HTML (generación por marcadores)

## Intención y por qué

Que el contenido editado en Pages CMS (boletines y sermones) llegue al sitio estático compilado, validado y revisado mediante PR, sin rediseñar nada. El sitio público hoy es HTML escrito a mano servido tal cual por GitHub Pages; esta fase establece la cadena `content/*.md → validación → marcadores HTML → master (por PR) → Pages`.

Decisiones acordadas con el responsable (26 oct 2026):

- **Se migra ya el contenido actual publicado** a registros del CMS (el CMS pasa a ser fuente de verdad de boletines y sermones). No se espera a la designación de editores: ese gate gobierna contenido *futuro* y ya está cubierto porque `master` exige PR para todo.
- **Opción 1 elegida: generación por marcadores.** Descartadas: JSON+JS (el contenido real dependería de JavaScript y el diseño se reescribiría dentro de JS) y SSG de páginas completas (reescribe páginas ya aprobadas y multiplica el riesgo sin beneficio visible).

## Metas

- Colecciones `boletines` y `sermones` editables en Pages CMS (`.pages.yml`), en `content/boletines/` y `content/sermones/`.
- Migración literal del contenido ya publicado: boletín N° 142 (`ierc-boletin.html`), filas de sermones (`ierc-sermones.html`) y tira/tarjeta de la portada (`ierc-index.html`) a registros con `status: published`.
- El generador existente (`scripts/build-cms-content.mjs`) valida por tipo y escribe el resultado en las secciones marcadas del HTML.
- Validación automática en todo PR, con bloqueo real de merges rotos (check obligatorio en la protección de la rama).
- Vista previa visible antes de fusionar: la diferencia del PR muestra el HTML final, y como el contenido queda escrito en el archivo, abrirlo localmente muestra el resultado sin servidor.

## No metas / anti-metas

- No se genera HTML por cada sermón: `ierc-sermon.html` (artículo único) queda como está.
- Sin colecciones de páginas institucionales, eventos ni media en esta fase.
- Cero rediseño: paleta, tipografía, layout y el JS de buscador/chips intactos; el generador emite exactamente el marcado actual (incluidas las clases y atributos `data-*` que consume ese JS).
- Cero datos inventados: la migración copia literalmente lo publicado; lo no disponible sigue siendo comentarios `<!-- CONTENIDO/PIE/FOTO -->`.
- Nada llega a `master` sin PR (gate vigente con `enforce_admins=true`).

## Restricciones

- Reglas editoriales del README y validaciones de `docs/esquema-contenidos.md`.
- Solo `status: published` se exporta y se genera; `reviewNotes` jamás aparece en HTML.
- Edición de HTML/MD solo con la herramienta de edición segura (lección mojibake); el parser soporta únicamente el subconjunto de YAML frontmatter ya acotado en `scripts/build-cms-content.mjs` (si el contenido enriquecido real lo supera, adoptar parser YAML/Markdown probado y fijar dependencias — límite ya documentado en `docs/integracion-cms-estatica.md`).
- GitHub Pages no compila: todo proceso corre en local/CI y su resultado entra por PR.

## Cómo funciona (partes decididas)

1. **Colecciones**: `.pages.yml` gana `boletines` y `sermones` (`filename: "{slug}.md"`, `yaml-frontmatter`, mismo patrón que la colección piloto). La colección piloto se conserva tal cual y **sigue siendo solo de contenido ficticio**: su JSON de vista previa (`preview/cms-content.json`) no se amplía a contenido real.
2. **Campos**: comunes de `docs/modelo-contenido-cms.md` (`title`, `slug`, `status`, `summary`, `updatedAt`, `reviewNotes`); específicos de `docs/esquema-contenidos.md` con las ampliaciones de esta fase:
   - Boletín: `editionDate` (ISO), `editionNumber` (número, requerido), `season` (texto opcional, p. ej. «Tiempo después de Pentecostés»), `body`, `attachmentUrl?`.
   - Sermón: `sermonDate` (ISO), `topic` (select cerrado: exactamente los valores de los chips actuales `data-tema`, p. ej. `doctrina`, `libro-oracion`…), `durationMinutes` (número opcional; la columna «6 min» se renderiza como `<durationMinutes> min`), `preacher?`, `scriptureReference?`, `body?`, `audioUrl?`.
   - Ante conflicto entre documentos: `esquema-contenidos.md` manda en los específicos, `modelo-contenido-cms.md` en los comunes. `docs/esquema-contenidos.md` y `.pages.yml` se actualizan en la implementación para reflejar estos campos nuevos.
3. **Marcadores**: cada sección va delimitada por un par de comentarios exactos:
   `<!-- IERC:BEGIN <nombre> --> … <!-- IERC:END <nombre> -->`
   - `ierc-boletin.html` → `boletin-body`: **incluye la cabecera** (N° de edición, fecha, temporada litúrgica) y el cuerpo — así una edición nueva no deja datos viejos en la cabecera.
   - `ierc-sermones.html` → `sermon-filas` (todas las `published`, orden por fecha desc).
   - `ierc-index.html` → `sermon-tira` (3 más recientes) y `boletin-tarjeta` (la más reciente, con N° y fecha generados de los campos).

   Solo el generador escribe entre marcadores; una edición manual ahí se sobreescribe (queda advertencia dentro del propio bloque). Los chips de año (`2026`, `2025`) **quedan fuera** de los marcadores: son mantenimiento manual y se documenta que al cruzar de año hay que añadir el chip (4 marcadores, no 5).
4. **Generador**: extender `scripts/build-cms-content.mjs` (un solo comando):
   a) valida todas las colecciones (campos requeridos por tipo, slug válido y único = nombre de archivo, estados permitidos, fechas ISO, `topic` dentro del conjunto cerrado);
   b) si la validación falla → termina con código ≠ 0 y mensaje claro (el PR queda rojo en CI);
   c) selecciona `published`, ordena y renderiza el marcado de cada sección copiando el actual;
   d) reemplaza solo el contenido entre marcadores (idempotente);
   e) sigue exportando `preview/cms-content.json` para la vista previa piloto.
   Si una sección no tiene ningún registro `published`, el generador **no modifica** esa sección y avisa: producción nunca se queda vacía.
5. **Formato de `body`: HTML literal.** El `body` vive en el cuerpo del `.md` (después del frontmatter, no dentro), se inyecta tal cual, y el campo en `.pages.yml` es de tipo texto multilínea. Motivos: el boletín real usa marcado propio (`.lecturas-box`, secciones con numeración romana) que Markdown no reproduce sin renderizador propio; HTML literal = cero dependencias, marcado idéntico al actual, parser actual suficiente. **Decisión a revisar** cuando los editores reales empiecen a escribir: si el HTML les resulta incómodo, valorar conversión Markdown→HTML con parser fijado (coste: dependencia + HTML no byte a byte).
6. **Migración**: crear los registros desde el HTML actual, copia literal (títulos, fechas, pasajes, tema, duración, cuerpo del boletín). Se migran con `status: published` porque es exactamente lo que hoy está en producción — la migración refleja el estado actual, **no es una declaración de oficialidad**: la confirmación de «qué textos actuales son oficiales» sigue pendiente en el README y gobierna contenido nuevo. `reviewNotes` queda vacío.
7. **CI como puerta real**: ampliar el trigger de `cms-static-pipeline.yml` a **todo PR** (hoy solo ramas concretas) con: tests del generador + regenerado + idempotencia. El check de idempotencia se acota a los HTML (`git diff --exit-code -- '*.html'`), **excluyendo** `preview/cms-content.json`, que lleva marca de tiempo `generatedAt` y fallaría siempre. Después, añadir este check a la protección de `master` (`required_status_checks`). Orden obligatorio: primero el workflow corre verde en `master`, después se aplica la protección (GitHub exige que el check haya corrido al menos una vez). Quien aplica la protección: quien tenga `gh` autenticado como administrador de la repo (existe: la protección actual se creó así).
8. **Vista previa antes de fusionar**: diferencia del PR + apertura local del HTML. En local: `node scripts/build-cms-content.mjs` y abrir el archivo.
9. **Rollback**: `git revert` del commit de merge (documentado en el estado final de la fase).

## Riesgos conocidos

- Edición manual dentro de marcadores → se pierde al regenerar (advertencia en el bloque + documentación).
- Un PR puede traer HTML editado a mano fuera de marcadores que contradiga lo generado → lo decide la revisión humana en el diff (gate actual).
- El `body` en HTML exige editores cómodos con etiquetas (mitigado: el grueso del boletín se edita como bloques existentes; revisar con editores reales).
- Cuando exista un segundo revisor: subir `required_approving_review_count` a 1 (ya anotado en Fase 4).

## Lo que queda al implementador

- El texto exacto de las plantillas de cada sección (copiar el marcado actual byte a byte, conservando clases y `data-*` del JS existente).
- Derivar el conjunto cerrado de `topic` de los valores `data-tema` reales del HTML actual.
- Casos de prueba del generador: inválidos (slug malo, slug duplicado, campo requerido ausente, estado desconocido, fecha no ISO, `topic` fuera de conjunto) y válidos (publicado genera; draft no genera; sección sin publicados queda intacta; idempotencia doble corrida sobre HTML).
- Mapeo fino de cada fila existente a campos de registro.
- Ampliar `scripts/test-cms-content.mjs` con esos casos; actualizar `docs/esquema-contenidos.md`, `.pages.yml`, `docs/fases-implementacion-cms.md` y README al cerrar la fase.
- Dejar preparados (y aplicar, verificando después) los comandos de protección de rama con `required_status_checks`, en el orden descrito en «Cómo funciona» punto 7.
