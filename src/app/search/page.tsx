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
      <p className="sec-label mb-2">Búsqueda</p>
      <h1 className="text-3xl font-bold tracking-tight text-ink">
        {query ? <>Resultados para <span className="text-accent">“{query}”</span></> : "Buscar"}
      </h1>

      {!query && (
        <p className="mt-3 text-sm text-ink-mid">
          Escribe el nombre de un producto, marca o categoría en el buscador de arriba.
        </p>
      )}

      {results && results.total === 0 && (
        <div className="panel mt-8 flex flex-col items-center justify-center p-12 text-center">
          <p className="text-base font-semibold text-ink">Sin resultados para “{query}”</p>
          <p className="mt-1 text-sm text-ink-low">Revisa la ortografía o prueba con otra palabra.</p>
        </div>
      )}

      {results && results.total > 0 && (
        <div className="mt-6 space-y-8">
          {/* Categorías */}
          {results.categories.length > 0 && (
            <section>
              <h2 className="sec-label mb-3">Categorías</h2>
              <div className="flex flex-wrap gap-2">
                {results.categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/${c.slug}`}
                    className="tag px-4 py-2 text-sm text-ink-mid transition hover:border-accent-line hover:text-ink"
                  >
                    {c.name} <span className="tabular-nums text-ink-faint">({c.count})</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Marcas */}
          {results.brands.length > 0 && (
            <section>
              <h2 className="sec-label mb-3">Marcas</h2>
              <ul className="space-y-1.5">
                {results.brands.map((b) => (
                  <li key={b.slug} className="text-sm">
                    <Link href={`/search?q=${encodeURIComponent(b.name)}`} className="font-medium text-accent transition hover:text-accent-hi">
                      {b.name}
                    </Link>
                    <span className="ml-2 text-xs tabular-nums text-ink-faint">{b.count} productos</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Productos */}
          {results.products.length > 0 && (
            <section>
              <h2 className="sec-label mb-3">Productos</h2>
              <ul className="space-y-3">
                {results.products.map((p) => (
                  <li key={p.id}>
                    <Link href={`/product/${p.slug}`} className="object-card flex items-center gap-4 p-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                        {p.image ? (
                          <Image src={p.image.url} alt={p.image.alt ?? p.name} fill sizes="64px" className="object-contain p-1" />
                        ) : (
                          <span className="flex h-full items-center justify-center text-[10px] text-ink-faint">Sin img</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink">{p.name}</p>
                        <p className="text-xs text-ink-low">{p.brand}</p>
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
