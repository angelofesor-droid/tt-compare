import prisma from "@/lib/prisma";
import { ProductStatus } from "@/generated/prisma/enums";
import { normalizeAttribute, FILTERABLE_KEYS, normalizeHardness } from "@/lib/normalize";

export interface CatalogFilters {
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  // atributos dinámicos: { [attributeKey]: string[] } (valores de bucket normalizados)
  attributes?: Record<string, string[]>;
  search?: string;
  sort?: "recent" | "price_asc" | "price_desc" | "name";
  page?: number;
  pageSize?: number;
}

export interface CatalogResult {
  items: CatalogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters: {
    brands: { id: string; name: string; count: number }[];
    attributes: { key: string; name: string; options: { value: string; count: number; china?: boolean }[] }[];
    priceRange: { min: number | null; max: number | null };
  };
}

export interface CatalogItem {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  brand: { name: string; slug: string };
  category: { key: string; name: string; slug: string };
  image: { url: string; alt: string | null } | null;
  price: { amount: number; currency: string } | null;
  attributes: { key: string; value: string; unit: string | null; scale: string | null }[];
}

interface RawProduct {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  brand: { name: string; slug: string };
  category: { key: string; name: string; slug: string };
  image: { url: string; alt: string | null } | null;
  price: { amount: number; currency: string } | null;
  attributes: { key: string; value: string; unit: string | null; scale: string | null }[];
  // mapa de valores normalizados por clave de atributo
  normalized: Record<string, string>;
}

/**
 * Lista productos publicados con filtros dinámicos + paginación.
 * Los valores de atributo se normalizan a buckets estándar (ver normalize.ts) para
 * poder comparar escalas distintas de fabricante. El filtrado de atributos y las
 * facetas se calculan sobre los valores normalizados.
 */
export async function getCatalog(categoryKey: string, filters: CatalogFilters = {}): Promise<CatalogResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(60, Math.max(1, filters.pageSize ?? 24));

  const category = await prisma.category.findUnique({
    where: { slug: categoryKey },
    include: {
      attributeDefinitions: { where: { filterable: true }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!category) throw new Error(`Categoría no encontrada: ${categoryKey}`);

  // ── Trae TODOS los productos de la categoría (catálogo ~200) y filtra en memoria ──
  const where: Record<string, unknown> = {
    status: ProductStatus.PUBLISHED,
    categoryId: category.id,
  };
  if (filters.brands && filters.brands.length > 0) {
    where.brand = { name: { in: filters.brands } };
  }
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { brand: { name: { contains: filters.search, mode: "insensitive" } } },
      { summary: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const dbProducts = await prisma.product.findMany({
    where,
    include: {
      brand: true,
      category: true,
      images: { where: { isPrimary: true }, take: 1 },
      prices: { orderBy: { updatedAt: "desc" }, take: 1 },
      attributes: { include: { attribute: true } },
    },
  });

  // Mapeo a forma normalizada
  let products: RawProduct[] = dbProducts.map((p) => {
    const attrs = p.attributes.map((a) => ({
      key: a.attribute.key,
      value: a.value,
      unit: a.unit ?? a.attribute.unit ?? null,
      scale: a.scale ?? a.attribute.scaleName ?? null,
    }));
    const normalized: Record<string, string> = {};
    for (const a of attrs) {
      const n = normalizeAttribute(a.key, a.value, a.scale);
      if (n) normalized[a.key] = n;
    }
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      summary: p.summary,
      brand: { name: p.brand.name, slug: p.brand.slug },
      category: { key: p.category.key, name: p.category.name, slug: p.category.slug },
      image: p.images[0] ? { url: p.images[0].url, alt: p.images[0].alt } : null,
      price: p.prices[0] ? { amount: Number(p.prices[0].amount), currency: p.prices[0].currency } : null,
      attributes: attrs,
      normalized,
    };
  });

  // Filtrado por atributos normalizados
  if (filters.attributes) {
    for (const [key, vals] of Object.entries(filters.attributes)) {
      if (!vals || vals.length === 0) continue;
      products = products.filter((p) => {
        const n = p.normalized[key];
        return n != null && vals.includes(n);
      });
    }
  }

  // ── Orden ──
  const sorted = [...products];
  switch (filters.sort) {
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "price_asc":
      sorted.sort((a, b) => (a.price?.amount ?? Infinity) - (b.price?.amount ?? Infinity));
      break;
    case "price_desc":
      sorted.sort((a, b) => (b.price?.amount ?? -Infinity) - (a.price?.amount ?? -Infinity));
      break;
    default:
      sorted.sort((a, b) => (b.id > a.id ? 1 : -1)); // ~ reciente
  }

  // ── Paginación ──
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const items = sorted.slice((page - 1) * pageSize, page * pageSize).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    summary: p.summary,
    brand: p.brand,
    category: p.category,
    image: p.image,
    price: p.price,
    attributes: p.attributes,
  }));

  // ── Facetas: marca + atributos normalizados ──
  const brands = new Map<string, { id: string; name: string; count: number }>();
  for (const p of dbProducts) {
    const b = brands.get(p.brand.name) ?? { id: p.brand.id, name: p.brand.name, count: 0 };
    b.count++;
    brands.set(p.brand.name, b);
  }

  const attributeFacets: CatalogResult["filters"]["attributes"] = [];
  const defsByName = new Map(category.attributeDefinitions.map((d) => [d.key, d]));
  for (const key of FILTERABLE_KEYS) {
    const def = defsByName.get(key);
    if (!def) continue;
    const counts = new Map<string, number>();
    const chinaSet = new Map<string, boolean>();
    for (const p of dbProducts) {
      const val = p.attributes.find((a) => a.attribute.key === key);
      if (!val) continue;
      if (key === "hardness") {
        const h = normalizeHardness(val.value, val.scale);
        if (!h) continue;
        counts.set(h.value, (counts.get(h.value) ?? 0) + 1);
        if (h.china) chinaSet.set(h.value, true);
      } else {
        const n = normalizeAttribute(key, val.value, val.scale);
        if (!n) continue;
        counts.set(n, (counts.get(n) ?? 0) + 1);
      }
    }
    const options = Array.from(counts.entries())
      .map(([value, count]) => ({ value, count, ...(key === "hardness" && chinaSet.get(value) ? { china: true } : {}) }))
      .sort((a, b) => sortBucket(key, a.value, b.value));
    if (options.length > 0) {
      attributeFacets.push({ key, name: def.name, options });
    }
  }

  // Precio min/max
  const priceAgg = await prisma.productPrice.aggregate({
    _min: { amount: true },
    _max: { amount: true },
    where: { product: { categoryId: category.id, status: ProductStatus.PUBLISHED } },
  });

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
    filters: {
      brands: Array.from(brands.values()).sort((a, b) => a.name.localeCompare(b.name)),
      attributes: attributeFacets,
      priceRange: { min: priceAgg._min.amount ? Number(priceAgg._min.amount) : null, max: priceAgg._max.amount ? Number(priceAgg._max.amount) : null },
    },
  };
}

