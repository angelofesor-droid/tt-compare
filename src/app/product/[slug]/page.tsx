import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/product/Gallery";
import ProductCard from "@/components/product/ProductCard";
import { getPublishedProductBySlug } from "@/lib/services/product.service";
import { getRelatedProducts } from "@/lib/services/catalog.service";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };

  const title = product.seoTitle || `${product.name} — características, precio y comparación`;
  const description =
    product.seoDescription ||
    `${product.name} de ${product.brand.name}: especificaciones, ventajas, desventajas y comparación con otros ${product.category.namePlural.toLowerCase()}.`;

  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: product.images[0] ? [{ url: product.images[0].url, alt: product.images[0].alt ?? product.name }] : undefined,
    },
  };
}

function formatPrice(amount: number, currency: string): string {
  if (currency === "CLP") return `$${Math.round(amount).toLocaleString("es-CL")}`;
  return `${amount.toLocaleString("es-CL")} ${currency}`;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);
  if (!product) notFound();

  const [related] = await Promise.all([
    getRelatedProducts(product.id, product.categoryId, product.brandId, 4).catch(() => []),
  ]);

  const price = product.prices[0];
  const hasSpecs = product.attributes.length > 0;

  // Schema.org Product
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary ?? product.description ?? undefined,
    image: product.images.map((i) => i.url),
    brand: { "@type": "Brand", name: product.brand.name },
    ...(price ? { offers: { "@type": "Offer", price: price.amount.toString(), priceCurrency: price.currency, availability: "https://schema.org/InStock" } } : {}),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Miga de pan */}
      <nav aria-label="Miga de pan" className="mb-6 text-xs text-slate-500">
        <Link href="/" className="hover:text-primary">Inicio</Link>
        <span className="mx-1">/</span>
        <Link href={`/${product.category.slug}`} className="hover:text-primary">{product.category.namePlural}</Link>
        <span className="mx-1">/</span>
        <span className="text-slate-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Galería */}
        <Gallery
          images={product.images.map((img) => ({ url: img.url, alt: img.alt, width: img.width, height: img.height }))}
          name={product.name}
        />

        {/* Info principal */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">{product.brand.name}</p>
          <h1 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">{product.name}</h1>
          <p className="mt-1 text-sm text-slate-500">{product.category.name}</p>

          {product.summary && <p className="mt-4 text-sm leading-relaxed text-slate-700">{product.summary}</p>}

          {price && (
            <p className="mt-4 text-2xl font-bold">
              {formatPrice(Number(price.amount), price.currency)}
              <span className="ml-2 text-xs font-normal text-slate-400">precio referencial</span>
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/compare?a=${product.slug}`}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-soft"
            >
              Comparar este producto
            </Link>
          </div>

          {/* Specs destacadas */}
          {hasSpecs && (
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
              {product.attributes.slice(0, 6).map((a) => (
                <div key={a.id}>
                  <dt className="text-xs text-slate-500">{a.attribute.name}</dt>
                  <dd className="text-sm font-medium">
                    {a.value}
                    {a.unit ?? a.attribute.unit ? ` ${a.unit ?? a.attribute.unit}` : ""}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      {/* Descripción completa + specs + pros/contras */}
      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {product.description && (
            <section>
              <h2 className="mb-3 text-lg font-bold">Descripción</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{product.description}</p>
            </section>
          )}

          {hasSpecs && (
            <section>
              <h2 className="mb-3 text-lg font-bold">Especificaciones</h2>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                  <tbody>
                    {product.attributes.map((a, idx) => (
                      <tr key={a.id} className={idx % 2 === 0 ? "bg-slate-50" : ""}>
                        <th scope="row" className="w-1/3 px-4 py-2.5 text-left font-medium text-slate-600">
                          {a.attribute.name}
                        </th>
                        <td className="px-4 py-2.5">
                          {a.value}
                          {a.unit ?? a.attribute.unit ? ` ${a.unit ?? a.attribute.unit}` : ""}
                          {a.scale ?? a.attribute.scaleName ? (
                            <span className="ml-1 text-xs text-slate-400">({a.scale ?? a.attribute.scaleName})</span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Pros / Contras */}
          {(product.prosCons.filter((p) => p.kind === "PRO").length > 0 ||
            product.prosCons.filter((p) => p.kind === "CON").length > 0) && (
            <section>
              <h2 className="mb-3 text-lg font-bold">Ventajas y desventajas</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <h3 className="mb-2 text-sm font-semibold text-green-800">Ventajas</h3>
                  <ul className="space-y-1.5 text-sm text-green-900">
                    {product.prosCons.filter((p) => p.kind === "PRO").map((p) => (
                      <li key={p.id} className="flex gap-2">
                        <span aria-hidden>✓</span> {p.text}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <h3 className="mb-2 text-sm font-semibold text-red-800">Desventajas</h3>
                  <ul className="space-y-1.5 text-sm text-red-900">
                    {product.prosCons.filter((p) => p.kind === "CON").map((p) => (
                      <li key={p.id} className="flex gap-2">
                        <span aria-hidden>✗</span> {p.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Fuentes */}
        <aside>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Fuentes</h2>
            {product.sources.length > 0 ? (
              <ul className="space-y-2">
                {product.sources.map((s) => (
                  <li key={s.id} className="text-sm">
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                      {s.name}
                    </a>
                    <p className="text-xs text-slate-400">
                      {s.kind === "MANUFACTURER" ? "Fabricante" : s.kind === "AUTHORIZED_DISTRIBUTOR" ? "Distribuidor autorizado" : "Fuente confiable"}
                      {" · "}
                      {new Date(s.consultedAt).toLocaleDateString("es-CL")}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No disponible</p>
            )}
            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
              Actualizado: {new Date(product.updatedAt).toLocaleDateString("es-CL")}
            </p>
          </div>
        </aside>
      </div>

      {/* Relacionados */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-bold">También te puede interesar</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  name: p.name,
                  slug: p.slug,
                  brand: { name: p.brand.name, slug: p.brand.slug },
                  image: p.images[0] ? { url: p.images[0].url, alt: p.images[0].alt } : null,
                  price: p.prices[0] ? { amount: Number(p.prices[0].amount), currency: p.prices[0].currency } : null,
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
