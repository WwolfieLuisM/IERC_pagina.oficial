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
**Pendiente de diseñar e implementar tras aprobar Fase 1.**
- Elegir un mecanismo de compilación que convierta contenido aprobado en datos estáticos consumidos por el HTML actual.
- Mantener el diseño editorial existente; no rediseñar por iniciativa propia.
- No exponer borradores, notas internas ni medios sin aprobar.
- Añadir validación automática de esquema, slugs duplicados, enlaces y campos requeridos.
- Construir vista previa en rama de prueba antes de modificar el despliegue real.

## Fase 4 — Flujo de aprobación y despliegue
**Parcialmente completada (26 oct 2026).**
- ✅ Proteger la rama de publicación: `master` con PR obligatorio, `enforce_admins=true`, sin force-push/borrado; push directo rechazado (GH006). `required_approving_review_count=0` por ahora (un solo colaborador; GitHub no permite autoaprobarse) → subir a 1 cuando exista un segundo revisor.
- ✅ Exigir revisión humana para los cambios de contenido: todo cambio pasa por PR visible (`gh pr create` + merge).
- ✅ Verificar el origen actual de GitHub Pages: rama `master`, ruta `/`, estado `built`.
- ✅ No confiar en el campo `status`: el gate es la protección de rama, no el campo del CMS.
- ⬜ Preparar rollback y documentar restauración (queda).

## Fase 5 — Validación y entrega
**Pendiente.**
- Probar CRUD y medios con contenido ficticio.
- Probar que un borrador no se publica.
- Probar rechazo de cambios fuera de las rutas autorizadas.
- Comprobar móvil, accesibilidad, rendimiento y navegación existente.
- Recibir aprobación explícita antes de introducir contenido oficial o activar el CMS para producción.

## Regla de avance
No saltar pruebas de autorización ni cambiar la rama/fuente de publicación para acelerar el proceso. El sitio público permanece intacto hasta que los criterios anteriores se hayan comprobado.