/** Ordena los buckets de cada atributo de forma natural (numérico o texto). */
function sortBucket(key: string, a: string, b: string): number {
  const na = parseFloat(a);
  const nb = parseFloat(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) {
    // "2.0 Max" va después de 2.0
    if (a === "2.0 Max") return 1;
    if (b === "2.0 Max") return -1;
    return na - nb;
  }
  return a.localeCompare(b);
}

/** Productos relacionados: misma categoría, similar marca, excluyendo el actual */
export async function getRelatedProducts(productId: string, categoryId: string, brandId: string, limit = 4) {
  return prisma.product.findMany({
    where: {
      status: ProductStatus.PUBLISHED,
      categoryId,
      id: { not: productId },
      OR: [{ brandId }, { featured: true }],
    },
    include: {
      brand: true,
      images: { where: { isPrimary: true }, take: 1 },
      prices: { orderBy: { updatedAt: "desc" }, take: 1 },
    },
    orderBy: [{ brandId: brandId ? "desc" : "asc" }, { updatedAt: "desc" }],
    take: limit,
  });
}

/** Destacados + recientes para homepage */
export async function getHomepageProducts() {
  const [featured, recent, categories] = await Promise.all([
    prisma.product.findMany({
      where: { status: ProductStatus.PUBLISHED, featured: true },
      include: { brand: true, images: { where: { isPrimary: true }, take: 1 }, prices: { orderBy: { updatedAt: "desc" }, take: 1 } },
      take: 6,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.product.findMany({
      where: { status: ProductStatus.PUBLISHED },
      include: { brand: true, images: { where: { isPrimary: true }, take: 1 }, prices: { orderBy: { updatedAt: "desc" }, take: 1 } },
      take: 8,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.category.findMany({
      where: { status: "ACTIVE" },
      include: {
        _count: { select: { products: { where: { status: ProductStatus.PUBLISHED } } } },
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]);
  return { featured, recent, categories };
}
