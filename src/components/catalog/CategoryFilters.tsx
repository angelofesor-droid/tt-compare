"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export interface FilterOption {
  value: string;
  count: number;
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

export default function CategoryFilters({ brands, attributes, priceRange }: FiltersProps) {
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

  const hasActiveFilters = selectedBrands.length > 0 || Object.keys(selectedAttrs).length > 0 || (priceRange.min !== null && priceRange.max !== null && (searchParams.get("min") || searchParams.get("max")));

  return (
    <aside className="space-y-6 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Filtros</h2>
        {hasActiveFilters && (
          <button onClick={clearAll} className="text-xs font-medium text-accent hover:underline">
            Limpiar
          </button>
        )}
      </div>

      {/* Orden */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">Ordenar</h3>
        <select
          value={sort}
          onChange={(e) => changeSort(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
          aria-label="Ordenar resultados"
        >
          <option value="recent">Más recientes</option>
          <option value="name">Nombre (A–Z)</option>
        </select>
      </div>

      {/* Marcas */}
      {brands.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Marca</h3>
          <ul className="space-y-1.5">
            {brands.map((b) => (
              <li key={b.id}>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b.name)}
                    onChange={() => toggleBrand(b.name)}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span className="flex-1">{b.name}</span>
                  <span className="text-xs text-slate-400">{b.count}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Atributos dinámicos */}
      {attributes.map((group) => (
        <div key={group.key}>
          <h3 className="mb-2 text-sm font-semibold">{group.name}</h3>
          <ul className="space-y-1.5">
            {group.options.map((opt) => {
              const checked = selectedAttrs[group.key]?.includes(opt.value) ?? false;
              return (
                <li key={opt.value}>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAttr(group.key, opt.value)}
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="flex-1">{opt.value}</span>
                    <span className="text-xs text-slate-400">{opt.count}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </aside>
  );
}
