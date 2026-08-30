import prisma from "@/lib/prisma";
import { ProductStatus } from "@/generated/prisma/enums";

/** Todas las marcas con productos publicados + conteo total. */
export async function getAllBrands() {
  return prisma.brand.findMany({
    where: { products: { some: { status: ProductStatus.PUBLISHED } } },
    include: { _count: { select: { products: { where: { status: ProductStatus.PUBLISHED } } } } },
    orderBy: { name: "asc" },
  });
}

/** Una marca con sus productos publicados (agrupados por categoría). */
export async function getBrandBySlug(slug: string) {
  return prisma.brand.findUnique({
    where: { slug },
    include: {
      products: {
        where: { status: ProductStatus.PUBLISHED },
        include: {
          category: true,
          images: { where: { isPrimary: true }, take: 1 },
          prices: { orderBy: { updatedAt: "desc" }, take: 1 },
        },
        orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
      },
    },
  });
}
