"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export interface PickableProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  categoryKey: string;
  categoryName: string;
  image: { url: string; alt: string | null } | null;
}

export default function ComparePicker({ products }: { products: PickableProduct[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]); // slugs
  const [error, setError] = useState<string | null>(null);

  const bySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);
  const selectedProducts = selected.map((s) => bySlug.get(s)!).filter(Boolean);

  function toggle(slug: string) {
    setError(null);
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 4) {
        setError("Puedes comparar hasta 4 productos.");
        return prev;
      }
      const next = [...prev, slug];
      // Regla: solo misma categoría
      const cats = new Set(next.map((s) => bySlug.get(s)?.categoryKey));
      if (cats.size > 1) {
        setError("Solo puedes comparar productos de la misma categoría: gomas con gomas, maderos con maderos o mesas con mesas.");
        return prev;
      }
      return next;
    });
  }

  function compare() {
    if (selected.length < 2) {
      setError("Selecciona al menos 2 productos para comparar.");
      return;
    }
    const sorted = [...selected].sort();
    router.push(`/compare/${sorted.join("-vs-")}`);
  }

  return (
    <div>
      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Barra de selección */}
      <div className="sticky top-16 z-30 mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
        <span className="text-sm font-semibold">
          {selectedProducts.length} / 4 seleccionados
        </span>
        {selectedProducts.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {selectedProducts.map((p) => (
              <span key={p.slug} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {p.name}
                <button onClick={() => toggle(p.slug)} aria-label={`Quitar ${p.name}`} className="ml-1 text-primary hover:text-red-600">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <button
          onClick={compare}
          disabled={selected.length < 2}
          className="ml-auto rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition enabled:hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-40"
        >
          Comparar ahora
        </button>
      </div>

      {/* Grid seleccionable */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => {
          const isSelected = selected.includes(p.slug);
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.slug)}
              aria-pressed={isSelected}
              className={`group relative overflow-hidden rounded-xl border-2 bg-white text-left transition ${
                isSelected ? "border-primary ring-2 ring-primary/20" : "border-slate-200 hover:border-primary/40"
              }`}
            >
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                {p.image ? (
                  <Image src={p.image.url} alt={p.image.alt ?? p.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-xs text-slate-400">Sin imagen</span>
                )}
                {isSelected && (
                  <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    ✓
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">{p.brand}</p>
                <p className="text-sm font-medium leading-snug text-slate-900">{p.name}</p>
                <p className="mt-0.5 text-xs text-slate-400">{p.categoryName}</p>
              </div>
            </button>
          );
        })}
      </div>

      {products.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Aún no hay productos publicados para comparar.
        </p>
      )}

      <p className="mt-6 text-xs text-slate-500">
        Consejo: los productos se comparan dentro de la misma categoría. Cada ficha mantiene su propia escala de fabricante.
        También puedes ir directo desde cualquier tarjeta con el botón <span className="font-medium">Comparar</span>.
      </p>
    </div>
  );
}
