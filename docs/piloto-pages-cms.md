# Piloto técnico de Pages CMS — IERC

**Rama aislada:** `test/pages-cms-pilot`  
**Estado:** configuración preparada según la documentación pública de Pages CMS; pruebas reales de interfaz y permisos pendientes.  
**Regla de seguridad:** no fusionar esta rama con `master` ni configurar esta rama como fuente de publicación de la web pública.

## Qué se preparó

- `.pages.yml`: configuración inicial de Pages CMS con una sola colección ficticia.
- `content/cms-pilot/PRUEBA-TECNICA-NO-OFICIAL.md`: registro ficticio, marcado NO OFICIAL y en estado `draft`.
- `media/cms-pilot/`: destino aislado para medios de prueba.
- `.github/workflows/pages-cms-pilot-guard.yml`: control automático de alcance y estructura básica en pull requests.
- Este documento: lista de comprobaciones y criterios de aprobación.

La colección usa `slug` como nombre de archivo y valida que tenga formato de URL. El campo `status` solo es metadato editorial: **no impide por sí mismo la publicación**.

## Comprobaciones automáticas añadidas

El workflow de GitHub Actions debe ejecutarse en pull requests hacia `master` y comprobar:

1. Los cambios se limitan a los archivos permitidos para el piloto.
2. La configuración YAML se puede analizar.
3. La configuración declara una única colección `pilot_content` en `content/cms-pilot`.
4. La configuración no declara rutas de contenido de producción.

Estas comprobaciones no sustituyen abrir Pages CMS ni verificar sus permisos y su interfaz.

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

- [ ] El workflow automático pasa y limita los cambios al piloto.
- [ ] La aplicación reconoce el repositorio y la rama de prueba.
- [ ] Solo se ve la colección de piloto definida en `.pages.yml`.
- [ ] Leer, crear, editar y guardar funciona en la rama aislada.
- [ ] Los commits no llegan a `master`.
- [ ] Las operaciones con medios funcionan y se pueden revertir.
- [ ] Los permisos solicitados son aceptables y están documentados.
- [ ] Se demuestra cómo impedir publicación sin aprobación humana.
- [ ] La recuperación/revocación de acceso queda comprobada.
- [ ] Se confirma la configuración actual de GitHub Pages sin modificarla.
- [ ] Una persona responsable revisa las evidencias antes de decidir si continuar.

## Limitaciones conocidas

- El sitio actual está hecho con HTML estático; el CMS no conecta todavía el contenido editado con las páginas públicas.
- El workflow valida estructura y alcance, no prueba el editor web ni constituye una barrera completa contra publicación.
- No se ha autorizado la GitHub App desde esta operación; requiere iniciar sesión y consentir permisos en la interfaz.
- No se deben fusionar estos archivos de prueba con `master` hasta revisar el resultado y confirmar que no afectan a la publicación.

## Referencias de configuración

- [Documentación general de configuración](https://pagescms.org/docs/configuration/)
- [Colecciones y contenido](https://pagescms.org/docs/configuration/content/)
- [Campos y validación](https://pagescms.org/docs/configuration/content/fields/)
- [Campo select](https://pagescms.org/docs/configuration/fields/select/)

## Resultado

**Pendiente de pruebas manuales.** No declarar el CMS aprobado hasta completar la lista con evidencia.
