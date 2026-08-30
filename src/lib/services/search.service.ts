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

interface FullTextRow {
  id: string;
  name: string;
  slug: string;
  brand_name: string;
  category_key: string;
  img_url: string | null;
  img_alt: string | null;
}

/**
 * Búsqueda global con PostgreSQL FULL-TEXT (tsvector + websearch_to_tsquery + ts_rank).
 * Tolerante a errores de escritura y a variaciones ("dignics" -> "Dignics 09C"),
 * con resultados ordenados por relevancia. Marcas y categorías por ILIKE.
 */
export async function searchCatalog(query: string, limit = 12): Promise<SearchResults> {
  const q = query.trim();
  if (!q) return { query, products: [], brands: [], categories: [], total: 0 };

  // Productos por full-text con ranking de relevancia (incluye la imagen primaria)
  const rows = (await prisma.$queryRaw`
    SELECT
      p.id, p.name, p.slug,
      b.name AS brand_name,
      c.key AS category_key,
      pi.url AS img_url, pi.alt AS img_alt,
      ts_rank(
        to_tsvector('spanish', coalesce(p.name,'') || ' ' || coalesce(p.summary,'')),
        websearch_to_tsquery('spanish', ${q})
      ) AS rank
    FROM "Product" p
    JOIN "Brand" b ON b.id = p."brandId"
    JOIN "Category" c ON c.id = p."categoryId"
    LEFT JOIN "ProductImage" pi ON pi."productId" = p.id AND pi."isPrimary" = true
    WHERE p.status = 'PUBLISHED'
      AND to_tsvector('spanish', coalesce(p.name,'') || ' ' || coalesce(p.summary,''))
        @@ websearch_to_tsquery('spanish', ${q})
    ORDER BY rank DESC, p."updatedAt" DESC
    LIMIT ${limit}
  `) as FullTextRow[];

  const contains = { contains: q, mode: "insensitive" as const };

  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({
      where: { name: contains },
      include: { _count: { select: { products: { where: { status: ProductStatus.PUBLISHED } } } } },
      orderBy: { name: "asc" },
      take: 5,
    }),
    prisma.category.findMany({
      where: { OR: [{ name: contains }, { namePlural: contains }, { description: contains }] },
      include: { _count: { select: { products: { where: { status: ProductStatus.PUBLISHED } } } } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const products = rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    brand: r.brand_name,
    categoryKey: r.category_key,
    image: r.img_url ? { url: r.img_url, alt: r.img_alt } : null,
  }));

  return {
    query: q,
    products,
    brands: brands.map((b) => ({ name: b.name, slug: b.slug, count: b._count.products })),
    categories: categories.map((c) => ({ key: c.key, name: c.namePlural, slug: c.slug, count: c._count.products })),
    total: products.length + brands.length + categories.length,
  };
}
