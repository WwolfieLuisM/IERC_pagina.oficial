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

## Colecciones de la Fase 3 (`boletines` y `sermones`)

Definidas en `.pages.yml` junto a la colección piloto (que queda intacta y sigue siendo solo contenido ficticio): `boletines` → `content/boletines/`, `sermones` → `content/sermones/`, ambas con `filename: "{slug}.md"` y `format: yaml-frontmatter`.

### Campos comunes (ambas colecciones)

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `title` | `text` | sí | Título del registro. |
| `slug` | `text` | sí | Minúsculas, números y guiones (mismo `slugPattern` actual). `filename === slug + ".md"`; los slugs son únicos globalmente entre las 3 colecciones. |
| `status` | `select` (`draft`, `in_review`, `published`, `archived`) | sí | Solo `published` genera HTML. |
| `summary` | `text` | no | Resumen. |
| `updatedAt` | `date` | no | Última actualización. |
| `reviewNotes` | `text` | no | Nota interna: **nunca** aparece en HTML (ni en el JSON de vista previa). |

### Campos exclusivos de `boletines`

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `editionDate` | `date` | sí | ISO `yyyy-mm-dd`. |
| `editionNumber` | `number` | sí | Entero ≥ 1. |
| `season` | `text` | no | Tiempo litúrgico, p. ej. «Tiempo después de Pentecostés». |
| `attachmentUrl` | `text` | no | URL del PDF adjunto. **Es `text` y no `file`** (aunque el brief del plan decía `file`): es una URL externa, no un asset del repo — ruling del controller. |
| `body` | `text` | no | HTML literal (ver nota abajo). |

### Campos exclusivos de `sermones`

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `sermonDate` | `date` | sí | ISO `yyyy-mm-dd`. |
| `topic` | `select` (conjunto cerrado) | no | Si está, debe pertenecer al conjunto cerrado de abajo. |
| `durationMinutes` | `number` | no | Minutos enteros; se renderiza como «N min». |
| `preacher` | `text` | no | Predicador. |
| `scriptureReference` | `text` | no | Pasaje. |
| `audioUrl` | `text` | no | URL de audio. |
| `body` | `text` | no | HTML literal (ver nota abajo). |

### Conjunto cerrado de `topic`

`doctrina`, `libro-oracion` (en ese orden).

Fuente: los valores exactos de los atributos `data-tema` de las 6 filas de `ierc-sermones.html` al momento de la migración (2 valores únicos). Un `topic` fuera de este conjunto invalida el registro.

### Notas

- **`body` = HTML literal en el cuerpo del .md**: el valor vive después del frontmatter (no dentro) y se inyecta tal cual en el HTML.
- **Chips de año: mantenimiento manual fuera de marcadores**: los filtros de año (`2026`, `2025`) quedan fuera de los bloques `<!-- IERC:BEGIN/END -->` y se mantienen a mano.
- **Migración = reflejo de lo en vivo, no declaración de oficialidad**: los registros migrados copian literalmente el contenido publicado hoy; nada nuevo se da por oficial (la oficialidad la decide la congregación).

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
