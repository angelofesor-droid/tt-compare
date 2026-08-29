import prisma from "@/lib/prisma";
import { ProductStatus } from "@/generated/prisma/enums";

export interface SearchResults {
  query: string;
  products: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    categoryKey: string;
    image: { url: string; alt: string | null } | null;
  }[];
  brands: { name: string; slug: string; count: number }[];
  categories: { key: string; name: string; slug: string; count: number }[];
  total: number;
}

/**
 * Búsqueda global: productos (por nombre/marca/modelo), marcas y categorías.
 * MVP: ILIKE. Arquitectura lista para migrar a full-text sin tocar la capa de UI.
 */
export async function searchCatalog(query: string, limit = 12): Promise<SearchResults> {
  const q = query.trim();
  if (!q) return { query, products: [], brands: [], categories: [], total: 0 };

  const contains = { contains: q, mode: "insensitive" as const };

  const [products, brands, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: ProductStatus.PUBLISHED,
        OR: [{ name: contains }, { brand: { name: contains } }, { summary: contains }, { description: contains }],
      },
      include: {
        brand: true,
        category: true,
        images: { where: { isPrimary: true }, take: 1 },
      },
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
      take: limit,
    }),
    prisma.brand.findMany({
      where: { name: contains },
      include: { _count: { select: { products: { where: { status: ProductStatus.PUBLISHED } } } } },
      orderBy: { name: "asc" },
      take: 5,
    }),
    prisma.category.findMany({
      where: {
        OR: [{ name: contains }, { namePlural: contains }, { description: contains }],
      },
      include: { _count: { select: { products: { where: { status: ProductStatus.PUBLISHED } } } } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return {
    query: q,
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      brand: p.brand.name,
      categoryKey: p.category.key,
      image: p.images[0] ? { url: p.images[0].url, alt: p.images[0].alt } : null,
    })),
    brands: brands.map((b) => ({ name: b.name, slug: b.slug, count: b._count.products })),
    categories: categories.map((c) => ({ key: c.key, name: c.namePlural, slug: c.slug, count: c._count.products })),
    total: products.length + brands.length + categories.length,
  };
}
