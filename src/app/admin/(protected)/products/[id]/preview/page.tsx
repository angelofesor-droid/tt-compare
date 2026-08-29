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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
        <p className="text-sm text-blue-900">
          <strong>Vista previa</strong> — así se verá la página pública
          {product.status === "DRAFT" && " (aún no publicada)"}.
        </p>
        <div className="flex gap-2">
          <Link href={`/admin/products/${product.id}/edit`} className="rounded-md border border-blue-300 bg-white px-3 py-1.5 text-sm font-medium text-blue-800 hover:bg-blue-100">
            ← Volver a editar
          </Link>
          <a href={`/product/${product.slug}`} target="_blank" className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
            Ver pública ↗
          </a>
        </div>
      </div>

      {/* Copia de la página pública */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <nav aria-label="Miga de pan" className="mb-6 text-xs text-slate-500">
          <Link href="/" className="hover:text-primary">Inicio</Link>
          <span className="mx-1">/</span>
          <Link href={`/${product.category.slug}`} className="hover:text-primary">{product.category.namePlural}</Link>
          <span className="mx-1">/</span>
          <span className="text-slate-700">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Gallery
            images={product.images.map((img) => ({ url: img.url, alt: img.alt, width: img.width, height: img.height }))}
            name={product.name}
          />
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">{product.brand.name}</p>
            <h1 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">{product.name}</h1>
            <p className="mt-1 text-sm text-slate-500">{product.category.name}</p>
            {product.summary && <p className="mt-4 text-sm leading-relaxed text-slate-700">{product.summary}</p>}
            {price && (
              <p className="mt-4 text-2xl font-bold">
                {formatPrice(price.amount.toString(), price.currency)}
                <span className="ml-2 text-xs font-normal text-slate-400">precio referencial</span>
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white">Comparar este producto</span>
            </div>
          </div>
        </div>

        {product.description && (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-bold">Descripción</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{product.description}</p>
          </section>
        )}

        {product.attributes.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-bold">Especificaciones</h2>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <tbody>
                  {product.attributes.map((a, idx) => (
                    <tr key={a.id} className={idx % 2 === 0 ? "bg-slate-50" : ""}>
                      <th scope="row" className="w-1/3 px-4 py-2.5 text-left font-medium text-slate-600">{a.attribute.name}</th>
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

        {product.sources.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-bold">Fuentes</h2>
            <ul className="space-y-1 text-sm">
              {product.sources.map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">{s.name}</a>
                  <span className="ml-2 text-xs text-slate-400">({s.kind})</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
