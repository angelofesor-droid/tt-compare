import type { Metadata } from "next";
import ComparePicker from "@/components/compare/ComparePicker";
import prisma from "@/lib/prisma";
import { ProductStatus } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Comparar productos de tenis de mesa",
  description:
    "Selecciona entre 2 y 4 gomas, maderos o mesas de tenis de mesa y compáralos lado a lado con datos verificados.",
  alternates: { canonical: "/compare" },
};

export default async function ComparePage() {
  const products = await prisma.product.findMany({
    where: { status: ProductStatus.PUBLISHED },
    include: {
      brand: true,
      category: true,
      images: { where: { isPrimary: true }, take: 1 },
    },
    orderBy: [{ category: { sortOrder: "asc" } }, { updatedAt: "desc" }],
    take: 60,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <p className="sec-label mb-2">Panel de análisis</p>
      <h1 className="text-3xl font-bold tracking-tight text-ink">Comparar productos</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-mid">
        Elige entre 2 y 4 productos de la misma categoría. Al terminar, verás una matriz con
        sus características, ventajas y desventajas.
      </p>

      <div className="mt-6">
        <ComparePicker
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            brand: p.brand.name,
            categoryKey: p.category.key,
            categoryName: p.category.name,
            image: p.images[0] ? { url: p.images[0].url, alt: p.images[0].alt } : null,
          }))}
        />
      </div>
    </div>
  );
}
