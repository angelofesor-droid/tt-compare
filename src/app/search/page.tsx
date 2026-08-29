import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { searchCatalog } from "@/lib/services/search.service";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  return {
    title: query ? `Resultados para "${query}"` : "Buscar",
    description: query
      ? `Resultados de búsqueda para "${query}" en el catálogo de tenis de mesa.`
      : "Busca productos, marcas y categorías de tenis de mesa.",
    robots: query ? { index: false } : undefined,
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await searchCatalog(query) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">
        {query ? <>Resultados para <span className="text-primary">“{query}”</span></> : "Buscar"}
      </h1>

      {!query && (
        <p className="mt-3 text-sm text-slate-600">
          Escribe el nombre de un producto, marca o categoría en el buscador de arriba.
        </p>
      )}

      {results && results.total === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-base font-medium">Sin resultados para “{query}”</p>
          <p className="mt-1 text-sm text-slate-500">Revisa la ortografía o prueba con otra palabra.</p>
        </div>
      )}

      {results && results.total > 0 && (
        <div className="mt-6 space-y-8">
          {/* Categorías */}
          {results.categories.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Categorías</h2>
              <div className="flex flex-wrap gap-2">
                {results.categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/${c.slug}`}
                    className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 hover:border-primary hover:text-primary"
                  >
                    {c.name} ({c.count})
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Marcas */}
          {results.brands.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Marcas</h2>
              <ul className="space-y-1">
                {results.brands.map((b) => (
                  <li key={b.slug} className="text-sm">
                    <Link href={`/search?q=${encodeURIComponent(b.name)}`} className="font-medium text-primary hover:underline">
                      {b.name}
                    </Link>
                    <span className="ml-2 text-xs text-slate-400">{b.count} productos</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Productos */}
          {results.products.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Productos</h2>
              <ul className="space-y-3">
                {results.products.map((p) => (
                  <li key={p.id}>
                    <Link href={`/product/${p.slug}`} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-primary/40 hover:shadow-sm">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {p.image ? (
                          <Image src={p.image.url} alt={p.image.alt ?? p.name} fill sizes="64px" className="object-cover" />
                        ) : (
                          <span className="flex h-full items-center justify-center text-[10px] text-slate-400">Sin img</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.brand}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
