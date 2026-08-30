"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export interface FilterOption {
  value: string;
  count: number;
  china?: boolean;
}

export interface AttributeFilterGroup {
  key: string;
  name: string;
  options: FilterOption[];
}

export interface FiltersProps {
  brands: { id: string; name: string; count: number }[];
  attributes: AttributeFilterGroup[];
  priceRange: { min: number | null; max: number | null };
}

/** Formatea la etiqueta de cada opción según el atributo normalizado. */
function optionLabel(key: string, opt: FilterOption): string {
  switch (key) {
    case "thickness":
      return opt.value === "2.0 Max" ? "2.0 Max" : `${opt.value} mm`;
    case "hardness":
      return `${opt.value}°${opt.china ? " (China)" : ""}`;
    case "speed":
    case "spin":
    case "control":
      return `${opt.value}/10`;
    case "durability":
      return `${opt.value}/10`;
    case "tackiness":
      return opt.value; // Sticky / Tacky
    default:
      return opt.value;
  }
}

export default function CategoryFilters({ brands, attributes }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedBrands = useMemo(() => searchParams.get("brands")?.split(",").filter(Boolean) ?? [], [searchParams]);
  const selectedAttrs = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const key of new Set(searchParams.keys())) {
      if (key.startsWith("attr_")) {
        const attrKey = key.slice(5);
        map[attrKey] = searchParams.get(key)?.split(",").filter(Boolean) ?? [];
      }
    }
    return map;
  }, [searchParams]);

  const sort = searchParams.get("sort") ?? "recent";

  const updateParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutator(params);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  function toggleBrand(name: string) {
    updateParams((params) => {
      const current = params.get("brands")?.split(",").filter(Boolean) ?? [];
      const next = current.includes(name) ? current.filter((b) => b !== name) : [...current, name];
      if (next.length > 0) params.set("brands", next.join(","));
      else params.delete("brands");
      params.delete("page");
    });
  }

  function toggleAttr(key: string, value: string) {
    updateParams((params) => {
      const paramKey = `attr_${key}`;
      const current = params.get(paramKey)?.split(",").filter(Boolean) ?? [];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      if (next.length > 0) params.set(paramKey, next.join(","));
      else params.delete(paramKey);
      params.delete("page");
    });
  }

  function changeSort(value: string) {
    updateParams((params) => {
      if (value === "recent") params.delete("sort");
      else params.set("sort", value);
      params.delete("page");
    });
  }

  function clearAll() {
    router.push("?", { scroll: false });
  }

  const hasActiveFilters = selectedBrands.length > 0 || Object.keys(selectedAttrs).length > 0;

  return (
    <aside className="panel p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-low">Filtros</h2>
        {hasActiveFilters && (
          <button onClick={clearAll} className="text-xs font-medium text-accent transition hover:text-accent-hi">
            Limpiar
          </button>
        )}
      </div>

      {/* Orden */}
      <div className="mb-5">
        <h3 className="spec-label mb-2">Ordenar</h3>
        <select value={sort} onChange={(e) => changeSort(e.target.value)} className="ctl-select w-full" aria-label="Ordenar resultados">
          <option value="recent">Más recientes</option>
          <option value="name">Nombre (A–Z)</option>
        </select>
      </div>

      <hr className="metal-divider mb-5" />

      {/* Marca */}
      {brands.length > 0 && (
        <details open className="group mb-3 border-b border-metal/50 pb-3">
          <summary className="spec-label flex cursor-pointer select-none items-center justify-between">
            Marca
            <span className="text-xs text-ink-faint transition group-open:rotate-180">▾</span>
          </summary>
          <ul className="mt-2.5 space-y-2">
            {brands.map((b) => (
              <li key={b.id}>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-mid transition hover:text-ink">
                  <input type="checkbox" checked={selectedBrands.includes(b.name)} onChange={() => toggleBrand(b.name)} className="ctl-check" />
                  <span className="flex-1">{b.name}</span>
                  <span className="text-xs tabular-nums text-ink-faint">{b.count}</span>
                </label>
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Atributos normalizados en dropdowns colapsables */}
      {attributes.map((group) => {
        const active = selectedAttrs[group.key] ?? [];
        return (
          <details key={group.key} open={active.length > 0} className="group mb-3 border-b border-metal/50 pb-3">
            <summary className="spec-label flex cursor-pointer select-none items-center justify-between">
              {group.name}
              {active.length > 0 && <span className="rounded-full bg-accent/20 px-1.5 text-[10px] font-bold text-accent-hi">{active.length}</span>}
              <span className="text-xs text-ink-faint transition group-open:rotate-180">▾</span>
            </summary>
            <ul className="mt-2.5 space-y-2">
              {group.options.map((opt) => {
                const checked = active.includes(opt.value);
                return (
                  <li key={opt.value}>
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-mid transition hover:text-ink">
                      <input type="checkbox" checked={checked} onChange={() => toggleAttr(group.key, opt.value)} className="ctl-check" />
                      <span className="flex-1">{optionLabel(group.key, opt)}</span>
                      <span className="text-xs tabular-nums text-ink-faint">{opt.count}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </details>
        );
      })}
    </aside>
  );
}
