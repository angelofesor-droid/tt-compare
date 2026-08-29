import prisma from "@/lib/prisma";
import { ProductStatus } from "@/generated/prisma/enums";

export interface CatalogFilters {
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  // atributos dinámicos: { [attributeKey]: string[] } (valores de filtro)
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
    attributes: { key: string; name: string; options: { value: string; count: number }[] }[];
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

/**
 * Lista productos publicados con filtros dinámicos + paginación.
 * Los filtros se derivan de AttributeDefinition (filterable=true) de la categoría.
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

  // ── Construcción del WHERE dinámico ──
  const where: Record<string, unknown> = {
    status: ProductStatus.PUBLISHED,
    categoryId: category.id,
  };

  if (filters.brands && filters.brands.length > 0) {
    where.brand = { name: { in: filters.brands } };
  }

  // Filtros por atributos dinámicos
  if (filters.attributes && Object.keys(filters.attributes).length > 0) {
    const attrConditions = Object.entries(filters.attributes)
      .filter(([, vals]) => vals.length > 0)
      .map(([key, vals]) => ({
        attributes: {
          some: {
            attribute: { key },
            value: { in: vals },
          },
        },
      }));
    if (attrConditions.length > 0) where.AND = attrConditions;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { brand: { name: { contains: filters.search, mode: "insensitive" } } },
      { summary: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  // ── Orden ──
  const orderBy: Record<string, unknown>[] = (() => {
    switch (filters.sort) {
      case "name":
        return [{ name: "asc" }];
      case "price_asc":
        return [{ prices: { _count: "desc" } }, { updatedAt: "desc" }]; // fallback simple
      case "price_desc":
        return [{ updatedAt: "desc" }];
      default:
        return [{ updatedAt: "desc" }];
    }
  })();

  // ── Consulta principal ──
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        brand: true,
        category: true,
        images: { where: { isPrimary: true }, take: 1 },
        prices: { orderBy: { updatedAt: "desc" }, take: 1 },
        attributes: {
          include: { attribute: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  const mapped: CatalogItem[] = items.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    summary: p.summary,
    brand: { name: p.brand.name, slug: p.brand.slug },
    category: { key: p.category.key, name: p.category.name, slug: p.category.slug },
    image: p.images[0] ? { url: p.images[0].url, alt: p.images[0].alt } : null,
    price: p.prices[0] ? { amount: Number(p.prices[0].amount), currency: p.prices[0].currency } : null,
    attributes: p.attributes.map((a) => ({ key: a.attribute.key, value: a.value, unit: a.unit ?? a.attribute.unit ?? null, scale: a.scale ?? a.attribute.scaleName ?? null })),
  }));

  // ── Facetas: marcas y valores de atributos con conteos (para la UI de filtros) ──
  const brandFacets = await prisma.brand.findMany({
    where: { products: { some: { categoryId: category.id, status: ProductStatus.PUBLISHED } } },
    include: { _count: { select: { products: { where: { categoryId: category.id, status: ProductStatus.PUBLISHED } } } } },
    orderBy: { name: "asc" },
  });

  const attributeFacets = await Promise.all(
    category.attributeDefinitions.map(async (def) => {
      const rows = await prisma.productAttributeValue.groupBy({
        by: ["value"],
        where: {
          attributeId: def.id,
          product: { categoryId: category.id, status: ProductStatus.PUBLISHED },
        },
        _count: { _all: true },
        orderBy: { value: "asc" },
      });
      return {
        key: def.key,
        name: def.name,
        options: rows.map((r) => ({ value: r.value, count: r._count._all })),
      };
    }),
  );

  // Precio min/max
  const priceAgg = await prisma.productPrice.aggregate({
    _min: { amount: true },
    _max: { amount: true },
    where: { product: { categoryId: category.id, status: ProductStatus.PUBLISHED } },
  });

  return {
    items: mapped,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    filters: {
      brands: brandFacets.map((b) => ({
        id: b.id,
        name: b.name,
        count: b._count.products,
      })),
      attributes: attributeFacets.filter((a) => a.options.length > 0),
      priceRange: { min: priceAgg._min.amount ? Number(priceAgg._min.amount) : null, max: priceAgg._max.amount ? Number(priceAgg._max.amount) : null },
    },
  };
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
