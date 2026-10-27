# Fases de implementación del CMS — IERC

## Fase 0 — Auditoría y decisión técnica
**Estado:** documentada en `docs/auditoria-inicial.md` y `docs/decision-cms.md`.

## Fase 1 — Piloto aislado de Pages CMS
**Estado:** completada (26 oct 2026). Ver `docs/piloto-pages-cms.md` (evidencias: editor, rama, permisos y publicación verificados con contenido ficticio).
- Configuración limitada a colección ficticia.
- Rama separada y medios aislados.
- Verificado: edición en rama aislada, master intacto, revocación probada, gate de aprobación activo.

## Fase 2 — Modelo editorial
**Estado:** esquema técnico inicial creado en `docs/modelo-contenido-cms.md`.
- Boletines, sermones y páginas informativas.
- Estados editoriales, campos de revisión y reglas de publicación.
- Sin contenido oficial inventado.

## Fase 3 — Integración de contenido con el sitio
**Completada (26 oct 2026).** Integrada en `master` vía PR #8 (squash `ea89c61`); commits T1–T5: `1f8de05` → `18d294f` → `dfbee62` → `b622ab9` → `b77ceb8`.
- Mecanismo: generador Node.js sin dependencias (`scripts/build-cms-content.mjs`) multi-colección con env única `CMS_ROOT` (default: raíz del repo) sobre `content/cms-pilot/`, `content/boletines/` y `content/sermones/`.
- El generador valida frontmatter, campos requeridos por colección, fechas ISO, slugs únicos globales y conjunto cerrado de `topic`; solo los registros `published` se renderizan, y `reviewNotes`/borradores nunca salen ni del HTML ni del JSON de vista previa.
- Render: los HTML se reescriben únicamente entre los marcadores `<!-- IERC:BEGIN/END -->` (secciones `boletin-body`, `sermon-filas`, `sermon-tira`, `boletin-tarjeta`); fuera de ellos el HTML no se toca. Los chips de año quedan fuera de los marcadores y se mantienen a mano.
- Migración: boletín edición 142 y 6 sermones existentes pasan a registros `published` reflejando literalmente lo publicado hoy — no implica oficialidad (la decide la congregación).
- Pruebas: 15/15 (`node scripts/test-cms-content.mjs`), incluida idempotencia byte a byte.
- CI como puerta: workflow en todos los PRs y en push a `master`; regenera y exige `git diff --exit-code -- '*.html'`. Required check en `master`: «Validate CMS records and build preview data» (`strict: true`). Puerta probada con PR roto (#9): merge rechazado (HTTP 405).
- El guard del piloto «Verify CMS pilot isolation» se retiró en el PR de cierre de la fase: su premisa de una única colección piloto es incompatible con `.pages.yml` multicolección y no era check requerido.
- **Pendiente humano:** confirmación de qué contenido es oficial y designación de editores/aprobadores.

## Fase 4 — Flujo de aprobación y despliegue
**Parcialmente completada (26 oct 2026).**
- ✅ Proteger la rama de publicación: `master` con PR obligatorio, `enforce_admins=true`, sin force-push/borrado; push directo rechazado (GH006). `required_approving_review_count=0` por ahora (un solo colaborador; GitHub no permite autoaprobarse) → subir a 1 cuando exista un segundo revisor.
- ✅ Exigir revisión humana para los cambios de contenido: todo cambio pasa por PR visible (`gh pr create` + merge).
- ✅ Verificar el origen actual de GitHub Pages: rama `master`, ruta `/`, estado `built`.
- ✅ No confiar en el campo `status`: el gate es la protección de rama, no el campo del CMS.
- ✅ Required check en CI activo (26 oct 2026): `required_status_checks` con contexto «Validate CMS records and build preview data» y `strict: true` sobre `master`, junto a todas las protecciones previas; verificado por API y probado con un PR roto (#9, rechazo HTTP 405).
- ⬜ Subir `required_approving_review_count` a 1 cuando exista un segundo revisor.
- ⬜ Preparar rollback y documentar restauración: `git revert` del merge correspondiente vía PR, y restauración de la protección de rama desde su JSON previo (queda).

## Fase 5 — Validación y entrega
**Pendiente.**
- Probar CRUD y medios con contenido ficticio.
- Probar que un borrador no se publica.
- Probar rechazo de cambios inválidos en CI (un registro roto deja el check en rojo y el PR no se fusiona; ya verificado con PR #9).
- Comprobar móvil, accesibilidad, rendimiento y navegación existente.
- Recibir aprobación explícita antes de introducir contenido oficial o activar el CMS para producción.

## Regla de avance
No saltar pruebas de autorización ni cambiar la rama/fuente de publicación para acelerar el proceso. El sitio público permanece intacto hasta que los criterios anteriores se hayan comprobado.
