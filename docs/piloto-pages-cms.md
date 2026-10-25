# Piloto técnico de Pages CMS — IERC

**Rama aislada:** `test/pages-cms-pilot`  
**Estado:** configuración inicial preparada; pruebas de interfaz y permisos pendientes.  
**Regla de seguridad:** no fusionar esta rama con `master` ni configurar esta rama como fuente de publicación de la web pública.

## Qué se preparó

- `.pages.yml`: configuración inicial de Pages CMS.
- `content/cms-pilot/PRUEBA-TECNICA-NO-OFICIAL.md`: registro deliberadamente ficticio en estado `draft`.
- `media/cms-pilot/`: destino previsto para medios de prueba; no contiene medios reales.
- Este documento: lista de comprobaciones y resultados que deben anotarse.

La configuración solo permite editar la colección de prueba. No expone las páginas HTML actuales ni transforma automáticamente los archivos HTML en contenido administrable. La conexión entre contenido y frontend queda fuera de este piloto inicial.

## Pasos manuales obligatorios

1. Abrir [Pages CMS](https://app.pagescms.org/) e iniciar sesión con GitHub.
2. Instalar/autorizar la GitHub App **solo para este repositorio** si la pantalla lo permite; revisar los permisos solicitados antes de aceptar.
3. Abrir `WwolfieLuisM/IERC_pagina.oficial` y seleccionar explícitamente la rama `test/pages-cms-pilot`.
4. Confirmar que aparece la colección **Contenido de prueba (NO OFICIAL)** y el registro de prueba.
5. Cambiar el título/resumen del registro, guardarlo y verificar que el commit cae en `test/pages-cms-pilot`, no en `master`.
6. Probar crear otro registro ficticio, editarlo y retirarlo/eliminarlo; confirmar el comportamiento en GitHub.
7. Subir una imagen no sensible de prueba, verificar ruta y visualización; después retirarla de la rama de prueba.
8. Cerrar sesión y volver a entrar. Comprobar qué personas con acceso al repositorio pueden editar.
9. Revisar si el CMS puede obligar a pasar por revisión/PR antes de publicar. No asumir que el campo `status` impide por sí mismo que un archivo se publique.
10. Confirmar en GitHub Settings → Pages cuál es la rama/carpeta realmente publicada. No cambiar esa configuración como parte de esta prueba.
11. Probar recuperación: cerrar acceso a la app o retirar permisos de prueba si procede y verificar que el repositorio sigue siendo editable desde GitHub por su propietario.
12. No introducir contenido, fotos, audios, contactos, horarios ni datos personales reales de la congregación.

## Criterios de aprobación

- [ ] La aplicación reconoce el repositorio y la rama de prueba.
- [ ] Solo se ve la colección de piloto definida en `.pages.yml`.
- [ ] Leer, crear, editar y guardar funciona en la rama aislada.
- [ ] Los commits no llegan a `master`.
- [ ] Las operaciones con medios funcionan y se pueden revertir.
- [ ] Los permisos solicitados son aceptables y están documentados.
- [ ] Se entiende cómo impedir publicación sin aprobación humana.
- [ ] La recuperación/revocación de acceso queda comprobada.
- [ ] Se confirma la configuración actual de GitHub Pages sin modificarla.
- [ ] El resultado final lo revisa una persona responsable antes de decidir si continuar.

## Limitaciones conocidas

- El sitio actual está hecho con HTML estático; esta configuración no conecta todavía el contenido editado con las páginas públicas.
- El campo editorial `status` es metadato, no una barrera de seguridad por sí solo.
- El piloto no demuestra que Pages CMS tenga roles de aprobación suficientes; hay que verificar el flujo real en la interfaz.
- No se ha autorizado ni instalado la GitHub App desde esta operación. Eso requiere iniciar sesión y consentir permisos en la interfaz de Pages CMS.

## Resultado

**Pendiente de pruebas manuales.** No declarar el CMS aprobado hasta completar la lista anterior con evidencia.
