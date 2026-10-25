# IERC — Portal oficial de la congregación

> **Plan de mejora y hoja de ruta del proyecto.** Este documento define el objetivo, las reglas editoriales, la arquitectura por validar, las fases de trabajo y los criterios de aceptación del portal IERC 2.0.

Repositorio: [WwolfieLuisM/IERC_pagina.oficial](https://github.com/WwolfieLuisM/IERC_pagina.oficial)

## 1. Visión y objetivo

Convertir el sitio actual en un **portal completo de la congregación**, administrable por personas autorizadas sin necesidad de programar, conservando y perfeccionando la identidad editorial existente.

El portal debe reunir información institucional, biblioteca cristiana, noticias, actividades y canales de contacto. Debe funcionar bien en dispositivos móviles y conexiones lentas, mantener una experiencia accesible y facilitar que el contenido oficial se mantenga actualizado.

### Principios del proyecto

- **Identidad antes que moda:** conservar la personalidad editorial actual, incluyendo la paleta terracota y verde bosque, los tonos cálidos, la tipografía y las animaciones que aporten valor.
- **Contenido auténtico:** no inventar información oficial.
- **Edición sin código:** los responsables editoriales deben poder gestionar publicaciones desde una interfaz.
- **Simplicidad y rendimiento:** evitar dependencias, servicios y migraciones que no estén justificadas.
- **Accesibilidad:** navegación por teclado, estructura semántica, contraste suficiente y respeto a la preferencia de movimiento reducido.
- **Cambios controlados:** trabajar en ramas, validar las modificaciones y no publicar cambios importantes sin revisión.

## 2. Alcance funcional

### 2.1 Inicio institucional

- Presentar la identidad, misión e información institucional que haya sido aprobada.
- Facilitar el acceso a historia, biblioteca, noticias, actividades y contacto.
- Mostrar anuncios o próximos eventos únicamente cuando estén confirmados.
- Mantener una jerarquía visual clara y adaptable a móvil y escritorio.

### 2.2 Páginas institucionales

- Organizar la información institucional existente.
- Preservar contenido histórico auténtico.
- Señalar para revisión cualquier afirmación, fecha, horario, dirección o dato cuya vigencia no pueda comprobarse.
- No eliminar contenido histórico sin justificar y documentar la decisión.

### 2.3 Biblioteca cristiana

- Archivo de sermones y recursos bíblicos.
- Datos de fecha, título, autor o predicador, pasaje bíblico, texto y audio solo cuando estén disponibles y verificados.
- Búsqueda y filtros por tema, categoría o fecha cuando el volumen de contenido lo justifique.
- Archivo de boletines con ediciones y fechas correctas.
- Estados vacíos claros; no crear enlaces a audios o documentos inexistentes.

### 2.4 Noticias, anuncios y actividades

- Publicar noticias y anuncios autorizados.
- Gestionar eventos y actividades con fechas confirmadas.
- Permitir retirar o archivar información obsoleta.
- Mostrar fechas de publicación y, cuando corresponda, de actualización.
- Ofrecer canales de participación y contacto aprobados por la congregación.

### 2.5 Administración editorial

Ruta propuesta: `/admin/` (se debe validar su compatibilidad con la arquitectura elegida).

El panel debe permitir, como mínimo:

- Crear, editar, previsualizar, publicar y retirar contenido.
- Guardar borradores.
- Gestionar imágenes, categorías y metadatos.
- Administrar páginas, noticias, anuncios, eventos, sermones y boletines.
- Mostrar validaciones comprensibles y errores recuperables.
- Contar con autenticación real, permisos apropiados y un procedimiento de recuperación de acceso.

La programación de publicaciones puede incorporarse si el CMS seleccionado la soporta de forma fiable. No debe darse por disponible sin comprobarlo.

## 3. Reglas editoriales y de autenticidad

Estas reglas son obligatorias para todos los agentes, colaboradores y automatizaciones.

1. No inventar historia, misión, doctrina, horarios, direcciones, teléfonos, contactos, actividades ni anuncios.
2. No inventar títulos de sermones, predicadores, pasajes bíblicos asociados a una grabación, fechas, archivos de audio ni ediciones de boletines.
3. No presentar fechas futuras como confirmadas sin una fuente autorizada.
4. No etiquetar imágenes genéricas como fotografías de la congregación.
5. Distinguir entre contenido verificado, contenido existente pendiente de aprobación y datos de prueba.
6. Mantener los datos de prueba separados del contenido oficial.
7. No publicar marcadores de ejemplo ni avisos internos de revisión por accidente.
8. Si un dato no está confirmado, dejarlo pendiente para revisión humana; no rellenarlo mediante inferencias.
9. La aprobación del contenido institucional corresponde a una persona autorizada.
10. Los agentes pueden corregir presentación, accesibilidad y estructura sin alterar el significado de textos oficiales.

## 4. Arquitectura propuesta

La arquitectura debe decidirse después de auditar el repositorio. La recomendación inicial es **conservar HTML, CSS y JavaScript y el alojamiento actual en GitHub Pages mientras satisfagan los requisitos**. No migrar a React, añadir un backend o incorporar infraestructura nueva por costumbre.

### Componentes previstos

| Componente | Criterio |
|---|---|
| Sitio público | Reutilizar y ordenar las páginas y estilos existentes |
| Contenido | Formatos estructurados y editables mediante el CMS seleccionado |
| Panel editorial | Interfaz protegida y separada de la experiencia pública |
| Publicación | Flujo conectado al repositorio y al despliegue |
| Alojamiento | Mantener GitHub Pages si la solución final es compatible |
| Imágenes y medios | Optimizar peso, dimensiones y formatos |
| Seguridad | Autenticación real, permisos mínimos y recuperación documentada |
| Calidad | Pruebas reproducibles y revisión antes de publicar |

### Evaluación obligatoria del CMS

Antes de implementar el panel, documentar una comparación de opciones reales y verificar:

- Compatibilidad con el repositorio y GitHub Pages.
- Autenticación y autorización.
- Experiencia de edición para personas no técnicas.
- Borradores, previsualización, publicación y retirada.
- Gestión de imágenes y tipos de contenido.
- Costes, cuotas, límites y dependencias externas.
- Seguridad de credenciales y permisos.
- Recuperación de acceso y reversión de cambios.
- Funcionamiento en conexiones lentas y dispositivos móviles.

No asumir que un CMS es gratuito, seguro o compatible sin verificarlo. No incluir tokens privados, contraseñas ni secretos en JavaScript público. Si la solución requiere un servicio externo, backend o función adicional, justificarlo y documentar su configuración y coste potencial.

## 5. Hoja de ruta de implementación

### Fase 0 — Auditoría inicial

**Objetivo:** conocer el estado real del proyecto antes de cambiarlo.

Tareas:
- Inspeccionar árbol de archivos, rutas, HTML, CSS, JavaScript, imágenes y configuración de despliegue.
- Identificar páginas, enlaces internos, navegación y recursos compartidos.
- Localizar textos de ejemplo y datos institucionales pendientes de verificación.
- Revisar accesibilidad, SEO, rendimiento y riesgos de seguridad.
- Registrar estado de Git y posibles cambios existentes.
- Probar el mecanismo actual de publicación.

**Entregable:** `docs/auditoria-inicial.md`.

**Criterios de aceptación:**
- El informe incluye rutas y evidencias reales del repositorio.
- Se identifica cómo se publica actualmente el sitio.
- El contenido se clasifica como verificado, pendiente de aprobación o de prueba.
- Se priorizan problemas por impacto y dificultad.
- No se modifican archivos funcionales durante esta fase ni se altera la rama principal.

### Fase 1 — Decisión de arquitectura y CMS

**Objetivo:** elegir una solución que permita publicar sin programar sin añadir complejidad innecesaria.

Tareas:
- Comparar opciones de CMS compatibles.
- Verificar autenticación, permisos, publicación, costes y limitaciones.
- Definir tipos de contenido y sus campos.
- Definir validaciones, estados editoriales y gestión de imágenes.
- Documentar dependencias y el proceso de despliegue.

**Entregables:** `docs/decision-cms.md` y esquema documentado de contenidos.

**Criterios de aceptación:**
- La recomendación compara opciones con evidencia y no solo preferencias.
- Se documentan costes y servicios externos, si existen.
- Se identifica cómo recuperar acceso y revertir publicaciones.
- Las decisiones que afecten a costes, cuentas o servicios externos quedan señaladas para aprobación humana.
- No se comienza una integración insegura ni una dependencia de pago sin documentarla.

### Fase 2 — Frontend institucional

**Objetivo:** mejorar el sitio actual sin borrar su identidad.

Tareas:
- Corregir enlaces y rutas detectados en la auditoría.
- Mejorar navegación, encabezado, pie y jerarquía visual.
- Reutilizar componentes cuando reduzca duplicación y errores.
- Refinar el diseño responsive conservando la identidad editorial.
- Revisar títulos, descripciones y metadatos para compartir.
- Mantener el contenido oficial sin cambios de significado.

**Criterios de aceptación:**
- Las páginas y rutas existentes identificadas se prueban.
- No hay enlaces internos rotos entre las rutas comprobadas.
- Navegación funcional en móvil, escritorio y teclado.
- No se eliminan secciones históricas sin una decisión documentada.
- No hay regresiones conocidas sin registrar.

### Fase 3 — CMS y gestión editorial

**Objetivo:** permitir que personas autorizadas gestionen contenido sin editar código.

Tareas:
- Implementar la solución aprobada.
- Proteger el panel con autenticación real.
- Implementar roles y permisos mínimos necesarios.
- Permitir crear, editar, previsualizar, publicar y retirar contenido.
- Añadir validaciones y mensajes de error comprensibles.
- Probar el flujo completo de publicación y despliegue.
- Documentar recuperación de acceso y reversión.

**Criterios de aceptación:**
- Un usuario autorizado puede editar y publicar desde la interfaz.
- Una persona no autenticada no puede modificar contenido.
- No se exponen credenciales ni tokens privados en el cliente público.
- Una publicación de prueba aparece en el sitio tras el despliegue.
- Existe un procedimiento probado para retirar o revertir una publicación.
- Los datos de prueba no se mezclan con el contenido oficial.

### Fase 4 — Biblioteca, noticias y comunidad

**Objetivo:** conectar las secciones del portal con el contenido administrado.

Tareas:
- Implementar listados y páginas de detalle para sermones y boletines.
- Implementar noticias, anuncios y eventos.
- Añadir búsqueda y filtros donde aporten valor.
- Gestionar estados de publicación, fechas y archivo.
- Crear estados vacíos y mensajes para recursos que todavía no existan.
- Conectar cada sección con el CMS.

**Criterios de aceptación:**
- Los listados se generan a partir del contenido publicado.
- Cada tipo de contenido se puede gestionar desde el CMS.
- Búsqueda y filtros pasan pruebas reproducibles.
- No se muestran enlaces falsos ni reproductores vacíos.
- El contenido retirado deja de aparecer en las secciones públicas correspondientes.

### Fase 5 — Calidad, accesibilidad y rendimiento

**Objetivo:** verificar que el portal sea utilizable y eficiente en condiciones reales.

Tareas:
- Optimizar imágenes y evitar dependencias externas innecesarias.
- Revisar contraste, etiquetas, estructura semántica, foco y navegación por teclado.
- Respetar la preferencia de movimiento reducido.
- Revisar errores de consola, rutas profundas y recarga.
- Probar tamaños de pantalla distintos y una conexión lenta simulada.
- Automatizar las comprobaciones repetibles que sean viables.

**Criterios de aceptación:**
- No hay errores críticos de JavaScript en los recorridos probados.
- Las imágenes tienen dimensiones apropiadas y texto alternativo cuando corresponda.
- Los controles principales son operables por teclado.
- Se registra el peso de los recursos y los resultados de rendimiento.
- Las limitaciones de las pruebas quedan documentadas; no se declaran pruebas como exitosas sin ejecutarlas.

### Fase 6 — Validación y publicación controlada

**Objetivo:** publicar una versión revisada y recuperable.

Tareas:
- Verificar metadatos, enlaces compartidos y configuración de GitHub Pages.
- Ejecutar pruebas de enlaces, rutas, contenido, accesibilidad y regresión.
- Confirmar que el despliegue corresponde al commit aprobado.
- Documentar configuración, despliegue, mantenimiento y recuperación.
- Preparar un Pull Request con resumen, pruebas, riesgos y pendientes.
- Solicitar aprobación humana antes de integrar cambios importantes en la rama principal.

**Entregables:** `docs/qa-portal.md`, guía editorial y Pull Request revisable.

**Criterios de aceptación:**
- Todas las comprobaciones obligatorias pasan o tienen una excepción documentada.
- La versión publicada corresponde al commit aprobado.
- Existe una guía para publicar y retirar contenido.
- Se ha probado el procedimiento de reversión.
- Las tareas pendientes y riesgos conocidos se comunican explícitamente.

## 6. Organización del trabajo multiagente en OpenCode

Los agentes deben trabajar con responsabilidades separadas. No deben modificar simultáneamente el mismo archivo.

| Rol | Responsabilidad | Entregable |
|---|---|---|
| Agente A — Auditor | Inspección de solo lectura, rutas, contenido pendiente, riesgos | `docs/auditoria-inicial.md` |
| Agente B — CMS | Investigación comparativa, arquitectura y modelo de contenido | `docs/decision-cms.md` y esquema |
| Agente C — Frontend | Diseño, navegación y componentes en archivos asignados | Cambios acotados y comprobables |
| Agente D — QA | Pruebas independientes de rutas, accesibilidad, permisos y publicación | `docs/qa-portal.md` |
| Integrador principal | Revisar diffs, resolver conflictos, ejecutar pruebas y validar criterios | Rama de trabajo y Pull Request |

### Protocolo de integración

1. El auditor trabaja primero y entrega sus hallazgos.
2. La arquitectura del CMS se decide antes de implementar la integración.
3. El frontend trabaja sobre tareas aprobadas y archivos asignados.
4. QA comprueba la versión candidata de forma independiente.
5. El integrador revisa cada diff, ejecuta las pruebas y registra resultados.
6. Se usan commits pequeños y descriptivos.
7. Los cambios se integran mediante Pull Request; no se modifica directamente `master` durante el trabajo.
8. Si una tarea requiere una decisión institucional, coste o credencial, se bloquea y se solicita aprobación.

### Formato obligatorio de cada tarea

- ID y fase.
- Objetivo.
- Archivos afectados.
- Dependencias.
- Pasos de implementación.
- Criterios de aceptación verificables.
- Pruebas ejecutadas y resultados reales.
- Riesgos y procedimiento de reversión.
- Estado: pendiente, en curso, bloqueada o terminada.

## 7. Criterios globales de finalización

- [ ] La identidad editorial se conserva y perfecciona.
- [ ] El sitio funciona en móvil y escritorio.
- [ ] Las páginas institucionales y comunitarias utilizan contenido aprobado.
- [ ] La biblioteca, noticias, anuncios, eventos y boletines funcionan según el alcance aprobado.
- [ ] Los responsables pueden gestionar contenido sin programar.
- [ ] El acceso al CMS está protegido y probado.
- [ ] No hay contenido oficial inventado ni marcadores de ejemplo publicados.
- [ ] Las imágenes y recursos están optimizados para conexiones lentas.
- [ ] Enlaces, rutas, accesibilidad y regresión tienen resultados documentados.
- [ ] La guía editorial y el procedimiento de reversión están disponibles.
- [ ] Los cambios llegan a `master` después de revisión y aprobación.
- [ ] Los costes, dependencias externas y limitaciones conocidas están documentados.

## 8. Primera ejecución autorizada

**Comenzar exclusivamente por la Fase 0.**

OpenCode debe inspeccionar el repositorio y entregar el informe de auditoría, las decisiones que requieren aprobación humana y una lista priorizada de tareas. No debe publicar cambios funcionales, modificar contenido oficial ni inventar información.

Una vez revisado el informe, continuar fase por fase con cambios pequeños, pruebas reproducibles y un Pull Request revisable.

---

## Estado del documento

Este README describe el plan y los criterios del proyecto; no implica que las fases ya se hayan implementado ni que las pruebas estén superadas. El estado real debe actualizarse a partir de evidencias del repositorio y de ejecuciones verificadas.
