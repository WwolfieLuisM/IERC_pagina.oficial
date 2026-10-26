# Piloto técnico de Pages CMS — IERC

**Rama aislada:** `test/pages-cms-pilot`  
**Estado (26 oct 2026):** pruebas manuales de interfaz completadas con evidencia en git; quedan 3 puntos marcados abajo (gate de aprobación, revocación y revisión humana).  
**Regla de seguridad:** no fusionar esta rama con `master` ni configurar esta rama como fuente de publicación de la web pública.

## Qué se preparó

- `.pages.yml`: configuración inicial de Pages CMS con una sola colección ficticia.
- `content/cms-pilot/prueba-tecnica-no-oficial.md`: registro ficticio, marcado NO OFICIAL y en estado `draft`.
- `media/cms-pilot/`: destino aislado para medios de prueba.
- `.github/workflows/pages-cms-pilot-guard.yml`: control automático de alcance y estructura básica en pull requests.
- Este documento: lista de comprobaciones y criterios de aprobación.

La colección usa `slug` como nombre de archivo y valida que tenga formato de URL. El campo `status` solo es metadato editorial: **no impide por sí mismo la publicación**.

## Resultado de CI verificado

- **Workflow:** Pages CMS pilot guard
- **Ejecución:** [#2](https://github.com/WwolfieLuisM/IERC_pagina.oficial/actions/runs/40179229059)
- **Commit revisado:** `9fb7592c0884681757dd32750621a15676422650`
- **Resultado:** `success`
- **Pasos aprobados:** checkout, control de rutas permitidas, análisis del YAML y comprobación de aislamiento.

Esto confirma que el workflow se ejecutó correctamente para ese commit y que las comprobaciones implementadas pasaron. **No** confirma que Pages CMS funcione en el navegador, que sus permisos sean correctos o que exista una barrera de publicación.

## Pasos manuales obligatorios

1. Abrir [Pages CMS](https://app.pagescms.org/) e iniciar sesión con GitHub.
2. Revisar los permisos solicitados e instalar/autorizar la GitHub App **solo para este repositorio**, si esa opción está disponible.
3. Abrir `WwolfieLuisM/IERC_pagina.oficial` y seleccionar explícitamente `test/pages-cms-pilot`.
4. Confirmar que aparece la colección **Contenido de prueba (NO OFICIAL)** y el registro de prueba.
5. Cambiar título/resumen, guardar y verificar que el commit cae en `test/pages-cms-pilot`, no en `master`.
6. Crear otro registro ficticio, editarlo y eliminarlo; confirmar los cambios en GitHub.
7. Subir una imagen no sensible de prueba, verificar ruta y visualización, y después retirarla de la rama.
8. Cerrar sesión y volver a entrar. Comprobar qué personas con acceso al repositorio pueden editar.
9. Verificar si existe un flujo real de aprobación antes de que los cambios alcancen la rama publicada. No confiar solo en `status`.
10. Confirmar en GitHub Settings → Pages cuál es la fuente de publicación actual. No modificarla durante este piloto.
11. Verificar que retirar el acceso de Pages CMS no impide al propietario administrar el repositorio desde GitHub.
12. No introducir contenido, fotos, audios, contactos, horarios ni datos personales reales de la congregación.

## Criterios de aprobación

- [x] El workflow automático pasa y limita los cambios al piloto.
- [x] La aplicación reconoce el repositorio y la rama de prueba.
- [x] Solo se ve la colección de piloto definida en `.pages.yml`.
- [x] Leer, crear, editar y guardar funciona en la rama aislada.
- [x] Los commits no llegan a `master`.
- [x] Las operaciones con medios funcionan y se pueden revertir.
- [x] Los permisos solicitados son aceptables y están documentados (ver hallazgos 1 y 2; el usuario aceptó el alcance `repo` total el 26 oct 2026).
- [ ] Se demuestra cómo impedir publicación sin aprobación humana → **no existe todavía**: `master` tiene `protected=false` (hallazgo 3). Requiere protección de rama (Fase 4).
- [ ] La recuperación/revocación de acceso queda comprobada → pendiente: probar la revocación en `github.com/settings/applications` e `settings/installations` como último paso antes de aprobar.
- [x] Se confirma la configuración actual de GitHub Pages sin modificarla (API 26 oct 2026: rama `master`, ruta `/`, estado `built`).
- [ ] Una persona responsable revisa las evidencias antes de decidir si continuar.

## Evidencias y hallazgos — 26 oct 2026

Pasos manuales 1–7 y 10–12 ejecutados con la cuenta `WwolfieLuisM`:

- **Pasos 1–4 (acceso y selección):** sesión iniciada con GitHub; la app muestra únicamente la colección de piloto y el registro de prueba en `test/pages-cms-pilot`.
- **Paso 5 (edición):** `24aeb32` «Update … (via Pages CMS)» en `test/pages-cms-pilot`; `master` sin cambios.
- **Paso 6 (crear/editar/borrar):** `066f2d2` (Create) → `43cdce2` (Update) → `5281793` (Delete); todos en la rama aislada.
- **Paso 7 (medios):** `555a697` (Create `media/cms-pilot/piloto-prueba.png`, 70 B) → visualizada desde `raw.githubusercontent` → `f1e891e` (Delete).
- **Paso 8 (quién edita):** colaboradores del repositorio: solo `WwolfieLuisM` (admin). La reentrada de sesión no se probó.
- **Paso 10 (fuente de Pages):** rama `master`, ruta `/`, estado `built` — sin modificar.
- **Paso 12:** todo el contenido usado fue ficticio; ningún dato real introducido.

### Hallazgos

1. **Permisos amplios (riesgo aceptado por el propietario):** el inicio de sesión OAuth pide el alcance `repo` (`read:user user:email repo user:email`), es decir lectura/escritura de **todos** los repos de la cuenta; no se puede limitar a un solo repositorio en esa pantalla. Además hay una instalación de GitHub App (id `175067021`); en el panel solo aparecen repositorios públicos. Revocar en `github.com/settings/applications` y `github.com/settings/installations`.
2. **`master` sin protección de rama:** los commits del CMS llegan directamente a la rama que se seleccione. **No hay ningún gate de aprobación real** — el campo `status` no protege nada. La protección de rama / reglas de PR es requisito previo a conectar contenido oficial (Fase 4).
3. **Nombre de archivo vs campo `slug`:** al crear un registro, Pages CMS generó `registro-ficticio-de-prueba-borrar.md` (derivado del título) mientras el campo `slug` quedó como `registro-ficticio-borrar`; el validador de `scripts/build-cms-content.mjs` rechazaría esa discrepancia. Tenerlo en cuenta antes de ampliar colecciones.
4. El registro de prueba conserva en el frontmatter de la rama del piloto el título editado «(edición piloto 26 oct)»; es contenido ficticio en una rama de pruebas.

## Limitaciones conocidas

- El sitio actual está hecho con HTML estático; el CMS no conecta todavía el contenido editado con las páginas públicas.
- El workflow valida estructura y alcance, no prueba el editor web ni constituye una barrera completa contra publicación.
- La GitHub App/OAuth **sí fue autorizada** el 26 oct 2026 (con el alcance `repo` completo, ver hallazgos). La revocación sigue pendiente de probar.
- No se deben fusionar estos archivos de prueba con `master` hasta revisar el resultado y confirmar que no afectan a la publicación.

## Referencias de configuración

- [Documentación general de configuración](https://pagescms.org/docs/configuration/)
- [Colecciones y contenido](https://pagescms.org/docs/configuration/content/)
- [Campos y validación](https://pagescms.org/docs/configuration/content/fields/)
- [Campo select](https://pagescms.org/docs/configuration/fields/select/)

## Resultado

**Interfaz, ramas, medios y permisos verificados con evidencia en git; CIERRE PENDIENTE de 3 puntos:** gate de aprobación (protección de rama), prueba de revocación y revisión humana de las evidencias. No declarar el CMS aprobado hasta completar la lista.
