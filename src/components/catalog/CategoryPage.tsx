import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import CategoryFilters from "@/components/catalog/CategoryFilters";
import { getCatalog } from "@/lib/services/catalog.service";

interface CategoryPageProps {
  categoryKey: string; // rubbers | blades | tables
  title: string;
  description: string;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CategoryPage({ categoryKey, title, description, searchParams }: CategoryPageProps) {
  const sp = await searchParams;

  const toArray = (v: string | string[] | undefined): string[] => {
    if (!v) return [];
    return Array.isArray(v) ? v : [v];
  };

  const brands = toArray(sp.brands)[0]?.split(",").filter(Boolean) ?? [];
  const attributes: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(sp)) {
    if (key.startsWith("attr_")) {
      attributes[key.slice(5)] = toArray(value)[0]?.split(",").filter(Boolean) ?? [];
    }
  }
  const sort = typeof sp.sort === "string" ? (sp.sort as "recent" | "name") : "recent";
  const page = typeof sp.page === "string" ? parseInt(sp.page, 10) || 1 : 1;

  const catalog = await getCatalog(categoryKey, { brands, attributes, sort, page });

  const pageNumbers = Array.from({ length: catalog.totalPages }, (_, i) => i + 1).slice(
    Math.max(0, catalog.page - 3),
    Math.min(catalog.totalPages, catalog.page + 2),
  );

  const qsOf = (patch: Record<string, string>) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (typeof v === "string" && k !== "page") params.set(k, v);
    }
    for (const [k, v] of Object.entries(patch)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header de categoría */}
      <div className="mb-8">
        <nav aria-label="Miga de pan" className="mb-3 text-xs text-ink-low">
          <Link href="/" className="transition hover:text-ink">Inicio</Link>
          <span className="mx-1.5 text-ink-faint">/</span>
          <span className="text-ink-mid">{title}</span>
        </nav>
        <p className="sec-label mb-2">{categoryKey}</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-mid">{description}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* Filtros */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <CategoryFilters
            brands={catalog.filters.brands}
            attributes={catalog.filters.attributes}
            priceRange={catalog.filters.priceRange}
          />
        </div>

        {/* Grid de productos */}
        <div>
          <p className="mb-4 text-sm tabular-nums text-ink-low">
            {catalog.total} {catalog.total === 1 ? "producto" : "productos"}
          </p>

          {catalog.items.length === 0 ? (
            <div className="panel flex flex-col items-center justify-center p-12 text-center">
              <p className="text-base font-semibold text-ink">Sin resultados</p>
              <p className="mt-1 text-sm text-ink-low">
                Prueba ajustando o limpiando los filtros.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {catalog.items.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          )}

          {/* Paginación */}
          {catalog.totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Paginación">
              {catalog.page > 1 && (
                <Link href={qsOf({ page: String(catalog.page - 1) })} className="ctl ctl-ghost h-9 w-9 rounded-lg text-sm" aria-label="Página anterior">
                  ←
                </Link>
              )}
              {pageNumbers.map((n) => (
                <Link
                  key={n}
                  href={qsOf({ page: String(n) })}
                  aria-current={n === catalog.page ? "page" : undefined}
                  className={`ctl h-9 w-9 rounded-lg text-sm ${
                    n === catalog.page ? "ctl-primary" : "ctl-ghost"
                  }`}
                >
                  {n}
                </Link>
              ))}
              {catalog.page < catalog.totalPages && (
                <Link href={qsOf({ page: String(catalog.page + 1) })} className="ctl ctl-ghost h-9 w-9 rounded-lg text-sm" aria-label="Página siguiente">
                  →
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
