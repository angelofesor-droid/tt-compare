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
        <h1 className="text-xl font-bold text-ink">Dashboard</h1>
        <Link href="/admin/products/new" className="ctl ctl-primary rounded-lg px-4 py-2 text-sm">
          + Añadir producto
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.key}
            href={c.href}
            className="object-card p-4"
          >
            <p className="text-2xl font-bold tabular-nums text-ink">{stats[c.key as keyof typeof stats]}</p>
            <p className="mt-1 text-xs text-ink-low">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
