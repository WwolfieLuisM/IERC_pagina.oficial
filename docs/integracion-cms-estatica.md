# Integración estática del CMS — IERC (Fase 3)

## Qué implementa esta fase
- Un generador Node.js sin dependencias externas valida los registros Markdown de las 3 colecciones definidas en `.pages.yml`: `content/cms-pilot/`, `content/boletines/` y `content/sermones/`.
- Comprueba frontmatter, campos obligatorios por colección, estados permitidos, fechas ISO, slugs únicos globales, conjunto cerrado de `topic` y coincidencia entre slug y nombre de archivo.
- Solo los registros con estado `published` se renderizan en los HTML; borradores, elementos en revisión y archivados quedan excluidos, y `reviewNotes` nunca aparece en HTML ni en el JSON de vista previa.
- Salidas: (a) los 3 HTML con sus secciones reescritas entre marcadores; (b) `preview/cms-content.json`, que sigue exportando **solo** el piloto (contrato JSON intacto; `boletines` y `sermones` solo se validan y renderizan).

## Flujo del generador
1. Ejecutar `node scripts/build-cms-content.mjs` (sin argumentos).
2. El generador resuelve su raíz con la env **`CMS_ROOT`** (default: raíz del repositorio; los tests montan un root temporal con `CMS_ROOT=<dir>`).
3. Valida las 3 colecciones; cualquier error termina con exit ≠ 0 y mensaje en stderr.
4. Escribe cada sección publicada **entre sus marcadores** y deja el resto del HTML intacto (sección sin publicados → HTML sin cambios + aviso por stderr; sección o HTML sin marcadores → error).
5. Escribe `preview/cms-content.json` (solo registros `published` del piloto).

## Marcadores y qué se edita a mano
- Marcadores exactos: `<!-- IERC:BEGIN <sección> -->` / `<!-- IERC:END <sección> -->` con `<sección>` ∈ {`boletin-body` (`ierc-boletin.html`), `sermon-filas` (`ierc-sermones.html`), `sermon-tira`, `boletin-tarjeta` (`ierc-index.html`)}.
- **Solo el generador escribe entre marcadores.** Cualquier edición manual dentro de esos bloques se pierde en la siguiente ejecución.
- **Chips de año con mantenimiento manual:** los filtros de año (`2026`, `2025`) en `ierc-sermones.html` están **fuera** de los marcadores y se actualizan a mano.

## Ejecutar localmente
Requiere Node.js moderno, sin instalar paquetes:

```sh
node scripts/test-cms-content.mjs     # 15 pruebas
node scripts/build-cms-content.mjs    # valida y regenera
git diff --exit-code -- '*.html'      # debe ser 0 (idempotencia)
```

Después sirve la carpeta `preview/` con cualquier servidor estático local y abre `cms-pilot.html` (vista previa del piloto, que consume el JSON con `fetch` y crea nodos con `textContent`, evitando interpretar el cuerpo editorial como HTML). No uses `file://`, porque los navegadores suelen bloquear `fetch` desde archivos locales.

## CI como puerta
- El workflow corre en **todos los PRs** y en push a `master`: pruebas + build + comprobación de que ningún borrador se exporta + regeneración con `git diff --exit-code -- '*.html'` (idempotencia obligatoria).
- `master` tiene como **required check** (con `strict: true`) el contexto «Validate CMS records and build preview data»; un PR que falle no puede fusionarse. Probado con un PR roto intencional (#9): merge rechazado vía API (HTTP 405).

## Rollback
- Retirar o deshacer una publicación: `git revert <sha del merge>` (o del commit squash) **en un PR nuevo** hacia `master`. El revert devuelve los HTML a su estado anterior y GitHub Pages vuelve a publicarlos automáticamente.
- Nunca hacer push directo a `master`: la protección de rama lo bloquea (GH006).
- Si hay que deshacer también la protección de rama, restaurar el JSON de protección anterior mediante `gh api -X PUT …/branches/master/protection` (los valores vigentes están documentados en `docs/fases-implementacion-cms.md`, Fase 4).

## Límites y seguridad
- El campo `status: published` es una condición de exportación, no una autorización de seguridad. La aprobación real se aplica con la protección de rama (PR obligatorio + required check) y los permisos del repositorio.
- El parser admite un subconjunto intencionalmente pequeño de YAML frontmatter; no pretende soportar YAML arbitrario ni todos los bloques que Pages CMS pueda generar. Si se requiere contenido enriquecido real, debe adoptarse un parser YAML/Markdown probado y fijar dependencias antes de ampliar el alcance.
- El registro piloto sigue siendo ficticio y en `draft`: `preview/cms-content.json` exporta por diseño cero publicaciones mientras ese sea su único origen.
- Migrar contenido ≠ declararlo oficial: los registros migrados copian literalmente lo publicado hoy; la oficialidad la confirma la congregación.

## Pruebas de aceptación vigentes
1. `node scripts/test-cms-content.mjs`: 15/15 PASS.
2. `node scripts/build-cms-content.mjs`: exit 0, y `git diff --exit-code -- '*.html'` = 0 (segunda ejecución idéntica byte a byte).
3. Un registro `draft` o con `reviewNotes` nunca aparece en el JSON ni en ningún HTML.
4. Romper un campo (p. ej. `sermonDate` no ISO): build falla localmente y en CI el PR no puede fusionarse.
5. Cambiar solo el HTML entre marcadores a mano: la regeneración lo sobrescribe (los marcadores pertenecen al generador).
6. Los chips de año, fuera de marcadores, no los toca el generador: sobreviven a la regeneración.
7. Tras un merge, `master` muestra una ejecución verde del workflow y Pages se reconstruye sin cambios visuales.
