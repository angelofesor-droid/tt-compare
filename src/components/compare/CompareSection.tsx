"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import RadarComparison, { type RadarRow, type RadarProduct } from "@/components/compare/RadarComparison";

export interface CompareProductCard {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: string | null;
  image: { url: string; alt: string | null } | null;
  color: string;
}

function formatPrice(value: string | null): string {
  if (!value) return "No disponible";
  const [amount, currency] = value.split(" ");
  if (currency === "CLP") return `$${Math.round(Number(amount)).toLocaleString("es-CL")}`;
  return value;
}

// Sección comparativa: tarjetas de productos (hover resalta el radar) + gráfico radar.
// Permite quitar una goma de la comparación (vuelve a la URL con los restantes).
export default function CompareSection({
  products,
  rows,
  radarProducts,
}: {
  products: CompareProductCard[];
  rows: RadarRow[];
  radarProducts: RadarProduct[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);

  function remove(slug: string) {
    const seg = pathname.split("/").pop() ?? "";
    const slugs = seg.split("-vs-").filter(Boolean).filter((s) => s !== slug);
    if (slugs.length < 2) {
      router.push("/compare");
    } else {
      router.push(`/compare/${slugs.join("-vs-")}`);
    }
  }

  return (
    <div>
      {/* Tarjetas de producto alineadas */}
      <div className={`mt-8 grid gap-4 ${products.length === 2 ? "sm:grid-cols-2" : products.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4"}`}>
        {products.map((p) => (
          <div
            key={p.id}
            className="object-card group relative flex flex-col items-center p-4 text-center"
            onMouseEnter={() => setHovered(p.slug)}
            onMouseLeave={() => setHovered((h) => (h === p.slug ? null : h))}
          >
            {/* Quitar de la comparación */}
            <button
              onClick={() => remove(p.slug)}
              aria-label={`Quitar ${p.name} de la comparación`}
              title="Quitar de la comparación"
              className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-deep text-sm text-ink-faint shadow transition hover:bg-danger hover:text-white"
            >
              ×
            </button>
            {/* Indicador de color */}
            <span
              className="absolute left-2 top-2 h-3 w-3 rounded-full"
              style={{ backgroundColor: p.color }}
              aria-hidden
            />
            <Link href={`/product/${p.slug}`} className="block w-full">
              <div className="relative aspect-square w-full max-w-[170px] overflow-hidden rounded-lg bg-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                {p.image ? (
                  <Image src={p.image.url} alt={p.image.alt ?? p.name} fill sizes="170px" className="object-contain p-2 transition duration-300 group-hover:scale-[1.03]" />
                ) : (
                  <span className="flex h-full items-center justify-center text-xs text-ink-faint">Sin imagen</span>
                )}
              </div>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-accent">{p.brand}</p>
              <p className="mt-0.5 text-sm font-semibold text-ink transition group-hover:text-accent-hi">{p.name}</p>
              {p.price && <p className="mt-1 text-sm font-bold tabular-nums text-ink">{formatPrice(p.price)}</p>}
            </Link>
          </div>
        ))}
      </div>

      {/* Gráfico de radar comparativo */}
      <div className="mt-10">
        <RadarComparison rows={rows} products={radarProducts} hovered={hovered} onHover={setHovered} />
      </div>
    </div>
  );
}
