import Link from "next/link";
import { getAdminStats } from "@/lib/services/product.service";

export const dynamic = "force-dynamic";

const cards = [
  { key: "total", label: "Total de productos", href: "/admin/products" },
  { key: "published", label: "Publicados", href: "/admin/products?status=PUBLISHED" },
  { key: "drafts", label: "Borradores", href: "/admin/products?status=DRAFT" },
  { key: "archived", label: "Archivados", href: "/admin/products?status=ARCHIVED" },
  { key: "rubbers", label: "Gomas publicadas", href: "/admin/products?status=PUBLISHED&category=RUBBER" },
  { key: "blades", label: "Maderos publicados", href: "/admin/products?status=PUBLISHED&category=BLADE" },
  { key: "tables", label: "Mesas publicadas", href: "/admin/products?status=PUBLISHED&category=TABLE" },
  { key: "brands", label: "Marcas", href: "#" },
] as const;

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-soft"
        >
          + Añadir producto
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.key}
            href={c.href}
            className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-primary/40 hover:shadow-sm"
          >
            <p className="text-2xl font-bold">{stats[c.key as keyof typeof stats]}</p>
            <p className="mt-1 text-xs text-slate-500">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
