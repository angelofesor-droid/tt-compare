import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { getProductById } from "@/lib/services/product.service";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; duplicated?: string }>;
}

export default async function EditProductPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { created, duplicated } = await searchParams;
  const [product, categories, brands] = await Promise.all([
    getProductById(id),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { attributeDefinitions: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">Editar: {product.name}</h1>
        <div className="flex gap-2">
          <Link href={`/admin/products/${product.id}/preview`} className="ctl ctl-ghost rounded-lg px-3 py-1.5 text-sm">
            Vista previa
          </Link>
          <Link href={`/product/${product.slug}`} target="_blank" className="ctl ctl-ghost rounded-lg px-3 py-1.5 text-sm">
            Ver público ↗
          </Link>
        </div>
      </div>

      {created && (
        <div role="status" className="mb-4 rounded-lg border border-ok/50 bg-ok/10 px-4 py-3 text-sm text-ok">
          Producto creado. Completa los datos y publícalo cuando esté listo.
        </div>
      )}
      {duplicated && (
        <div role="status" className="mb-4 rounded-lg border border-accent-line bg-accent-wash px-4 py-3 text-sm text-accent-hi">
          Producto duplicado como borrador. Edítalo y publícalo cuando quieras.
        </div>
      )}

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
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          brandId: product.brandId,
          categoryId: product.categoryId,
          summary: product.summary,
          description: product.description,
          status: product.status,
          featured: product.featured,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
          images: product.images.map((img) => ({
            url: img.url,
            alt: img.alt ?? "",
            source: img.source ?? "",
            sourceUrl: img.sourceUrl ?? "",
            isPrimary: img.isPrimary,
          })),
          sources: product.sources.map((s) => ({ url: s.url, name: s.name })),
          attributes: product.attributes.map((a) => ({
            key: a.attribute.key,
            value: a.value,
            unit: a.unit,
            scale: a.scale,
          })),
          pros: product.prosCons.filter((pc) => pc.kind === "PRO").map((pc) => pc.text),
          cons: product.prosCons.filter((pc) => pc.kind === "CON").map((pc) => pc.text),
          price: product.prices[0]
            ? { amount: product.prices[0].amount.toString(), currency: product.prices[0].currency, source: product.prices[0].source }
            : null,
        }}
      />
    </div>
  );
}
