# IMAGE-SOURCES.md — Política de imágenes del catálogo

## Regla crítica

> **Cada producto publicado debe tener UNA imagen principal correcta.**
> La imagen debe corresponder EXACTAMENTE al modelo. No se usan imágenes genéricas,
> de productos similares, incorrectas ni inventadas.

## Prioridad de fuentes

1. **Fabricante** (sitio oficial / catálogo del fabricante)
2. **Distribuidor autorizado** (tienda oficial del fabricante o distribuidor mayorista)
3. **Fuente confiable** (tiendas especializadas reconocidas) — solo cuando no exista lo anterior

## Proceso para agregar imagen de un producto

1. Buscar la imagen en la fuente de mayor prioridad disponible.
2. Confirmar que el modelo mostrado coincide EXACTAMENTE (marca, modelo, color si aplica).
3. Guardar la URL de la imagen y la URL de la página fuente en el formulario admin.
4. Marcar la imagen como **principal** (`isPrimary`).
5. Registrar la fuente (fabricante/distribuidor/confiable) — campo obligatorio de contexto.

## Lo que NO se hace

- ❌ Descargar imágenes de Google Imágenes sin verificar la fuente.
- ❌ Reutilizar la imagen de un modelo similar ("se parece").
- ❌ Imágenes de renders genéricos o placeholders en producción.
- ❌ URL sin registrar su origen.
- ❌ Imágenes de baja resolución/recortadas si existe una mejor.

## Notas técnicas

- El sistema soporta múltiples imágenes por producto (galería) y una `isPrimary`
  que se usa en TODAS las apariciones (card, catálogo, búsqueda, comparación, ficha).
- `next/image` optimiza y sirve las imágenes; el hostname remoto debe ser `https`
  (configurado con `remotePatterns` en `next.config.ts`).
- Las imágenes demo del seed usan placeholders y están **explícitamente marcadas** como demo.

## Revisión (producción)

Antes de publicar un producto nuevo, un humano (o proceso de QA) debe confirmar:
- [ ] La imagen corresponde al modelo exacto
- [ ] La fuente está registrada y es correcta
- [ ] El alt text describe el producto
