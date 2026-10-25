# Integración estática del CMS — piloto

## Qué implementa esta fase
- Un generador Node.js sin dependencias externas valida registros Markdown en `content/cms-pilot/`.
- Comprueba frontmatter básico, campos obligatorios, estados permitidos, formato/duplicados de slug y coincidencia entre slug y nombre de archivo.
- Solo exporta registros con estado `published`; borradores, elementos en revisión y archivados quedan excluidos.
- La salida es `preview/cms-content.json`.
- `preview/cms-pilot.html` consume el JSON con `fetch` y crea nodos con `textContent`, evitando interpretar el cuerpo editorial como HTML.

## Ejecutar localmente
Requiere Node.js moderno, sin instalar paquetes:

```sh
node scripts/build-cms-content.mjs
```

Después sirve la carpeta `preview/` con cualquier servidor estático local y abre `cms-pilot.html`. No uses `file://`, porque los navegadores suelen bloquear `fetch` desde archivos locales.

## Límites y seguridad
- Esta es una integración de prueba aislada. No se enlaza desde la web pública ni cambia la fuente de GitHub Pages.
- La colección actual contiene un registro ficticio en estado `draft`; por diseño el resultado público debe tener cero elementos.
- El campo `status: published` es una condición de exportación, no una autorización de seguridad. La aprobación real deberá aplicarse mediante revisión protegida de cambios y permisos del repositorio.
- El parser admite un subconjunto intencionalmente pequeño de YAML frontmatter; no pretende soportar YAML arbitrario ni todos los bloques que Pages CMS pueda generar. Si se requiere contenido enriquecido real, debe adoptarse un parser YAML/Markdown probado y fijar dependencias antes de ampliar el alcance.
- El cuerpo se muestra como texto plano en esta fase, no como HTML ni Markdown renderizado.
- No agregar datos reales ni fusionar a `master` hasta aprobar las pruebas de CMS y el flujo de revisión.

## Pruebas de aceptación
1. Ejecutar el generador con el registro ficticio: termina correctamente y exporta cero publicaciones.
2. Confirmar que un registro `draft` nunca aparece en `items`.
3. Cambiar temporalmente un slug a un valor inválido o duplicado: el proceso debe fallar con un mensaje claro.
4. Cambiar temporalmente el estado a un valor no permitido: el proceso debe fallar.
5. Añadir una publicación ficticia `published`: aparece en JSON; después revertir el cambio.
6. Abrir la vista previa desde servidor estático y comprobar estado vacío y contenido aprobado.
7. Confirmar que `master` y la publicación de producción no cambian.
