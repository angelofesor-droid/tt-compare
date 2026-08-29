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

  // parsear filtros de la URL
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header de categoría */}
      <div className="mb-6">
        <nav aria-label="Miga de pan" className="mb-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-primary">Inicio</Link>
          <span className="mx-1">/</span>
          <span className="text-slate-700">{title}</span>
        </nav>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">{description}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        {/* Filtros (sticky en desktop) */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <CategoryFilters
            brands={catalog.filters.brands}
            attributes={catalog.filters.attributes}
            priceRange={catalog.filters.priceRange}
          />
        </div>

        {/* Grid de productos */}
        <div>
          <p className="mb-4 text-sm text-slate-500">
            {catalog.total} {catalog.total === 1 ? "producto" : "productos"}
          </p>

          {catalog.items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="text-base font-medium text-slate-700">Sin resultados</p>
              <p className="mt-1 text-sm text-slate-500">
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
            <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Paginación">
              {catalog.page > 1 && (
                <Link
                  href={`?${new URLSearchParams({ ...Object.fromEntries(Object.entries(sp).filter(([, v]) => typeof v === "string")), page: String(catalog.page - 1) })}`}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:border-primary"
                >
                  ←
                </Link>
              )}
              {pageNumbers.map((n) => (
                <Link
                  key={n}
                  href={`?${new URLSearchParams({ ...Object.fromEntries(Object.entries(sp).filter(([, v]) => typeof v === "string")), page: String(n) })}`}
                  aria-current={n === catalog.page ? "page" : undefined}
                  className={`rounded-md px-3 py-1.5 text-sm ${
                    n === catalog.page
                      ? "bg-primary font-semibold text-white"
                      : "border border-slate-300 hover:border-primary"
                  }`}
                >
                  {n}
                </Link>
              ))}
              {catalog.page < catalog.totalPages && (
                <Link
                  href={`?${new URLSearchParams({ ...Object.fromEntries(Object.entries(sp).filter(([, v]) => typeof v === "string")), page: String(catalog.page + 1) })}`}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:border-primary"
                >
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
