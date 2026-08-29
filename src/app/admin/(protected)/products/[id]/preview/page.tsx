import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/product/Gallery";
import { getProductById } from "@/lib/services/product.service";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatPrice(amount: string, currency: string): string {
  const n = Number(amount);
  if (currency === "CLP") return `$${Math.round(n).toLocaleString("es-CL")}`;
  return `${n.toLocaleString("es-CL")} ${currency}`;
}

export default async function PreviewProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const price = product.prices[0];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="panel mb-4 flex flex-wrap items-center justify-between gap-3 border-accent-line px-4 py-3">
        <p className="text-sm text-accent-hi">
          <strong>Vista previa</strong> — así se verá la página pública
          {product.status === "DRAFT" && " (aún no publicada)"}.
        </p>
        <div className="flex gap-2">
          <Link href={`/admin/products/${product.id}/edit`} className="ctl ctl-ghost rounded-lg px-3 py-1.5 text-sm">
            ← Volver a editar
          </Link>
          <a href={`/product/${product.slug}`} target="_blank" className="ctl ctl-primary rounded-lg px-3 py-1.5 text-sm">
            Ver pública ↗
          </a>
        </div>
      </div>

      {/* Copia de la página pública */}
      <div className="panel p-6">
        <nav aria-label="Miga de pan" className="mb-6 text-xs text-ink-low">
          <Link href="/" className="transition hover:text-ink">Inicio</Link>
          <span className="mx-1.5 text-ink-faint">/</span>
          <Link href={`/${product.category.slug}`} className="transition hover:text-ink">{product.category.namePlural}</Link>
          <span className="mx-1.5 text-ink-faint">/</span>
          <span className="text-ink-mid">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <Gallery
            images={product.images.map((img) => ({ url: img.url, alt: img.alt, width: img.width, height: img.height }))}
            name={product.name}
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">{product.brand.name}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">{product.name}</h1>
            <p className="mt-1 text-sm text-ink-low">{product.category.name}</p>
            {product.summary && <p className="mt-5 text-sm leading-relaxed text-ink-mid">{product.summary}</p>}
            {price && (
              <p className="mt-5 text-3xl font-bold tabular-nums text-ink">
                {formatPrice(price.amount.toString(), price.currency)}
                <span className="ml-2 text-xs font-normal text-ink-faint">precio referencial</span>
              </p>
            )}
            <div className="mt-7 flex flex-wrap gap-3">
              <span className="ctl ctl-compare rounded-lg px-5 py-2.5 text-sm">Comparar este producto</span>
            </div>
          </div>
        </div>

        {product.description && (
          <section className="mt-10">
            <h2 className="sec-label mb-4">Descripción</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-mid">{product.description}</p>
          </section>
        )}

        {product.attributes.length > 0 && (
          <section className="mt-10">
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

        {product.sources.length > 0 && (
          <section className="mt-10">
            <h2 className="sec-label mb-4">Fuentes</h2>
            <ul className="space-y-1.5 text-sm">
              {product.sources.map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium text-accent transition hover:text-accent-hi">{s.name}</a>
                  <span className="ml-2 text-xs text-ink-faint">({s.kind})</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
