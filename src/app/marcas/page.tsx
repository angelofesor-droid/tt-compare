import type { Metadata } from "next";
import Link from "next/link";
import { getAllBrands } from "@/lib/services/brand.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marcas de tenis de mesa",
  description:
    "Todas las marcas de tenis de mesa del catálogo: Butterfly, DHS, Stiga, Joola, Xiom, Yasaka, Donic y más. Fichas, comparaciones y datos verificados.",
  alternates: { canonical: "/marcas" },
};

export default async function BrandsPage() {
  const brands = await getAllBrands();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <p className="sec-label mb-2">Catálogo · Marcas</p>
      <h1 className="text-3xl font-bold tracking-tight text-ink">Marcas de tenis de mesa</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-mid">
        Explora el catálogo por fabricante. Cada marca reúne sus gomas, maderos y mesas con datos
        verificados contra fuentes oficiales.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {brands.map((b) => (
          <Link
            key={b.id}
            href={`/marcas/${b.slug}`}
            className="object-card group flex flex-col justify-between p-5"
          >
            <span className="text-base font-bold uppercase tracking-[0.08em] text-ink transition group-hover:text-accent-hi">
              {b.name}
            </span>
            <span className="mt-3 text-xs tabular-nums text-ink-faint">
              {b._count.products} producto{b._count.products === 1 ? "" : "s"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
