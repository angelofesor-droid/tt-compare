import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CompareError, getCompareProducts, unionAttributes } from "@/lib/services/compare.service";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slugs: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slugs } = await params;
  const list = slugs.split("-vs-");
  if (list.length < 2) return { title: "Comparación inválida" };

  try {
    const { categoryName, products } = await getCompareProducts(list);
    const names = products.map((p) => p.name);
    return {
      title: `${names.join(" vs ")} — comparación de ${categoryName.toLowerCase()}s`,
      description: `Compara ${names.join(" vs ")}: especificaciones, ventajas y desventajas para elegir la mejor ${categoryName.toLowerCase()}.`,
      alternates: { canonical: `/compare/${slugs}` },
    };
  } catch {
    return { title: "Comparación no disponible" };
  }
}

function formatPrice(value: string | null): string {
  if (!value) return "No disponible";
  const [amount, currency] = value.split(" ");
  if (currency === "CLP") return `$${Math.round(Number(amount)).toLocaleString("es-CL")}`;
  return value;
}

export default async function CompareDetailPage({ params }: PageProps) {
  const { slugs } = await params;
  const list = slugs.split("-vs-");

  let data;
  try {
    data = await getCompareProducts(list);
  } catch (e) {
    if (e instanceof CompareError) {
      notFound();
    }
    notFound();
  }

  const { categoryName, products } = data;
  const attributes = unionAttributes(products);

  // Schema.org ItemList
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Comparación de ${categoryName.toLowerCase()}s`,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/product/${p.slug}`,
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Miga de pan" className="mb-4 text-xs text-slate-500">
        <Link href="/" className="hover:text-primary">Inicio</Link>
        <span className="mx-1">/</span>
        <Link href="/compare" className="hover:text-primary">Comparar</Link>
        <span className="mx-1">/</span>
        <span className="text-slate-700">Comparación de {categoryName.toLowerCase()}s</span>
      </nav>

      <h1 className="text-2xl font-bold sm:text-3xl">
        {categoryName} vs {categoryName}
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Comparación de {products.length} {categoryName.toLowerCase()}s. Las escalas corresponden a cada fabricante.
      </p>

      {/* Encabezado de productos (imagen + nombre, clickeables) */}
      <div className={`mt-8 grid gap-4 ${products.length === 2 ? "sm:grid-cols-2" : products.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4"}`}>
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.slug}`}
            className="group rounded-xl border border-slate-200 bg-white p-4 text-center transition hover:border-primary/40 hover:shadow-md"
          >
            <div className="relative mx-auto aspect-square w-full max-w-[160px] overflow-hidden rounded-lg bg-slate-100">
              {p.image ? (
                <Image src={p.image.url} alt={p.image.alt ?? p.name} fill sizes="160px" className="object-cover transition group-hover:scale-105" />
              ) : (
                <span className="flex h-full items-center justify-center text-xs text-slate-400">Sin imagen</span>
              )}
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-accent">{p.brand}</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-900 group-hover:text-primary">{p.name}</p>
            {p.price && <p className="mt-1 text-sm font-bold">{formatPrice(p.price)}</p>}
          </Link>
        ))}
      </div>

      {/* Tabla de comparación (desktop) */}
      <div className="mt-10 hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">Tabla comparativa de características</caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th scope="col" className="w-48 px-4 py-3 font-semibold text-slate-500">Característica</th>
              {products.map((p) => (
                <th key={p.id} scope="col" className="px-4 py-3 font-semibold text-slate-900">
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <th scope="row" className="px-4 py-2.5 font-medium text-slate-600">Marca</th>
              {products.map((p) => (
                <td key={p.id} className="px-4 py-2.5">{p.brand}</td>
              ))}
            </tr>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th scope="row" className="px-4 py-2.5 font-medium text-slate-600">Precio</th>
              {products.map((p) => (
                <td key={p.id} className="px-4 py-2.5">{formatPrice(p.price)}</td>
              ))}
            </tr>
            {attributes.map((attr) => (
              <tr key={attr.key} className="border-b border-slate-100">
                <th scope="row" className="px-4 py-2.5 font-medium text-slate-600">{attr.name}</th>
                {products.map((p) => {
                  const found = p.attributes.find((a) => a.key === attr.key);
                  return (
                    <td key={p.id} className="px-4 py-2.5">
                      {found ? (
                        <>
                          {found.value}
                          {found.unit ? ` ${found.unit}` : ""}
                          {found.scale && <span className="ml-1 text-xs text-slate-400">({found.scale})</span>}
                        </>
                      ) : (
                        <span className="text-slate-400">No disponible</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Pros/Contras */}
            <tr className="border-b border-slate-100">
              <th scope="row" className="align-top px-4 py-2.5 font-medium text-slate-600">Ventajas</th>
              {products.map((p) => (
                <td key={p.id} className="px-4 py-2.5">
                  {p.pros.length > 0 ? (
                    <ul className="space-y-1">
                      {p.pros.map((t, i) => (
                        <li key={i} className="flex gap-1.5 text-green-800"><span aria-hidden>✓</span>{t}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-slate-400">No disponible</span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="align-top px-4 py-2.5 font-medium text-slate-600">Desventajas</th>
              {products.map((p) => (
                <td key={p.id} className="px-4 py-2.5">
                  {p.cons.length > 0 ? (
                    <ul className="space-y-1">
                      {p.cons.map((t, i) => (
                        <li key={i} className="flex gap-1.5 text-red-800"><span aria-hidden>✗</span>{t}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-slate-400">No disponible</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Vista móvil: tarjetas apiladas producto a producto */}
      <div className="mt-8 space-y-6 md:hidden">
        {products.map((p) => (
          <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <Link href={`/product/${p.slug}`} className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                {p.image ? (
                  <Image src={p.image.url} alt={p.image.alt ?? p.name} fill sizes="56px" className="object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-[10px] text-slate-400">Sin img</span>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">{p.brand}</p>
                <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                <p className="text-xs text-slate-500">{formatPrice(p.price)}</p>
              </div>
            </Link>
            <dl className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
              {attributes.map((attr) => {
                const found = p.attributes.find((a) => a.key === attr.key);
                return (
                  <div key={attr.key} className="flex justify-between gap-3 text-sm">
                    <dt className="text-slate-500">{attr.name}</dt>
                    <dd className="text-right font-medium">
                      {found ? (
                        <>
                          {found.value}
                          {found.unit ? ` ${found.unit}` : ""}
                        </>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link href="/compare" className="text-sm font-medium text-primary hover:underline">
          ← Elegir otros productos
        </Link>
      </div>
    </div>
  );
}
