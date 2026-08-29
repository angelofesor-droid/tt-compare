# ARCHITECTURE.md — Comparador de Equipamiento de Tenis de Mesa

> Documento vivo. Define la arquitectura del MVP y su estrategia de crecimiento.
> Última actualización: 2026-08-29 (Fase 1).

## 1. Visión

Plataforma web especializada en equipamiento de tenis de mesa (gomas, maderos, mesas)
que permite a un jugador: **encontrar → ver → filtrar → comparar → decidir**.

Se concibe como catálogo especializado + base de datos + comparador + guía de compra.
No es una tienda, ni un blog, ni una demo.

## 2. Principios rectores

1. **Construir primero el sistema, después llenarlo.** Agregar un producto nuevo NUNCA
   requiere modificar código.
2. **El producto es la entidad central**, independiente de la UI. Vive en PostgreSQL.
3. **Atributos dinámicos por categoría.** No todas las gomas/maderos/mesas comparten
   las mismas especificaciones; el esquema debe adaptarse.
4. **No inventar datos.** Falta información → "No disponible".
5. **Escalas de fabricante no son comparables entre sí** (9.2 ≠ 95). Se conservan valor
   original + escala + fuente.
6. **Imagen principal correcta y consistente** en todas las apariciones del producto.
7. **Simplicidad sobre "escalabilidad futura".** Se diseña para crecer sin sobre-ingeniería.
8. **Componentes Server por defecto**; poco JavaScript en cliente.

## 3. Stack tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Framework | Next.js (App Router) | SSR/SSG, Server Components, rutas, metadata SEO integrada |
| Lenguaje | TypeScript | Tipado en toda la pila |
| UI | React + Tailwind CSS | Componentes reutilizables, responsive mobile-first |
| Base de datos | PostgreSQL | Modelo relacional de productos/atributos robusto |
| ORM | Prisma | Migraciones, tipado generado, seed, DX |
| Validación | Zod | Schemas compartidos cliente/servidor |
| Testing | Vitest (unit/integration) + Playwright (E2E) | Cobertura del flujo crítico |
| Lint/Format | ESLint + Prettier (incluidos en Next.js) | Calidad consistente |

**Regla de dependencias:** antes de instalar un paquete, justificar por qué es necesario.
No se instalan decenas de paquetes.

## 4. Arquitectura por capas

```
┌─────────────────────────────────────────────────────────┐
│  CLIENTE (Navegador)                                    │
│  Mobile-first · Next.js Server/Client Components        │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  NEXT.JS (App Router)                                   │
│  │  RSC: catálogo, fichas, SEO (cargadas en servidor)   │
│  │  Server Actions: admin (crear/editar/publicar)       │
│  │  Route Handlers: búsqueda, comparación, sitemap      │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  SERVICE LAYER (lib/services)                           │
│  Lógica de negocio: productos, atributos, comparación,  │
│  slug, validaciones, reglas de publicación              │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  DATA LAYER (Prisma + PostgreSQL)                       │
│  Product · Category · Brand · Attribute · Image ·       │
│  Source · Price · Pros/Cons                             │
└─────────────────────────────────────────────────────────┘
```

- **Server Components**: catálogo, categorías, ficha de producto, comparación, SEO.
- **Server Actions**: operaciones del panel admin (crear, editar, publicar, archivar, duplicar).
- **Client Components** (solo donde hace falta interactividad): galería con zoom, filtros
  en vivo, comparador (selector), formularios admin, vista previa.

## 5. Rutas (App Router)

### Públicas
| Ruta | Página | Tipo |
|---|---|---|
| `/` | Homepage: qué es el sitio, categorías, destacados, recientes | RSC |
| `/rubbers` | Catálogo de gomas + filtros + orden | RSC + filtros cliente |
| `/blades` | Catálogo de maderos + filtros + orden | RSC + filtros cliente |
| `/tables` | Catálogo de mesas + filtros + orden | RSC + filtros cliente |
| `/product/[slug]` | Ficha completa del producto | RSC (generateMetadata) |
| `/compare` | Comparador (selección) | Client |
| `/compare/[slugA]-vs-[slugB]` | Comparación limpia + SEO | RSC |
| `/search?q=...` | Resultados de búsqueda | RSC |

### Administración (protegidas)
| Ruta | Página |
|---|---|
| `/admin` | Dashboard con métricas |
| `/admin/products` | Lista: buscar, filtrar, crear, editar, duplicar, archivar |
| `/admin/products/new` | Crear producto (formulario dinámico por categoría) |
| `/admin/products/[id]/edit` | Editar producto |
| `/admin/products/[id]/preview` | Vista previa pública |

**Protección admin:** en el MVP se usa un secreto de acceso simple vía middleware
(contraseña de admin en `.env`, sesión en cookie httpOnly firmada). Diseñado para
sustituirse por auth real (NextAuth) en V1 sin reescribir la UI.

## 6. Decisiones clave de diseño

### 6.1 Atributos dinámicos (EAV controlado)
Cada categoría tiene una lista de **definiciones de atributos** (`AttributeDefinition`):
`grosor`, `dureza`, `velocidad`, `spin`, `control`, `tackiness`, `peso`, `capas`,
`mango`, `indoor/outdoor`, etc. Cada atributo define su **tipo** (número, texto, enum,
booleano), **unidad**, **filtrable** (sí/no) y **orden**.

Los valores viven en `ProductAttributeValue`, con `value` (texto original),
`unit`, `scale`, `source` y `verifiedAt`.

**Consecuencia:** agregar un atributo nuevo o una categoría nueva (pelotas, zapatillas…)
= insertar filas en BD, sin tocar código. Los filtros se derivan de los atributos
marcados como filtrables.

