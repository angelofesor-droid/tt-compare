# DATABASE.md — Modelo de datos

> Define el esquema PostgreSQL del comparador de equipamiento de tenis de mesa.
> Versión: MVP (Fase 1). Última actualización: 2026-08-29.

## 1. Diagrama de entidades

```
Category 1───n Product n───1 Brand
                │
                ├──n ProductImage
                ├──n ProductAttributeValue n───1 AttributeDefinition n───1 Category
                ├──n ProductSource
                ├──n ProductProsCons
                └──n ProductPrice

Futuro (diseñado, no implementado):
Product n───n Store ─── Offer ─── AffiliateLink
```

## 2. Convenciones

- Nombres en inglés, snake_case (Prisma lo mapea automáticamente).
- `id`: `String` UUID v7 (ordenable) generado por la app (o `cuid()` de Prisma).
  Evitamos `cuid` de Prisma en favor de UUID v7 para orden cronológico estable.
- `createdAt`/`updatedAt` automáticos con `@updatedAt`.
- **Soft delete**: los productos se archivan (`ARCHIVED`), nunca se eliminan físicamente,
  para no romper comparaciones ni URLs históricas.
- Todo texto multilínea usa `text` (no `varchar(255)`).
- Regla de oro: **no se inventa información**; campos sin dato quedan NULL y la UI
  muestra "No disponible".

## 3. Modelo

### 3.1 Category

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| key | TEXT UNIQUE | `RUBBER` \| `BLADE` \| `TABLE` (identificador interno estable) |
| name | TEXT | Nombre singular para UI: "Goma", "Madero", "Mesa" |
| namePlural | TEXT | "Gomas", "Maderos", "Mesas" |
| slug | TEXT UNIQUE | `rubbers`, `blades`, `tables` |
| description | TEXT | Breve para página de categoría / SEO |
| sortOrder | INT | Orden en navegación |
| status | TEXT | `ACTIVE` \| `HIDDEN` |

> Agregar categoría nueva (pelotas, zapatillas, paletas, pegamentos, fundas, robots,
> accesorios, ropa) = insertar una fila + sus `AttributeDefinition`s. Sin código.

### 3.2 Brand

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| name | TEXT UNIQUE | "Butterfly", "DHS", "Stiga", "Joola", "Andro", "Tibhar"… |
| slug | TEXT UNIQUE | `butterfly` |
| country | TEXT NULL | Origen |
| website | TEXT NULL | Sitio oficial |
| logoUrl | TEXT NULL | |

### 3.3 AttributeDefinition

Define **qué atributos existen por categoría** y cómo se muestran/filtran.

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| categoryId | FK Category | El atributo pertenece a una categoría |
| key | TEXT | `thickness`, `hardness`, `speed`, `spin`, `control`, `tackiness`, `weight`, `layers`, `handle`, `indoorOutdoor`, `certification`… |
| name | TEXT | Etiqueta UI: "Grosor", "Dureza", "Velocidad"… |
| type | TEXT | `NUMBER` \| `TEXT` \| `ENUM` \| `BOOLEAN` |
| unit | TEXT NULL | "mm", "g", "°"… |
| options | JSONB NULL | Para `ENUM`: `["FL", "ST", "AN"]` |
| scaleName | TEXT NULL | Nombre de la escala si aplica: "Escala fabricante 1–10" |
| filterable | BOOLEAN | ¿Aparece como filtro en catálogo? |
| comparable | BOOLEAN | ¿Aparece en tabla de comparación? |
| showOnCard | BOOLEAN | ¿Se muestra en la ProductCard? |
| sortOrder | INT | Orden de aparición en ficha/formulario |

`UNIQUE(categoryId, key)`.

### 3.4 Product

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| name | TEXT | "Butterfly Dignics 05" |
| slug | TEXT UNIQUE | `butterfly-dignics-05`, editable por admin, generado automático |
| brandId | FK Brand | |
| categoryId | FK Category | |
| summary | TEXT NULL | 1–2 líneas de descripción corta (card, meta) |
| description | TEXT NULL | Descripción completa con fuentes |
| status | TEXT | `DRAFT` \| `PUBLISHED` \| `ARCHIVED` (default `DRAFT`) |
| publishedAt | TIMESTAMPTZ NULL | |
| featured | BOOLEAN | ¿Destacado en homepage? |
| seoTitle | TEXT NULL | Si vacío, se genera |
| seoDescription | TEXT NULL | Si vacío, se genera |
| createdAt / updatedAt | | automáticos |

