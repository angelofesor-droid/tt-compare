import Link from "next/link";
import Image from "next/image";
import { listAdminProducts } from "@/lib/services/product.service";
import { setStatusAction, duplicateAction } from "./actions";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicado",
  ARCHIVED: "Archivado",
};

const statusStyles: Record<string, string> = {
  DRAFT: "bg-amber-100 text-amber-800",
  PUBLISHED: "bg-green-100 text-green-800",
  ARCHIVED: "bg-slate-200 text-slate-600",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const search = typeof sp.search === "string" ? sp.search : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const category = typeof sp.category === "string" ? sp.category : "";
  const page = typeof sp.page === "string" ? parseInt(sp.page, 10) || 1 : 1;

  const { items, total, totalPages } = await listAdminProducts({ search, status, category, page });

  const buildHref = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status && patch.status !== "") params.set("status", status);
    if (category && patch.category !== "") params.set("category", category);
    if (page > 1 && !("page" in patch)) params.set("page", String(page));
    for (const [k, v] of Object.entries(patch)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    const qs = params.toString();
    return `/admin/products${qs ? `?${qs}` : ""}`;
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Productos</h1>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-soft"
        >
          + Añadir producto
        </Link>
      </div>

      {/* Búsqueda y filtros */}
      <form method="GET" action="/admin/products" className="mb-4 flex flex-wrap gap-2">
        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder="Buscar por nombre o marca…"
          className="min-w-52 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <select name="status" defaultValue={status} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
          <option value="">Todos los estados</option>
          <option value="DRAFT">Borrador</option>
          <option value="PUBLISHED">Publicado</option>
          <option value="ARCHIVED">Archivado</option>
        </select>
        <select name="category" defaultValue={category} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
          <option value="">Todas las categorías</option>
          <option value="RUBBER">Gomas</option>
          <option value="BLADE">Maderos</option>
          <option value="TABLE">Mesas</option>
        </select>
        <button type="submit" className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
          Filtrar
        </button>
      </form>

      <p className="mb-3 text-sm text-slate-500">
        {total} {total === 1 ? "producto" : "productos"}
      </p>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Actualizado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Sin productos. Crea el primero con «Añadir producto».
                </td>
              </tr>
            )}
            {items.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-slate-100">
                      {p.images[0] ? (
                        <Image src={p.images[0].url} alt={p.images[0].alt ?? p.name} fill sizes="40px" className="object-cover" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-[9px] text-slate-400">sin img</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.brand.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{p.category.namePlural}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[p.status]}`}>
                    {statusLabels[p.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {new Date(p.updatedAt).toLocaleDateString("es-CL")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium hover:border-primary hover:text-primary"
                    >
                      Editar
                    </Link>
                    <Link
                      href={`/admin/products/${p.id}/preview`}
                      className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium hover:border-primary hover:text-primary"
                    >
                      Vista previa
                    </Link>
                    {p.status !== "PUBLISHED" && (
                      <form action={setStatusAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="status" value="PUBLISHED" />
                        <button type="submit" className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700">
                          Publicar
                        </button>
                      </form>
                    )}
                    {p.status === "PUBLISHED" && (
                      <form action={setStatusAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="status" value="DRAFT" />
                        <button type="submit" className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium hover:border-amber-400 hover:text-amber-700">
                          Despublicar
                        </button>
                      </form>
                    )}
                    {p.status !== "ARCHIVED" && (
                      <form action={setStatusAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="status" value="ARCHIVED" />
                        <button type="submit" className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium hover:border-red-300 hover:text-red-600">
                          Archivar
                        </button>
                      </form>
                    )}
                    <form action={duplicateAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium hover:border-primary hover:text-primary">
                        Duplicar
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <nav className="mt-4 flex items-center justify-center gap-2" aria-label="Paginación">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={buildHref({ page: String(n) })}
              className={`rounded-md px-3 py-1.5 text-sm ${n === page ? "bg-primary font-semibold text-white" : "border border-slate-300 hover:border-primary"}`}
            >
              {n}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
