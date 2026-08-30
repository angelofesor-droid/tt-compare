import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/product/Gallery";
import ProductCard from "@/components/product/ProductCard";
import ReviewsSection from "@/components/product/ReviewsSection";
import CompareButton from "@/components/compare/CompareButton";
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
      <nav aria-label="Miga de pan" className="mb-8 text-xs text-ink-low">
        <Link href="/" className="transition hover:text-ink">Inicio</Link>
        <span className="mx-1.5 text-ink-faint">/</span>
        <Link href={`/${product.category.slug}`} className="transition hover:text-ink">{product.category.namePlural}</Link>
        <span className="mx-1.5 text-ink-faint">/</span>
        <span className="text-ink-mid">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Galería */}
        <Gallery
          images={product.images.map((img) => ({ url: img.url, alt: img.alt, width: img.width, height: img.height }))}
          name={product.name}
        />

        {/* Info principal */}
        <div>
          <Link href={`/marcas/${product.brand.slug}`} className="text-xs font-bold uppercase tracking-[0.18em] text-accent transition hover:text-accent-hi">
            {product.brand.name}
          </Link>
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">{product.name}</h1>
          <p className="mt-1 text-sm text-ink-low">{product.category.name}</p>

          {product.summary && <p className="mt-5 text-sm leading-relaxed text-ink-mid">{product.summary}</p>}

          {price && (
            <p className="mt-5 text-3xl font-bold tabular-nums text-ink">
              {formatPrice(Number(price.amount), price.currency)}
              <span className="ml-2 text-xs font-normal text-ink-faint">precio referencial</span>
            </p>
          )}

          <div className="mt-7 flex flex-wrap gap-3">
            <CompareButton slug={product.slug} label="Comparar este producto" className="ctl ctl-compare rounded-lg px-5 py-2.5 text-sm" />
          </div>

          {/* Specs destacadas en placa */}
          {hasSpecs && (
            <div className="spec-plate mt-8">
              <div className="border-b border-metal/70 px-4 py-2.5">
                <span className="spec-label">Características principales</span>
              </div>
              {product.attributes.slice(0, 6).map((a) => (
                <div key={a.id} className="spec-plate-row">
                  <span className="spec-label">{a.attribute.name}</span>
                  <span className="spec-value">
                    {a.value}
                    {a.unit ?? a.attribute.unit ? ` ${a.unit ?? a.attribute.unit}` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Descripción completa + specs + pros/contras */}
      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          {product.description && (
            <section>
              <h2 className="sec-label mb-4">Descripción</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-mid">{product.description}</p>
            </section>
          )}

          {hasSpecs && (
            <section>
              <h2 className="sec-label mb-4">Especificaciones técnicas</h2>
              <div className="spec-plate">
                {product.attributes.map((a) => (
                  <div key={a.id} className="spec-plate-row">
                    <span className="spec-label">{a.attribute.name}</span>
                    <span className="spec-value">
                      {a.value}
                      {a.unit ?? a.attribute.unit ? ` ${a.unit ?? a.attribute.unit}` : ""}
                      {a.scale ?? a.attribute.scaleName ? (
                        <span className="ml-1.5 text-xs font-normal text-ink-faint">({a.scale ?? a.attribute.scaleName})</span>
                      ) : null}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pros / Contras */}
          {(product.prosCons.filter((p) => p.kind === "PRO").length > 0 ||
            product.prosCons.filter((p) => p.kind === "CON").length > 0) && (
            <section>
              <h2 className="sec-label mb-4">Ventajas y desventajas</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="panel p-5">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-ok">Ventajas</h3>
                  <ul className="space-y-2 text-sm text-ink-mid">
                    {product.prosCons.filter((p) => p.kind === "PRO").map((p) => (
                      <li key={p.id} className="flex gap-2">
                        <span className="text-ok" aria-hidden>✓</span> {p.text}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="panel p-5">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-danger">Desventajas</h3>
                  <ul className="space-y-2 text-sm text-ink-mid">
                    {product.prosCons.filter((p) => p.kind === "CON").map((p) => (
                      <li key={p.id} className="flex gap-2">
                        <span className="text-danger" aria-hidden>✗</span> {p.text}
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
          <div className="panel p-5">
            <h2 className="sec-label mb-4">Fuentes</h2>
            {product.sources.length > 0 ? (
              <ul className="space-y-3">
                {product.sources.map((s) => (
                  <li key={s.id} className="text-sm">
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium text-accent transition hover:text-accent-hi">
                      {s.name}
                    </a>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      {s.kind === "MANUFACTURER" ? "Fabricante" : s.kind === "AUTHORIZED_DISTRIBUTOR" ? "Distribuidor autorizado" : "Fuente confiable"}
                      {" · "}
                      {new Date(s.consultedAt).toLocaleDateString("es-CL")}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-low">No disponible</p>
            )}
            <hr className="metal-divider my-4" />
            <p className="text-xs text-ink-faint">
              Actualizado: {new Date(product.updatedAt).toLocaleDateString("es-CL")}
            </p>
          </div>
        </aside>
      </div>

      {/* Comentarios de usuarios */}
      <ReviewsSection productId={product.id} />

      {/* Relacionados */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="sec-label mb-5">También te puede interesar</h2>
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