### 6.2 Escalas de fabricante
Un mismo atributo (`velocidad`) puede valer `9.2` (escala 1–10 de Butterfly) o `95`
(escala 1–100 de otra marca). El sistema **nunca** compara valores crudos entre escalas
distintas. En la UI se muestra el valor original + la escala. Una escala interna
normalizada (si algún día existe) se guarda en campo separado, claramente identificada.

### 6.3 Imágenes
- `ProductImage` con `url`, `alt`, `width`, `height`, `source`, `type`, `isPrimary`, `sortOrder`.
- La imagen `isPrimary = true` se usa en TODAS las apariciones (home, categoría, búsqueda,
  comparación, ficha, relacionados). Regla de negocio: un producto PUBLISHED no puede
  existir sin imagen principal válida.
- Prioridad de fuente: fabricante → distribuidor autorizado → fuente confiable.
- Las URLs de imágenes se referencian (hotlink) o se descargan a `/public/images/products`
  según el caso; la fuente siempre se registra en `ProductSource`.
- Imágenes optimizadas con componente `next/image` (lazy loading, dimensiones, blur placeholder).

### 6.4 Comparación
- Solo se compara dentro de la misma categoría (goma vs goma, madero vs madero, mesa vs mesa).
- Selector en `/compare` (2 a 4 productos), tabla de atributos adaptada a la categoría,
  vista específica móvil (producto A vs B con tarjetas apiladas, no tabla comprimida).
- URL limpia e indexable solo cuando la comparación tiene contenido suficiente:
  `/compare/[a]-vs-[b]`.

### 6.5 Puntuación
- MVP: sin sistema de puntuación inventado.
- Si se muestra, se distingue explícitamente **valoración del fabricante**
  (escala del fabricante, con fuente) de **valoración editorial** (interna, con criterios
  publicados). No se mezclan.

### 6.6 Búsqueda
- MVP: `ILIKE` sobre nombre/marca/modelo (con índices `pg_trgm` si el volumen lo pide).
- Arquitectura preparada para migrar a búsqueda full-text (tsvector) o externa
  (Meilisearch/Typesense) sin cambiar la capa de servicio.

### 6.7 SEO
- `generateMetadata` en cada página pública: title, description, canonical, Open Graph.
- Schema.org: `Product`, `BreadcrumbList`, `ItemList`. `Offer`/`AggregateRating` solo con datos reales.
- `sitemap.ts` dinámico (categorías, productos publicados, comparaciones válidas).
- `robots.txt` bloqueando `/admin` y áreas privadas.

## 7. Estructura de carpetas

```
tt-compare/
├── app/
│   ├── layout.tsx / page.tsx        # Root + Homepage
│   ├── (shop)/                      # Rutas públicas
│   │   ├── rubbers/ blades/ tables/ # Catálogos por categoría
│   │   ├── product/[slug]/          # Ficha
│   │   ├── compare/                 # Selector + [slugA]-vs-[slugB]
│   │   └── search/
│   ├── admin/                       # Panel (protegido)
│   │   ├── layout.tsx               # Auth + nav admin
│   │   ├── page.tsx                 # Dashboard
│   │   ├── products/                # Lista, new, [id]/edit, [id]/preview
│   ├── sitemap.ts / robots.ts
│   └── api/                         # Route handlers si hacen falta
├── components/
│   ├── ui/                          # Botones, badges, inputs (reutilizables)
│   ├── product/                     # ProductCard, Gallery, SpecTable, ProsCons...
│   ├── compare/                     # ComparePicker, CompareTable, CompareMobile
│   ├── admin/                       # ProductForm, DynamicFields, ImagePicker...
│   └── layout/                      # Header, Footer, Nav, SearchBar
├── lib/
│   ├── db.ts                        # Cliente Prisma
│   ├── services/                    # product.service, attribute.service, compare.service, search.service, seo.service
│   ├── validations/                 # Schemas Zod (product, attribute, image, source)
│   └── utils/                       # slug, format, constants
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
│   └── images/products/
├── tests/                           # unit + integration
├── e2e/                             # Playwright
└── docs/                            # IMAGE-SOURCES.md, etc.
```

## 8. Escalabilidad (30 → 10.000+ productos)

- **Paginación** en catálogos y admin desde el día uno.
- **Índices DB**: `slug` (único), `categoryId`, `brandId`, `status`, `updatedAt`, `name` (trigram).
- **Consultas eficientes**: `select` explícito, `include` limitado, sin N+1 en grids.
- **Caché**: revalidación on-demand de Next.js (ISR) al publicar/editar; los datos
  públicos se sirven desde la caché de Next cuando aplica.
- **Componentes reutilizables**: ProductCard y tablas de specs son la misma pieza en
  catálogo, búsqueda, comparación y relacionados.
- **Agregar categoría nueva** = datos (fila en `Category` + `AttributeDefinition`s), no código.

## 9. Estrategia de crecimiento (sin romper el MVP)

- **V1**: auth real (NextAuth), usuarios/roles, reviews moderadas, ofertas/tiendas/afiliados,
  búsqueda full-text, precios manuales avanzados.
- **V2**: importación masiva, APIs públicas, historial/alertas de precios, recomendaciones
  por perfil de jugador, favoritos.
- La capa de datos ya reserva tablas para Store/Offer/AffiliateLink (ver DATABASE.md),
  de modo que incorporarlas no exige migraciones destructivas.

## 10. Definición de "hecho" por fase

Cada fase termina solo cuando: **tests ✓ · lint ✓ · typecheck ✓ · sin errores acumulados**.
Ver ROADMAP.md para el detalle.
