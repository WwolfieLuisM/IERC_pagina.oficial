# Esquema de contenidos — IERC

Este documento define el modelo lógico propuesto para el CMS. No crea contenido oficial ni determina por sí solo qué puede publicarse. Todo registro debe ser aprobado por una persona autorizada.

## Estados editoriales

- `draft`: borrador privado/editorial.
- `in_review`: esperando revisión.
- `published`: aprobado y publicado.
- `archived`: retirado de la navegación pública, conservado en el historial.

Transición recomendada: `draft → in_review → published → archived`. Un cambio significativo en contenido publicado vuelve a revisión antes de actualizarlo.

## Tipos

| Tipo | Propósito | Campos específicos mínimos |
|---|---|---|
| `institutional_page` | Página institucional | `body`, `approvalStatus`, `lastReviewedAt` |
| `sermon` | Sermón | `sermonDate`, `preacher?`, `scriptureReference?`, `body?`, `audioUrl?` |
| `bulletin` | Boletín | `editionDate`, `body`, `attachmentUrl?` |
| `announcement` | Noticia/anuncio | `summary`, `body`, `expiresAt?` |
| `event` | Actividad/evento | `startsAt`, `endsAt?`, `location?`, `registrationUrl?` |
| `media` | Imagen/audio/archivo | `path/url`, `altText?`, `caption?`, `credit?`, `contentId?` |

## Campos comunes

```json
{
  "id": "stable-unique-id",
  "type": "sermon",
  "title": "TÍTULO CONFIRMADO POR UN EDITOR",
  "slug": "titulo-confirmado",
  "status": "draft",
  "createdAt": "2026-01-01T12:00:00Z",
  "updatedAt": "2026-01-01T12:00:00Z",
  "publishedAt": null,
  "updatedBy": "editor-id",
  "reviewNotes": "NOTA INTERNA; NO MOSTRAR PÚBLICAMENTE"
}
```

El objeto anterior es un ejemplo de estructura técnica, no un sermón real ni una fecha real de publicación. No se debe usar como contenido de producción.

## Reglas de validación

1. `id` y `slug` únicos dentro de su colección.
2. `title` no vacío.
3. `publishedAt` requerido solo al publicar.
4. Fechas con formato ISO 8601 y zona horaria explícita cuando haya hora.
5. Enlaces de audio, adjuntos y registro verificados antes de publicar.
6. No publicar si `approvalStatus` no es `approved` cuando aplique.
7. Campos opcionales ausentes se muestran como no disponibles; nunca inventar sustitutos.
8. Los cambios de slug deben preservar el enlace antiguo o documentar una redirección.
9. El CMS no debe mostrar `reviewNotes`, identidad privada ni metadatos internos en el sitio público.
10. Los medios deben incluir procedencia/licencia cuando corresponda y texto alternativo para imágenes informativas.

## Consideraciones de almacenamiento

El repositorio actual usa HTML escrito directamente. El formato físico final (JSON, YAML o Markdown) se decidirá durante el piloto CMS y la adaptación de frontend. No crear archivos de contenido productivo hasta que el formato se pruebe con una página real y un flujo completo de publicación.

## Aprobaciones pendientes

- Lista de editores y responsables de aprobación.
- Campos obligatorios definitivos por tipo.
- Ubicación y límites para archivos multimedia.
- Política para eventos expirados y anuncios archivados.
- Confirmación de qué textos actuales son oficiales.
