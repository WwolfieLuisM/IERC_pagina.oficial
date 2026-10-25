# Auditoría inicial — IERC

- Fecha de auditoría: 2026-10-25
- Repositorio: https://github.com/WwolfieLuisM/IERC_pagina.oficial
- Rama inspeccionada: `master`
- Alcance: revisión estática de los cinco archivos presentes en la raíz. No se ejecutó el sitio en navegador ni se verificó el panel de GitHub Pages desde la configuración privada del repositorio.
- Estado: diagnóstico documental; no se modificó el frontend.

## 1. Inventario observado

| Archivo | Tamaño aproximado | Función observada |
|---|---:|---|
| `index.html` | 1 KB | Redirección inmediata a `ierc-index.html` y metadatos sociales |
| `ierc-index.html` | 24.5 KB | Portada/recorrido institucional; CSS y JavaScript embebidos |
| `ierc-sermones.html` | 14.3 KB | Archivo de sermones, búsqueda y filtros con JavaScript embebido |
| `ierc-sermon.html` | 12.6 KB | Plantilla/página de detalle de sermón; CSS embebido |
| `ierc-boletin.html` | 7.1 KB | Página de boletín; CSS embebido |

En el árbol raíz consultado no aparecen carpetas de assets, hojas CSS o módulos JS separados, configuración del CMS, pruebas automatizadas, documentación técnica ni workflows de GitHub Actions. Esto no demuestra que no exista configuración de despliegue en los ajustes de GitHub; esa parte debe verificarse manualmente.

## 2. Hallazgos con evidencia

### A1 — Contenido de muestra mezclado con la presentación
**Prioridad: crítica antes de considerar el portal como fuente oficial.**

- `ierc-index.html` contiene comentarios como “texto de muestra — reemplazar por la historia real”, “historia real pendiente” y una foto pendiente.
- `ierc-sermones.html` marca expresamente las filas como muestras sustituibles y “sermones reales pendientes”.
- `ierc-sermon.html` marca el sermón real como pendiente, muestra “Audio del sermón — pronto” y presenta texto redactado como ejemplo.
- `ierc-boletin.html` deja pendiente la reflexión pastoral.
- Hay marcadores “dirección real pendiente” en pies de página.

**Acción:** antes de promocionar estas páginas como contenido oficial, un responsable de la congregación debe confirmar cada texto, fecha, autor, horario, dirección, evento y recurso. No completar los huecos por inferencia. Separar los datos de demostración del contenido publicable.

### A2 — Los elementos del archivo de sermones no representan registros independientes
**Prioridad: alta.**

Las distintas filas de `ierc-sermones.html` enlazan a `ierc-sermon.html`, por lo que varias entradas conducen a la misma página de detalle. La navegación “sermón siguiente” también apunta al mismo archivo de detalle. El buscador y los filtros operan sobre filas escritas directamente en HTML; no existe una fuente de contenido común observada.

**Acción:** en fases posteriores, definir un identificador/slug único por sermón y generar listado y detalle desde una fuente estructurada; enlazar únicamente registros confirmados.

### A3 — No existe una interfaz editorial visible en el código auditado
**Prioridad: alta para el objetivo solicitado.**

No se encontró una ruta `admin`, formulario editorial, integración de CMS ni almacenamiento estructurado en los cinco archivos inspeccionados. No se observó uso de `localStorage` o `sessionStorage`. Por tanto, el objetivo de publicar sin programar todavía no está implementado en los archivos revisados.

**Acción:** comparar CMS compatibles antes de elegir la implementación. No crear autenticación casera ni colocar tokens en JavaScript público.

### A4 — Diseño y estilos están embebidos por página
**Prioridad: media.**

Las cuatro páginas principales incluyen bloques `<style>` internos; no se encontraron hojas CSS externas ni scripts externos. Esto facilita una web estática simple, pero puede provocar estilos duplicados y diferencias al mantener navegación, pie y componentes comunes.

**Acción:** conservar inicialmente la identidad visual. Extraer estilos/componentes solo si la fase de frontend lo justifica y las pruebas confirman que no hay regresiones.

### A5 — Base accesible parcial, con cobertura desigual
**Prioridad: media.**

- `ierc-index.html`, `ierc-sermon.html` y `ierc-sermones.html` incluyen enlace para saltar al contenido y reglas para `prefers-reduced-motion`.
- `ierc-boletin.html` no muestra enlace de salto ni regla de movimiento reducido en el análisis estático.
- `index.html` es una redirección por meta refresh sin meta viewport; dispone de enlace HTML alternativo, pero la redirección depende de que el navegador respete el refresh.
- El buscador de sermones tiene etiqueta accesible; algunos controles y contenidos aún necesitan prueba manual de teclado, foco y lector de pantalla.

