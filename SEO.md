# SEO.md — Estrategia SEO del MVP

## Objetivo

Cada página pública es indexable, con metadata única, canonical, Open Graph y datos
estructurados. El admin y las áreas privadas quedan bloqueados.

## Implementado en el MVP

### Metadata dinámica (`generateMetadata`)
- **Ficha de producto** (`/product/[slug]`):
  - Title por defecto: `[Producto] — características, precio y comparación`
  - Sobrescribible desde el panel (campos `seoTitle` / `seoDescription`)
  - Canonical `/product/[slug]`, Open Graph con la imagen principal
- **Categorías** (`/rubbers`, `/blades`, `/tables`): títulos y descripciones únicos por categoría.
- **Comparación** (`/compare/[a]-vs-[b]`): metadata con los nombres de los productos
  comparados; canonical propia.

### Archivos de SEO
- `sitemap.ts` → `/sitemap.xml` dinámico: home, categorías activas, productos publicados.
  No incluye borradores, archivados ni páginas de admin.
- `robots.ts` → `/robots.txt`: permite todo el sitio salvo `/admin` y `/api`.

### Datos estructurados (Schema.org)
- `Product` en la ficha de producto (con `Brand`; `Offer` solo si existe precio real).
- `BreadcrumbList` implícito por la navegación de migas.
- `ItemList` en páginas de comparación.
- **Nunca** se emiten `AggregateRating` ni `Offer` inventados: solo con datos reales.

## Reglas

1. No indexar comparaciones generadas automáticamente sin contenido suficiente.
   (El MVP indexa la ficha y categorías; las comparaciones curadas llegarán en V1.)
2. Un solo title por página; nunca el mismo title para todos los productos.
3. Las imágenes usan `alt` descriptivo (nombre del producto).
4. URLs limpias y estables: el slug nunca cambia una vez publicado (archivar en vez de eliminar).

## Métricas (futuro)

- Google Search Console + sitemap.
- Seguimiento de impresiones/CTR por categoría y producto.
- En V1: páginas de marca y comparaciones curadas.
