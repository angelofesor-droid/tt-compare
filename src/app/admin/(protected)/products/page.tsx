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
  DRAFT: "border-warn/50 text-warn",
  PUBLISHED: "border-ok/50 text-ok",
  ARCHIVED: "border-metal text-ink-low",
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
        <h1 className="text-xl font-bold text-ink">Productos</h1>
        <Link href="/admin/products/new" className="ctl ctl-primary rounded-lg px-4 py-2 text-sm">
          + Añadir producto
        </Link>
      </div>

      {/* Búsqueda y filtros */}
      <form method="GET" action="/admin/products" className="mb-4 flex flex-wrap gap-2">
        <div className="well min-w-52 flex-1">
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Buscar por nombre o marca…"
            className="well-input rounded-[10px]"
          />
        </div>
        <select name="status" defaultValue={status} className="ctl-select">
          <option value="">Todos los estados</option>
          <option value="DRAFT">Borrador</option>
          <option value="PUBLISHED">Publicado</option>
          <option value="ARCHIVED">Archivado</option>
        </select>
        <select name="category" defaultValue={category} className="ctl-select">
          <option value="">Todas las categorías</option>
          <option value="RUBBER">Gomas</option>
          <option value="BLADE">Maderos</option>
          <option value="TABLE">Mesas</option>
        </select>
        <button type="submit" className="ctl ctl-ghost rounded-lg px-4 py-2 text-sm">
          Filtrar
        </button>
      </form>

      <p className="mb-3 text-sm tabular-nums text-ink-low">
        {total} {total === 1 ? "producto" : "productos"}
      </p>

      <div className="spec-plate">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-deep/40">
              <tr className="text-left text-xs uppercase tracking-wide text-ink-low">
                <th className="px-4 py-3 font-semibold">Producto</th>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Actualizado</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-ink-faint">
                    Sin productos. Crea el primero con «Añadir producto».
                  </td>
                </tr>
              )}
              {items.map((p) => (
                <tr key={p.id} className="border-t border-metal/40 transition hover:bg-surface/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                        {p.images[0] ? (
                          <Image src={p.images[0].url} alt={p.images[0].alt ?? p.name} fill sizes="40px" className="object-contain p-0.5" />
                        ) : (
                          <span className="flex h-full items-center justify-center text-[9px] text-ink-faint">sin img</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-ink">{p.name}</p>
                        <p className="text-xs text-ink-faint">{p.brand.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-mid">{p.category.namePlural}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[p.status]}`}>
                      {statusLabels[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-faint">
                    {new Date(p.updatedAt).toLocaleDateString("es-CL")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/admin/products/${p.id}/edit`} className="ctl ctl-ghost rounded-lg px-2.5 py-1 text-xs">
                        Editar
                      </Link>
                      <Link href={`/admin/products/${p.id}/preview`} className="ctl ctl-ghost rounded-lg px-2.5 py-1 text-xs">
                        Vista previa
                      </Link>
                      {p.status !== "PUBLISHED" && (
                        <form action={setStatusAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="status" value="PUBLISHED" />
                          <button type="submit" className="ctl rounded-lg bg-gradient-to-b from-ok to-[#3d8f6d] px-2.5 py-1 text-xs text-deep">
                            Publicar
                          </button>
                        </form>
                      )}
                      {p.status === "PUBLISHED" && (
                        <form action={setStatusAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="status" value="DRAFT" />
                          <button type="submit" className="ctl ctl-ghost rounded-lg px-2.5 py-1 text-xs">
                            Despublicar
                          </button>
                        </form>
                      )}
                      {p.status !== "ARCHIVED" && (
                        <form action={setStatusAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="status" value="ARCHIVED" />
                          <button type="submit" className="ctl ctl-ghost rounded-lg px-2.5 py-1 text-xs hover:border-danger/50 hover:text-danger">
                            Archivar
                          </button>
                        </form>
                      )}
                      <form action={duplicateAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="ctl ctl-ghost rounded-lg px-2.5 py-1 text-xs">
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
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <nav className="mt-4 flex items-center justify-center gap-1.5" aria-label="Paginación">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={buildHref({ page: String(n) })}
              className={`ctl h-9 w-9 rounded-lg text-sm ${n === page ? "ctl-primary" : "ctl-ghost"}`}
            >
              {n}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
