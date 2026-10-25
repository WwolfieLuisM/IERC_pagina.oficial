# Decisión de CMS — Portal IERC

- Fecha: 2026-10-25
- Estado: recomendación para piloto; no se ha instalado ni autorizado ningún servicio.
- Repositorio: `WwolfieLuisM/IERC_pagina.oficial`
- Principio rector: permitir edición sin código y mantener la web sencilla, con control del contenido y sin inventar información oficial.

## 1. Contexto comprobado

La auditoría estática encontró cinco archivos HTML en la raíz, estilos embebidos, páginas con contenido de muestra explícitamente pendiente de confirmación y ninguna integración de CMS visible. La página de portada y las secciones de sermones/boletín están escritas directamente en HTML. Por tanto, un CMS que solo edite Markdown o JSON no conectará mágicamente esos campos a las páginas actuales: hará falta una adaptación de lectura/renderizado y una prueba de publicación.

La URL del repositorio apunta a GitHub Pages en los metadatos, pero la fuente de despliegue debe confirmarse en GitHub Settings → Pages antes de la implementación.

## 2. Comparación de opciones

| Opción | Ventajas comprobables | Costes/riesgos/limitaciones | Evaluación para IERC |
|---|---|---|---|
| **Pages CMS** — https://pagescms.org/ | Proyecto de código abierto orientado a editar contenido y medios directamente en repositorios GitHub; configuración mediante `.pages.yml`; su documentación describe un flujo de inicio con inicio de sesión de GitHub e instalación de GitHub App. El sitio declara que es gratuito y MIT. | Depende de una aplicación externa y de permisos de GitHub. Su página pública marca permisos granulares y programación como funciones “Soon”; no asumir control por rol, programación ni flujos editoriales avanzados. Debe comprobarse cómo limita escritura y cómo recupera acceso antes de darlo a editores. | **Primera opción para un piloto**, por ajuste al repositorio estático y menor infraestructura. Solo aprobar si se confirma que los permisos actuales son adecuados y el flujo de borrador/revisión/publicación cumple lo requerido. |
| **Decap CMS** — https://decapcms.org/ | CMS Git-based de código abierto; su documentación describe configuración de backend y repositorio, colecciones, medios y flujo editorial. Puede generar commits/PR según la configuración. | La autenticación con GitHub no es solo activar una página: requiere una configuración de backend/OAuth compatible. La documentación describe un proxy OAuth o un backend alojado, y hay que verificar los servicios y responsabilidades exactas. El sitio es estático, así que los borradores y la publicación deben probarse. | Alternativa si Pages CMS no cumple permisos o flujo editorial, pero exige resolver autenticación y operación antes de implementarlo. |
| **TinaCMS** — https://tina.io/ y https://github.com/tinacms/tinacms | Código abierto y contenido versionado en GitHub; soporta Markdown/MDX/JSON/YAML y edición visual; la documentación del proyecto describe GraphQL y vista previa. | Está más orientado a proyectos con configuración de build/framework y su experiencia completa puede requerir TinaCloud o infraestructura de contenido. Añadirlo a cinco páginas HTML estáticas implicaría una migración/integración mayor que la evidencia actual justifica. Verificar planes y costes vigentes antes de cualquier uso. | No elegir como primera solución; reconsiderar solo si se decide migrar a un framework y la vista previa visual avanzada aporta valor claro. |
| **Edición directa en GitHub** (sin CMS) | No añade servicios ni dependencias; el contenido y su historial quedan en Git. | No satisface el requisito central de edición sencilla para personas no técnicas; riesgo de errores en HTML y necesidad de aprender Git. | Mantener como mecanismo de emergencia/administración técnica, no como experiencia editorial principal. |

## 3. Recomendación

Realizar un **piloto de Pages CMS**, sin integrarlo aún en producción ni dar acceso editorial amplio.

La recomendación es provisional, basada en la compatibilidad declarada con repositorios GitHub y el coste de infraestructura observado. No equivale a afirmar que ya está conectado, que ofrece permisos por rol suficientes o que la publicación está probada.

### Pruebas obligatorias del piloto

