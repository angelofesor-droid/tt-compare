import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/product/ProductCard";
import { getBrandBySlug } from "@/lib/services/brand.service";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return { title: "Marca no encontrada" };
  return {
    title: `${brand.name} — productos de tenis de mesa`,
    description: `Catálogo de ${brand.name}: gomas, maderos y mesas con especificaciones verificadas contra fuentes oficiales.`,
    alternates: { canonical: `/marcas/${brand.slug}` },
  };
}

export default async function BrandPage({ params }: PageProps) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  // Agrupar productos por categoría
  const byCategory = new Map<string, { name: string; items: typeof brand.products }>();
  for (const p of brand.products) {
    const group = byCategory.get(p.category.key) ?? { name: p.category.namePlural, items: [] };
    group.items.push(p);
    byCategory.set(p.category.key, group);
  }

  const card = (p: (typeof brand.products)[number]) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    summary: p.summary,
    brand: { name: brand.name, slug: brand.slug },
    category: { key: p.category.key, name: p.category.name, slug: p.category.slug },
    image: p.images[0] ? { url: p.images[0].url, alt: p.images[0].alt } : null,
    price: p.prices[0] ? { amount: Number(p.prices[0].amount), currency: p.prices[0].currency } : null,
    attributes: [],
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav aria-label="Miga de pan" className="mb-6 text-xs text-ink-low">
        <Link href="/" className="transition hover:text-ink">Inicio</Link>
        <span className="mx-1.5 text-ink-faint">/</span>
        <Link href="/marcas" className="transition hover:text-ink">Marcas</Link>
        <span className="mx-1.5 text-ink-faint">/</span>
        <span className="text-ink-mid">{brand.name}</span>
      </nav>

      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-extrabold uppercase tracking-[0.06em] text-ink">
          {brand.name}
        </h1>
        <span className="rounded-full border border-accent-line px-2.5 py-0.5 text-xs font-semibold tabular-nums text-accent">
          {brand.products.length} productos
        </span>
      </div>
      {brand.country && <p className="mt-1 text-sm text-ink-low">Origen: {brand.country}</p>}

      {Array.from(byCategory.entries()).map(([key, group]) => (
        <section key={key} className="mt-10">
          <div className="mb-4 flex items-baseline gap-3 border-b border-metal/60 pb-2">
            <h2 className="sec-label">{group.name}</h2>
            <span className="text-xs tabular-nums text-ink-faint">{group.items.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {group.items.map((p) => (
              <ProductCard key={p.id} product={card(p)} />
            ))}
          </div>
        </section>
      ))}

      {brand.products.length === 0 && (
        <p className="panel mt-8 p-8 text-center text-sm text-ink-low">Aún no hay productos publicados de esta marca.</p>
      )}
    </div>
  );
}
