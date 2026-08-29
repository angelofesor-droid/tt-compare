import type { Metadata } from "next";
import ProductForm from "@/components/admin/ProductForm";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Añadir producto",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { attributeDefinitions: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-xl font-bold">Añadir producto</h1>
      <ProductForm
        categories={categories.map((c) => ({
          id: c.id,
          key: c.key,
          name: c.name,
          attributes: c.attributeDefinitions.map((a) => ({
            key: a.key,
            name: a.name,
            valueType: a.valueType,
            unit: a.unit,
            options: (a.options as string[] | null) ?? null,
            scaleName: a.scaleName,
            filterable: a.filterable,
            sortOrder: a.sortOrder,
          })),
        }))}
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
        initial={null}
      />
    </div>
  );
}
