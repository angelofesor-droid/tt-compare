"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { readSelection, writeSelection } from "@/lib/compare-store";

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

  // Preselección inicial: combina el slug de la URL (?a=) con la selección persistida.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("a");
    const stored = readSelection();
    let initial: string[] = [];
    if (fromUrl) initial.push(fromUrl);
    for (const s of stored) if (!initial.includes(s)) initial.push(s);
    // Limitar a 4 y a una sola categoría
    const cats = new Set(initial.map((s) => bySlug.get(s)?.categoryKey).filter(Boolean));
    if (cats.size > 1) initial = initial.filter((s) => bySlug.get(s)?.categoryKey === bySlug.get(initial[0])?.categoryKey);
    // Hidratación de estado desde fuentes externas (URL + localStorage): caso legítimo
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(initial.slice(0, 4));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  function toggle(slug: string) {
    setError(null);
    setSelected((prev) => {
      let next: string[];
      if (prev.includes(slug)) {
        next = prev.filter((s) => s !== slug);
      } else if (prev.length >= 4) {
        setError("Puedes comparar hasta 4 productos.");
        return prev;
      } else {
        const cats = new Set([...prev, slug].map((s) => bySlug.get(s)?.categoryKey));
        if (cats.size > 1) {
          setError(
            "Solo puedes comparar productos de la misma categoría: gomas con gomas, maderos con maderos o mesas con mesas."
          );
          return prev;
        }
        next = [...prev, slug];
      }
      writeSelection(next); // persiste la selección entre visitas
      return next;
    });
  }

  function compare() {
    if (selected.length < 2) {
      setError("Selecciona al menos 2 productos para comparar.");
      return;
    }
    writeSelection(selected); // asegura persistencia
    const sorted = [...selected].sort();
    router.push(`/compare/${sorted.join("-vs-")}`);
  }

  return (
    <div>
      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-danger/50 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Barra de selección: panel técnico */}
      <div className="panel sticky top-20 z-30 mb-6 flex flex-wrap items-center gap-3 p-3">
        <span className="text-sm font-semibold tabular-nums text-ink">
          {selectedProducts.length} / 4 seleccionados
        </span>
        {selectedProducts.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {selectedProducts.map((p) => (
              <span key={p.slug} className="tag border-accent-line text-accent-hi">
                {p.name}
                <button onClick={() => toggle(p.slug)} aria-label={`Quitar ${p.name}`} className="ml-0.5 text-accent transition hover:text-danger">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <button
          onClick={compare}
          disabled={selected.length < 2}
          className="ctl ctl-primary ml-auto rounded-lg px-4 py-2 text-sm disabled:cursor-not-allowed"
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
              className={`object-card group relative overflow-hidden text-left transition ${
                isSelected ? "border-accent-line shadow-[0_0_0_1px_rgba(232,123,63,0.35)]" : ""
              }`}
            >
              <div className="relative m-2 aspect-square overflow-hidden rounded-lg bg-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                {p.image ? (
                  <Image src={p.image.url} alt={p.image.alt ?? p.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-contain p-2" />
                ) : (
                  <span className="flex h-full items-center justify-center text-xs text-ink-faint">Sin imagen</span>
                )}
                {isSelected && (
                  <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-deep shadow">
                    ✓
                  </span>
                )}
              </div>
              <div className="px-3 pb-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">{p.brand}</p>
                <p className="text-sm font-medium leading-snug text-ink">{p.name}</p>
                <p className="mt-0.5 text-xs text-ink-faint">{p.categoryName}</p>
              </div>
            </button>
          );
        })}
      </div>

      {products.length === 0 && (
        <p className="panel p-8 text-center text-sm text-ink-low">
          Aún no hay productos publicados para comparar.
        </p>
      )}

      <p className="mt-6 text-xs text-ink-faint">
        Los productos se comparan dentro de la misma categoría. Cada ficha mantiene su propia escala de fabricante.
      </p>
    </div>
  );
}