1. Confirmar la fuente real de GitHub Pages y la rama de publicación.
2. Crear configuración en una rama de prueba, nunca con cambios directos a la página publicada.
3. Modelar primero un contenido de prueba claramente marcado como no oficial.
4. Probar login y salida de sesión; verificar qué permisos de GitHub requiere cada editor.
5. Probar crear, editar, guardar, previsualizar, publicar y retirar un borrador.
6. Comprobar si se puede exigir revisión antes de que el contenido llegue a la rama publicada.
7. Probar una imagen de prueba: carga, ruta, tamaño, visualización y eliminación.
8. Verificar qué ocurre si el usuario pierde acceso o la aplicación externa deja de estar disponible.
9. Confirmar que ningún token privado se inserta en HTML/JS público.
10. No incorporar horarios, contactos, sermones, fotos o anuncios reales hasta que los apruebe un responsable.

### Condiciones para rechazar Pages CMS

- No es posible restringir de forma aceptable quién puede editar el repositorio.
- El flujo permite publicar directamente sin la revisión que la congregación requiera.
- No se puede recuperar o revocar el acceso de forma clara.
- La experiencia de edición resulta difícil para los usuarios destinatarios.
- El comportamiento con medios o contenido estructurado exige una complejidad excesiva.

Si falla alguna condición, comparar una instalación de Decap CMS con backend de autenticación mantenido y documentar sus costes/operación antes de decidir.

## 4. Modelo editorial propuesto

Separar el contenido de su presentación. Las páginas públicas deben renderizar registros publicados desde archivos de contenido; el CMS edita esos registros. El HTML actual no debe ser editado mediante reemplazos arbitrarios de cadenas.

### Tipos de contenido

- **Página institucional:** portada, historia, identidad, información institucional.
- **Sermón:** título, slug, fecha, predicador, pasaje, resumen, cuerpo, audio opcional, estado.
- **Boletín:** título, slug, fecha/edición, reflexión, cuerpo, adjunto opcional, estado.
- **Noticia/anuncio:** título, slug, resumen, cuerpo, fecha de publicación, fecha de expiración opcional, estado.
- **Evento/actividad:** título, descripción, fecha/hora y zona horaria si aplica, lugar opcional, estado y fecha de finalización.
- **Recurso multimedia:** archivo o URL, texto alternativo/descripción, derechos/origen, tamaño y referencia al contenido asociado.

No se habilitará un tipo hasta que exista una necesidad confirmada y un responsable que lo mantenga.

## 5. Esquema de contenido inicial

Campos comunes para registros editoriales:

| Campo | Tipo | Requerido | Regla |
|---|---|---:|---|
| `id` | string | sí | Identificador estable, no reutilizar |
| `type` | enum | sí | Uno de los tipos documentados |
| `title` | string | sí | Texto confirmado por editor |
| `slug` | string | sí | Único, minúsculas, sin espacios; conservar enlaces al cambiarlo mediante redirección o referencia |
| `status` | enum | sí | `draft`, `in_review`, `published`, `archived` |
| `createdAt` | ISO date-time | sí | Generado por el sistema de edición cuando sea posible |
| `updatedAt` | ISO date-time | sí | Actualizado en cada cambio |
| `publishedAt` | ISO date-time | condicional | Obligatorio al publicar |
| `updatedBy` | string | recomendado | Usuario editor o identidad de commit |
| `reviewNotes` | string | no | Nota interna; no mostrar en el sitio público |

### Campos específicos

**Página institucional**
- `summary`: resumen opcional confirmado.
- `body`: contenido estructurado/rich text.
- `order`: orden opcional de navegación.
- `lastReviewedAt`: última revisión humana del contenido.
- `approvalStatus`: `unreviewed`, `approved`, `needs_changes`.

**Sermón**
- `preacher`: nombre confirmado; opcional si no se conoce.
- `sermonDate`: fecha de predicación confirmada.
- `scriptureReference`: referencia confirmada, no generada por el CMS.
- `summary`: resumen opcional.
- `body`: texto aprobado, opcional si solo se publica audio.
- `audioUrl`: URL opcional verificada.
- `durationSeconds`: número opcional y comprobado.
- `topics`: lista opcional de etiquetas aprobadas.

