import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { ProductStatus } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, brands] = await Promise.all([
    prisma.category.findMany({ where: { status: "ACTIVE" } }),
    prisma.product.findMany({
      where: { status: ProductStatus.PUBLISHED },
      select: { slug: true, updatedAt: true },
    }),
    prisma.brand.findMany({
      where: { products: { some: { status: ProductStatus.PUBLISHED } } },
      select: { slug: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/marcas`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/guias/principiante`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/guias/intermedio`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/guias/avanzado`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const brandRoutes: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${base}/marcas/${b.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Comparaciones: solo pares dentro de la misma categoría (curadas en el futuro).

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...brandRoutes];
}