**Acción:** validar navegación por teclado, foco visible, contraste, estructura de encabezados, lectores de pantalla y movimiento reducido en todas las páginas. No declarar conformidad WCAG sin pruebas.

### A6 — Configuración de publicación no confirmada
**Prioridad: media.**

El HTML de portada contiene una URL de GitHub Pages en metadatos. El árbol inspeccionado no incluye workflows de despliegue. No se pudo confirmar desde estos archivos si Pages publica desde una rama/carpeta o mediante Actions.

**Acción:** revisar en GitHub Settings → Pages la fuente de publicación, dominio, HTTPS y último despliegue. Documentar el procedimiento real y probar una publicación inocua antes de cambiarlo.

### A7 — Pruebas automáticas no detectadas
**Prioridad: media.**

No hay scripts de pruebas ni configuración de herramientas de test en el árbol raíz observado. La revisión de enlaces se limitó a inspección estática y patrones de referencia; no se ejecutó un crawler ni navegador real.

**Acción:** añadir una comprobación reproducible de enlaces locales y una lista de recorridos manuales; automatizar solo las comprobaciones que puedan ejecutarse de forma estable.

## 3. Fortalezas que deben preservarse

- Identidad editorial reconocible: papel cálido, terracota, verde bosque y tipografía serif.
- HTML estático sin dependencias de runtime externas visibles en las páginas inspeccionadas.
- Varias páginas ya contemplan movimiento reducido, foco y salto al contenido.
- La portada raíz es pequeña y mantiene una ruta de entrada sencilla.

No rediseñar por moda ni reemplazar la tipografía, paleta o ritmo editorial sin un motivo comprobable y revisión visual.

## 4. Riesgos y decisiones pendientes

1. Confirmación editorial de contenido actual antes de declararlo oficial.
2. Fuente de publicación y permisos reales de GitHub Pages.
3. Formato futuro del contenido: HTML actual frente a datos estructurados.
4. CMS que permita acceso seguro y publicación sencilla sin conceder permisos excesivos al repositorio.
5. Política para imágenes y audio: ubicación, tamaño, derechos, respaldo y enlaces reales.
6. Proceso de revisión, retirada y recuperación de publicaciones.

## 5. Priorización

| Prioridad | Tarea | Evidencia de cierre |
|---|---|---|
| P0 | Revisar y etiquetar contenido pendiente | Inventario aprobado por persona autorizada; nada de muestra se presenta como confirmado |
| P0 | Confirmar configuración de Pages | Fuente, URL publicada y procedimiento documentados |
| P1 | Pilotar CMS sin publicar datos falsos | Acceso, edición, vista previa, permisos y flujo de publicación comprobados |
| P1 | Definir esquema de contenido | Esquema validado y ejemplos marcados como datos de prueba |
| P2 | Corregir rutas de sermones | Cada registro publicado abre su detalle correcto |
| P2 | Auditoría de accesibilidad y enlaces | Checklist ejecutado por página y defectos registrados |
| P3 | Consolidar estilos y automatizar QA | Cambios pequeños con comparación visual y pruebas |

## 6. Limitaciones de esta auditoría

Esta revisión está basada en el contenido de archivos leído desde GitHub y en análisis estático. No se hizo una auditoría de seguridad dinámica, prueba de navegador, prueba real de móvil, revisión de permisos de colaboradores, inspección de configuración privada de Pages, verificación histórica de datos eclesiásticos ni confirmación por parte de la congregación. Los hallazgos indican qué se observó en los archivos, no certifican el estado completo del servicio desplegado.

## 7. Criterio de salida de Fase 0

- [x] Inventario inicial de archivos raíz documentado.
- [x] Marcadores de contenido pendiente identificados en los HTML revisados.
- [x] Falta de CMS visible en los archivos inspeccionados documentada.
- [ ] Fuente de despliegue confirmada desde los ajustes de GitHub.
- [ ] Contenido oficial validado por responsable humano.
- [x] Siguiente fase delimitada sin cambiar archivos funcionales.

**Resultado:** la auditoría documental está lista para orientar la Fase 1. Los dos puntos pendientes de verificación humana no bloquean comparar CMS, pero sí bloquean declarar contenido oficial o cerrar por completo la validación del despliegue.