**Boletín**
- `editionDate`: fecha de edición confirmada.
- `body`: contenido aprobado.
- `attachmentUrl`: enlace opcional comprobado.
- `coverImage`: referencia opcional.

**Noticia/anuncio**
- `summary`: resumen breve.
- `body`: cuerpo aprobado.
- `expiresAt`: fecha/hora opcional para retirar automáticamente si la plataforma lo soporta; de lo contrario, retirada manual documentada.
- `sourceApproval`: referencia o nota interna de aprobación.

**Evento/actividad**
- `startsAt`: fecha y hora confirmadas.
- `endsAt`: fecha/hora opcional.
- `location`: lugar confirmado y opcional.
- `registrationUrl`: enlace opcional verificado.
- `expiresAt`: fecha/hora opcional.

**Medios**
- `path` o `url`: ubicación real del recurso.
- `altText`: texto alternativo para imágenes informativas.
- `caption`: pie opcional aprobado.
- `credit`: procedencia/licencia si corresponde.
- `contentId`: registro asociado.
- `isOfficial`: no debe ser un interruptor para convertir material dudoso en oficial; la aprobación humana es obligatoria.

## 6. Reglas de publicación y seguridad

- Solo una persona autorizada puede aprobar contenido institucional.
- Un borrador no se muestra en listados públicos.
- `published` exige revisión/aprobación humana; no basta con que el CMS haya guardado el archivo.
- No guardar contraseñas, tokens, datos privados ni credenciales en archivos públicos.
- Conceder el mínimo acceso posible; revisar y revocar colaboradores cuando corresponda.
- Mantener Git como historial y probar una reversión real.
- No prometer programación de publicaciones hasta comprobar que el CMS la soporta.
- No usar datos ficticios en producción.
- No publicar medios sin confirmar derechos, procedencia y consentimiento cuando proceda.

## 7. Decisiones aún pendientes de aprobación humana

1. Quiénes serán editores y quién puede aprobar/publicar.
2. Si cada publicación debe pasar por revisión/PR o si ciertos editores podrán publicar directamente.
3. Dónde guardar imágenes y audios y qué límite de tamaño aplicar.
4. Si la congregación necesita publicación programada desde el inicio.
5. Qué contenido institucional está aprobado para migrar.
6. Qué fuente de despliegue y URL pública están configuradas actualmente.

## 8. Criterios de aceptación de Fase 1

- [x] Auditoría inicial de archivos documentada.
- [x] Opciones de CMS comparadas con documentación oficial enlazada.
- [x] Recomendación provisional y condiciones de rechazo escritas.
- [x] Tipos de contenido y campos propuestos.
- [x] Reglas de autenticidad, permisos y recuperación documentadas.
- [ ] Piloto técnico de CMS ejecutado y probado.
- [ ] Fuente de despliegue de GitHub Pages confirmada.
- [ ] Responsables editoriales y flujo de aprobación confirmados por la congregación.

La Fase 1 documental queda preparada. La integración del CMS se debe iniciar solo después de revisar y aprobar esta decisión y de validar los puntos que dependen de cuentas, permisos y decisiones editoriales humanas.

## Fuentes oficiales consultadas

- Pages CMS, introducción y funcionamiento: https://pagescms.org/docs/
- Pages CMS, inicio rápido y permisos de instalación: https://pagescms.org/docs/quick-start/
- Pages CMS, autenticación: https://pagescms.org/docs/development/authentication/
- Pages CMS, funciones y limitaciones declaradas: https://pagescms.org/
- Decap CMS, documentación general: https://decapcms.org/docs/
- Decap CMS, backends y configuración de autenticación: https://decapcms.org/docs/backends-overview/
- Decap CMS, flujo de contribución abierta: https://decapcms.org/docs/open-authoring/
- TinaCMS, repositorio oficial y capacidades descritas: https://github.com/tinacms/tinacms
- GitHub Pages, documentación oficial: https://docs.github.com/en/pages/quickstart
