# Modelo de contenido para el portal IERC

## Propósito
Definir la estructura editorial futura para que el equipo pueda mantener el portal desde un CMS sin programar. Este documento es un contrato técnico inicial, no contenido oficial ni autorización para publicar.

## Tipos editoriales propuestos

### Boletín
- `title` (obligatorio): título.
- `slug` (obligatorio): identificador URL único.
- `status`: draft, in_review, published, archived.
- `summary`: resumen breve.
- `body`: contenido enriquecido.
- `publishedAt`: fecha/hora de publicación, si procede.
- `updatedAt`: fecha de última actualización.
- `coverImage`: imagen opcional.
- `reviewNotes`: notas internas, nunca mostradas en público.

### Sermón
- `title`, `slug`, `status`, `summary`, `body`, `publishedAt`, `updatedAt`.
- `speaker`: nombre confirmado por la congregación.
- `scriptureReferences`: referencias bíblicas como texto.
- `audioUrl`: URL opcional de audio aprobado.
- `coverImage`: imagen opcional.
- `reviewNotes`: notas internas.

### Página informativa
- `title`, `slug`, `status`, `body`, `updatedAt`.
- `reviewNotes`: notas internas.
- Direcciones, teléfonos, horarios, nombres y demás datos reales solo se incorporan después de verificación humana.

## Reglas editoriales y de publicación
1. El contenido nuevo comienza como `draft`.
2. Un responsable revisa exactitud, ortografía, autorización de imágenes/audio y datos de contacto.
3. `published` es una etiqueta de contenido; por sí sola no protege el sitio ni impide despliegues.
4. El CMS debe guardar en una rama de trabajo. La publicación requiere un flujo explícito revisado por una persona autorizada.
5. No mostrar `reviewNotes` en las páginas públicas.
6. Los slugs deben ser únicos, en minúsculas, números y guiones.
7. Fechas y enlaces deben validarse antes de integrar contenido.
8. No se inventa contenido institucional. Los campos desconocidos permanecen vacíos o marcados para verificación.

## Criterios de aceptación futuros
- Cada tipo editorial se puede crear, editar, previsualizar y archivar sin modificar HTML manualmente.
- El contenido público solo cambia después de revisión y aprobación explícitas.
- La vista previa no se confunde con el sitio público.
- La documentación explica restauración, medios y permisos.
- Se comprueba que notas internas y borradores no llegan al sitio público.

## Estado
Propuesta para revisión técnica. No está conectada a las páginas HTML actuales y no debe tratarse como un CMS de producción.