Reglas:
- **PUBLISHED exige**: nombre, categoría, marca, slug único, ≥1 imagen con `isPrimary`,
  y fuente oficial (ProductSource).
- Un slug duplicado al publicar → error de validación claro.

### 3.5 ProductImage

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| productId | FK Product | |
| url | TEXT | URL de la imagen (local o remota) |
| alt | TEXT | Alt text descriptivo (accesibilidad + SEO) |
| width / height | INT NULL | Para `next/image` (evita CLS) |
| source | TEXT | Origen de la imagen (fabricante, distribuidor…) |
| sourceUrl | TEXT NULL | URL de donde se obtuvo |
| type | TEXT | `PRODUCT` \| `LOGO` \| `DIAGRAM`… |
| isPrimary | BOOLEAN | Exactamente una por producto |
| sortOrder | INT | Orden en galería |

Regla de negocio: cambiar `isPrimary` de una imagen desmarca automáticamente a las demás
del mismo producto (transacción). La imagen principal se usa en **todas** las apariciones.

### 3.6 ProductAttributeValue

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| productId | FK Product | |
| attributeId | FK AttributeDefinition | |
| value | TEXT | **Valor original tal cual lo publica el fabricante** |
| unit | TEXT NULL | Sobrescribe la unidad de la definición si difiere |
| scale | TEXT NULL | Nombre de escala: "Escala Butterfly 1–10" |
| source | TEXT NULL | "Fabricante", "Distribuidor"… |
| verifiedAt | TIMESTAMPTZ NULL | Fecha de verificación |
| sortOrder | INT | |

`UNIQUE(productId, attributeId)` — un valor por atributo por producto.

**Clave anti-error:** `value` se guarda como texto crudo. `95` (escala 1–100) y `9.2`
(escala 1–10) conviven sin compararse nunca de forma directa. La comparación agrupa por
atributo y muestra cada valor con su escala. Si en el futuro existe una escala normalizada
interna, se agrega una columna `valueNormalized` **separada**, documentada como interna.

### 3.7 ProductSource

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| productId | FK Product | |
| type | TEXT | `MANUFACTURER` \| `AUTHORIZED_DISTRIBUTOR` \| `RELIABLE` |
| name | TEXT | "Sitio oficial Butterfly" |
| url | TEXT | URL real (nunca inventada) |
| consultedAt | TIMESTAMPTZ | Fecha de consulta |

### 3.8 ProductProsCons

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| productId | FK Product | |
| type | TEXT | `PRO` \| `CON` |
| text | TEXT | Frase corta |
| sortOrder | INT | |

### 3.9 ProductPrice (manual en MVP)

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| productId | FK Product | |
| amount | DECIMAL(12,2) | Precio |
| currency | TEXT | `CLP`, `USD`, `EUR`… |
| source | TEXT NULL | "Precio referencial manual" |
| updatedAt | TIMESTAMPTZ | Fecha de actualización |

MVP: solo precio manual. El esquema ya permite migrar a múltiples ofertas por tienda
(Fase futura) sin romper nada.

## 4. Índices

| Índice | Justificación |
|---|---|
| `Product.slug` UNIQUE | Lookup de ficha y comparación |
| `Product(categoryId, status)` | Catálogos por categoría |
| `Product(status, updatedAt)` | Recientes / destacados |
| `Product(brandId)` | Filtros por marca |
| `ProductAttributeValue(productId)` | Carga de ficha sin N+1 |
| `ProductAttributeValue(attributeId)` | Filtros por atributo |
| `ProductImage(productId, isPrimary)` | Imagen principal |
| `Brand.name` / `Category.slug` | Lookups de UI |

## 5. Seed (Fase 3/64)

- **Seed de desarrollo**: categorías + definiciones de atributos (RUBBER/BLADE/TABLE) +
  2–3 productos demo por categoría **claramente marcados como demo** (badge "Demo",
  prefijo en nombre o campo `source` especial).
- **Catálogo real**: solo información verificable, con `ProductSource` real.
  Ver docs/IMAGE-SOURCES.md para el proceso de imágenes.
- `npm run db:seed` es idempotente (upsert por slug/key).

## 6. Migraciones

- Flujo: editar `prisma/schema.prisma` → `npx prisma migrate dev --name <cambio>` →
  commit de la migración generada.
- En producción: `npx prisma migrate deploy`.
- Nunca editar migraciones ya aplicadas; se crea una nueva.
