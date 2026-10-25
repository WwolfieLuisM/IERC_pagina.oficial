# Fases de implementación del CMS — IERC

## Fase 0 — Auditoría y decisión técnica
**Estado:** documentada en `docs/auditoria-inicial.md` y `docs/decision-cms.md`.

## Fase 1 — Piloto aislado de Pages CMS
**Estado:** CI automático aprobado; prueba manual del editor y permisos pendiente.
- Configuración limitada a colección ficticia.
- Rama separada y medios aislados.
- No fusionar hasta verificar editor, rama, permisos y publicación.

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
**Pendiente.**
- Proteger la rama de publicación.
- Exigir revisión humana para los cambios de contenido.
- Verificar el origen actual de GitHub Pages antes de tocarlo.
- No confiar en un campo `status` como control de acceso.
- Preparar rollback y documentar restauración.

## Fase 5 — Validación y entrega
**Pendiente.**
- Probar CRUD y medios con contenido ficticio.
- Probar que un borrador no se publica.
- Probar rechazo de cambios fuera de las rutas autorizadas.
- Comprobar móvil, accesibilidad, rendimiento y navegación existente.
- Recibir aprobación explícita antes de introducir contenido oficial o activar el CMS para producción.

## Regla de avance
No saltar pruebas de autorización ni cambiar la rama/fuente de publicación para acelerar el proceso. El sitio público permanece intacto hasta que los criterios anteriores se hayan comprobado.
