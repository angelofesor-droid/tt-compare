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
        <select
          value={sort}
          onChange={(e) => changeSort(e.target.value)}
          className="ctl-select w-full"
          aria-label="Ordenar resultados"
        >
          <option value="recent">Más recientes</option>
          <option value="name">Nombre (A–Z)</option>
        </select>
      </div>

      <hr className="metal-divider mb-5" />

      {/* Marcas */}
      {brands.length > 0 && (
        <div className="mb-5">
          <h3 className="spec-label mb-2.5">Marca</h3>
          <ul className="space-y-2">
            {brands.map((b) => (
              <li key={b.id}>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-mid transition hover:text-ink">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b.name)}
                    onChange={() => toggleBrand(b.name)}
                    className="ctl-check"
                  />
                  <span className="flex-1">{b.name}</span>
                  <span className="text-xs tabular-nums text-ink-faint">{b.count}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Atributos dinámicos */}
      {attributes.map((group) => (
        <div key={group.key} className="mb-5">
          <h3 className="spec-label mb-2.5">{group.name}</h3>
          <ul className="space-y-2">
            {group.options.map((opt) => {
              const checked = selectedAttrs[group.key]?.includes(opt.value) ?? false;
              return (
                <li key={opt.value}>
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-mid transition hover:text-ink">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAttr(group.key, opt.value)}
                      className="ctl-check"
                    />
                    <span className="flex-1">{opt.value}</span>
                    <span className="text-xs tabular-nums text-ink-faint">{opt.count}</span>
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
