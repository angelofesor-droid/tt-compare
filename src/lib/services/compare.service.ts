import prisma from "@/lib/prisma";
import { ProductStatus } from "@/generated/prisma/enums";

export class CompareError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CompareError";
  }
}

export interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  image: { url: string; alt: string | null } | null;
  price: string | null;
  attributes: { key: string; name: string; value: string; unit: string | null; scale: string | null }[];
  pros: string[];
  cons: string[];
}

/**
 * Regla crítica: solo se comparan productos de la misma categoría.
 */
export async function getCompareProducts(slugs: string[]): Promise<{ categoryKey: string; categoryName: string; products: CompareProduct[] }> {
  if (slugs.length < 2 || slugs.length > 4) {
    throw new CompareError("La comparación requiere entre 2 y 4 productos.");
  }

  const products = await prisma.product.findMany({
    where: { slug: { in: slugs }, status: ProductStatus.PUBLISHED },
    include: {
      brand: true,
      category: true,
      images: { where: { isPrimary: true }, take: 1 },
      prices: { orderBy: { updatedAt: "desc" }, take: 1 },
      attributes: { include: { attribute: true }, orderBy: { sortOrder: "asc" } },
      prosCons: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (products.length !== slugs.length) {
    throw new CompareError("Uno o más productos no existen o no están publicados.");
  }

  // Validar que todos sean de la misma categoría
  const categories = new Set(products.map((p) => p.category.key));
  if (categories.size > 1) {
    throw new CompareError(
      "No se pueden comparar productos de categorías distintas. Compara gomas con gomas, maderos con maderos y mesas con mesas.",
    );
  }

  const mapped: CompareProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand.name,
    image: p.images[0] ? { url: p.images[0].url, alt: p.images[0].alt } : null,
    price: p.prices[0] ? `${p.prices[0].amount} ${p.prices[0].currency}` : null,
    attributes: p.attributes.map((a) => ({
      key: a.attribute.key,
      name: a.attribute.name,
      value: a.value,
      unit: a.unit ?? a.attribute.unit ?? null,
      scale: a.scale ?? a.attribute.scaleName ?? null,
    })),
    pros: p.prosCons.filter((pc) => pc.kind === "PRO").map((pc) => pc.text),
    cons: p.prosCons.filter((pc) => pc.kind === "CON").map((pc) => pc.text),
  }));

  // Reordenar según el orden solicitado
  const bySlug = new Map(mapped.map((p) => [p.slug, p]));
  const ordered = slugs.map((s) => bySlug.get(s)!);

  return {
    categoryKey: products[0].category.key,
    categoryName: products[0].category.name,
    products: ordered,
  };
}

/** Unión de atributos que existen en al menos un producto de la comparación */
export function unionAttributes(products: CompareProduct[]) {
  const seen = new Map<string, { key: string; name: string }>();
  for (const p of products) {
    for (const a of p.attributes) {
      if (!seen.has(a.key)) seen.set(a.key, { key: a.key, name: a.name });
    }
  }
  return [...seen.values()];
}

/** Slug canónico para URL de comparación: a-vs-b (en orden alfabético) */
export function compareSlug(slugs: string[]): string {
  return [...slugs].sort().join("-vs-");
}
