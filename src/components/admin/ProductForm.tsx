"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createProductAction, updateProductAction, type FormState } from "@/app/admin/(protected)/products/actions";

export interface AttrDef {
  key: string;
  name: string;
  valueType: "NUMBER" | "TEXT" | "ENUM" | "BOOLEAN";
  unit: string | null;
  options: string[] | null;
  scaleName: string | null;
  filterable: boolean;
  sortOrder: number;
}

export interface CategoryDef {
  id: string;
  key: string;
  name: string;
  attributes: AttrDef[];
}

export interface BrandDef {
  id: string;
  name: string;
}

export interface ImageInput {
  url: string;
  alt: string;
  source: string;
  sourceUrl: string;
  isPrimary: boolean;
}

export interface ProductInitial {
  id?: string;
  name: string;
  slug: string;
  brandId: string;
  categoryId: string;
  summary: string | null;
  description: string | null;
  status: string;
  featured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  images: ImageInput[];
  sources: { url: string; name: string }[];
  attributes: { key: string; value: string; unit: string | null; scale: string | null }[];
  pros: string[];
  cons: string[];
  price: { amount: string; currency: string; source: string | null } | null;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="ctl ctl-primary rounded-lg px-5 py-2.5 text-sm disabled:opacity-50"
    >
      {pending ? "Guardando…" : label}
    </button>
  );
}

export default function ProductForm({
  categories,
  brands,
  initial,
}: {
  categories: CategoryDef[];
  brands: BrandDef[];
  initial: ProductInitial | null;
}) {
  const isEdit = Boolean(initial?.id);
  const [formState, action] = useFormState<FormState, FormData>(
    isEdit ? updateProductAction : createProductAction,
    {},
  );

  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [images, setImages] = useState<ImageInput[]>(initial?.images ?? [{ url: "", alt: "", source: "", sourceUrl: "", isPrimary: true }]);
  const [sources, setSources] = useState(initial?.sources ?? [{ url: "", name: "" }]);
  const [pros, setPros] = useState<string[]>(initial?.pros ?? [""]);
  const [cons, setCons] = useState<string[]>(initial?.cons ?? [""]);

  const activeCategory = categories.find((c) => c.id === categoryId) ?? categories[0];
  const activeAttrs = activeCategory?.attributes ?? [];
  const attrValues = useMemo(() => {
    const map = new Map<string, { value: string; unit: string | null; scale: string | null }>();
    for (const a of initial?.attributes ?? []) map.set(a.key, { value: a.value, unit: a.unit, scale: a.scale });
    return map;
  }, [initial]);

  function updateImage(idx: number, patch: Partial<ImageInput>) {
    setImages((prev) => {
      const next = prev.map((img, i) => (i === idx ? { ...img, ...patch } : img));
      if (patch.isPrimary) {
        return next.map((img, i) => ({ ...img, isPrimary: i === idx }));
      }
      return next;
    });
  }

  function addImage() {
    setImages((prev) => [...prev, { url: "", alt: "", source: "", sourceUrl: "", isPrimary: false }]);
  }

  const inputCls =
    "w-full rounded-md border border-metal bg-surface-inset px-3 py-2 text-sm text-ink shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] placeholder:text-ink-faint focus:border-accent-line focus:outline-none focus:ring-2 focus:ring-accent/15";
  const selectCls = "ctl-select w-full";

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="id" value={initial?.id ?? ""} />

      {formState.error && (
        <div role="alert" className="rounded-lg border border-danger/50 bg-danger/10 px-4 py-3 text-sm text-danger">
          {formState.error}
        </div>
      )}
      {formState.success && (
        <div role="status" className="rounded-lg border border-ok/50 bg-ok/10 px-4 py-3 text-sm text-ok">
          Producto guardado correctamente.
        </div>
      )}

      {/* Información básica */}
      <section className="panel p-5">
        <h2 className="sec-label mb-4">Información básica</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="spec-label mb-1.5 block">Nombre *</label>
            <input id="name" name="name" required defaultValue={initial?.name ?? ""} className={inputCls} placeholder="Butterfly Dignics 05" />
          </div>
          <div>
            <label htmlFor="brandId" className="spec-label mb-1.5 block">Marca *</label>
            <select id="brandId" name="brandId" required defaultValue={initial?.brandId ?? ""} className={selectCls}>
              <option value="">Selecciona…</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="categoryId" className="spec-label mb-1.5 block">Categoría *</label>
            <select
              id="categoryId"
              name="categoryId"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={selectCls}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="slug" className="spec-label mb-1.5 block">
              Slug <span className="text-ink-faint">(vacío = automático)</span>
            </label>
            <input id="slug" name="slug" defaultValue={initial?.slug ?? ""} className={inputCls} placeholder="butterfly-dignics-05" />
          </div>
          <div>
            <label htmlFor="status" className="spec-label mb-1.5 block">Estado</label>
            <select id="status" name="status" defaultValue={initial?.status ?? "DRAFT"} className={selectCls}>
              <option value="DRAFT">Borrador</option>
              <option value="PUBLISHED">Publicado</option>
              <option value="ARCHIVED">Archivado</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="summary" className="spec-label mb-1.5 block">Resumen corto</label>
            <input id="summary" name="summary" defaultValue={initial?.summary ?? ""} className={inputCls} placeholder="Goma de alta velocidad con gran control…" maxLength={300} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className="spec-label mb-1.5 block">Descripción completa</label>
            <textarea id="description" name="description" rows={5} defaultValue={initial?.description ?? ""} className={inputCls} />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-mid">
            <input type="checkbox" name="featured" defaultChecked={initial?.featured ?? false} className="ctl-check" />
            Destacado en homepage
          </label>
        </div>
      </section>

      {/* Atributos dinámicos por categoría */}
      <section className="panel p-5">
        <h2 className="sec-label mb-1">Especificaciones — {activeCategory?.name}</h2>
        <p className="mb-4 text-xs text-ink-low">
          Los campos cambian según la categoría. Si el fabricante no publica un dato, déjalo vacío (se muestra «No disponible»).
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {activeAttrs.map((attr) => {
            const current = attrValues.get(attr.key);
            return (
              <div key={attr.key}>
                <label htmlFor={`attr_${attr.key}`} className="spec-label mb-1.5 block">
                  {attr.name}
                  {attr.unit ? <span className="ml-1 text-ink-faint">({attr.unit})</span> : null}
                  {attr.scaleName ? <span className="ml-1 text-ink-faint">— {attr.scaleName}</span> : null}
                </label>
                {attr.valueType === "ENUM" && attr.options ? (
                  <select id={`attr_${attr.key}`} name={`attr_${attr.key}`} defaultValue={current?.value ?? ""} className={selectCls}>
                    <option value="">No disponible</option>
                    {attr.options.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`attr_${attr.key}`}
                    name={`attr_${attr.key}`}
                    type={attr.valueType === "NUMBER" ? "number" : "text"}
                    step="any"
                    defaultValue={current?.value ?? ""}
                    className={inputCls}
                    placeholder="No disponible"
                  />
                )}
                {attr.scaleName && (
                  <input
                    type="hidden"
                    name={`attr_scale_${attr.key}`}
                    defaultValue={current?.scale ?? attr.scaleName ?? ""}
                  />
                )}
                {attr.unit && (
                  <input type="hidden" name={`attr_unit_${attr.key}`} defaultValue={current?.unit ?? attr.unit ?? ""} />
                )}
              </div>
            );
          })}
        </div>
        {activeAttrs.length === 0 && (
          <p className="text-sm text-ink-faint">Esta categoría aún no tiene atributos definidos.</p>
        )}
      </section>

      {/* Imágenes */}
      <section className="panel p-5">
        <h2 className="sec-label mb-1">Imágenes *</h2>
        <p className="mb-4 text-xs text-ink-low">
          La imagen debe corresponder EXACTAMENTE al producto. Marca una como principal (obligatoria para publicar).
        </p>
        <div className="space-y-4">
          {images.map((img, idx) => (
            <div key={idx} className="rounded-lg border border-metal bg-deep/50 p-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor={`image_url_${idx}`} className="spec-label mb-1 block">URL de la imagen *</label>
                  <input
                    id={`image_url_${idx}`}
                    name={`image_url_${idx}`}
                    value={img.url}
                    onChange={(e) => updateImage(idx, { url: e.target.value })}
                    className={inputCls}
                    placeholder="https://…"
                    required={idx === 0}
                  />
                </div>
                <div>
                  <label htmlFor={`image_alt_${idx}`} className="spec-label mb-1 block">Texto alternativo (alt)</label>
                  <input
                    id={`image_alt_${idx}`}
                    name={`image_alt_${idx}`}
                    value={img.alt}
                    onChange={(e) => updateImage(idx, { alt: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor={`image_source_${idx}`} className="spec-label mb-1 block">Fuente de la imagen</label>
                  <input
                    id={`image_source_${idx}`}
                    name={`image_source_${idx}`}
                    value={img.source}
                    onChange={(e) => updateImage(idx, { source: e.target.value })}
                    className={inputCls}
                    placeholder="Fabricante / Distribuidor"
                  />
                </div>
                <div>
                  <label htmlFor={`image_sourceUrl_${idx}`} className="spec-label mb-1 block">URL de la fuente</label>
                  <input
                    id={`image_sourceUrl_${idx}`}
                    name={`image_sourceUrl_${idx}`}
                    value={img.sourceUrl}
                    onChange={(e) => updateImage(idx, { sourceUrl: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div className="flex items-end gap-3">
                  <label className="flex items-center gap-2 text-sm text-ink-mid">
                    <input
                      type="checkbox"
                      name={`image_primary_${idx}`}
                      checked={img.isPrimary}
                      onChange={(e) => updateImage(idx, { isPrimary: e.target.checked })}
                      className="ctl-check"
                    />
                    Imagen principal
                  </label>
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-xs text-danger hover:underline"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addImage} className="ctl ctl-ghost mt-3 rounded-lg px-3 py-1.5 text-sm">
          + Añadir imagen
        </button>
      </section>

      {/* Fuentes */}
      <section className="panel p-5">
        <h2 className="sec-label mb-1">Fuentes *</h2>
        <p className="mb-4 text-xs text-ink-low">URL real de donde se obtuvo la información. Nunca inventar.</p>
        <div className="space-y-3">
          {sources.map((src, idx) => (
            <div key={idx} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_2fr_auto]">
              <input
                name={`source_name_${idx}`}
                defaultValue={src.name}
                className={inputCls}
                placeholder="Nombre (ej. Sitio oficial Butterfly)"
              />
              <input
                name={`source_url_${idx}`}
                defaultValue={src.url}
                className={inputCls}
                placeholder="https://…"
                required={idx === 0}
              />
              {sources.length > 1 && (
                <button
                  type="button"
                  onClick={() => setSources((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-sm text-danger hover:underline"
                >
                  Quitar
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setSources((prev) => [...prev, { url: "", name: "" }])} className="ctl ctl-ghost mt-3 rounded-lg px-3 py-1.5 text-sm">
          + Añadir fuente
        </button>
      </section>

      {/* Pros / Contras */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="panel p-5">
          <h2 className="spec-label mb-3 text-ok">Ventajas</h2>
          <div className="space-y-2">
            {pros.map((p, idx) => (
              <input key={idx} name={`pro_${idx}`} defaultValue={p} className={inputCls} placeholder="Ventaja…" />
            ))}
          </div>
          <button type="button" onClick={() => setPros((prev) => [...prev, ""])} className="mt-3 text-sm font-medium text-accent hover:underline">
            + Añadir ventaja
          </button>
        </div>
        <div className="panel p-5">
          <h2 className="spec-label mb-3 text-danger">Desventajas</h2>
          <div className="space-y-2">
            {cons.map((c, idx) => (
              <input key={idx} name={`con_${idx}`} defaultValue={c} className={inputCls} placeholder="Desventaja…" />
            ))}
          </div>
          <button type="button" onClick={() => setCons((prev) => [...prev, ""])} className="mt-3 text-sm font-medium text-accent hover:underline">
            + Añadir desventaja
          </button>
        </div>
      </section>

      {/* Precio (manual, MVP) */}
      <section className="panel p-5">
        <h2 className="sec-label mb-1">Precio referencial (opcional)</h2>
        <p className="mb-4 text-xs text-ink-low">Precio manual, no se actualiza automáticamente en el MVP.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="price_amount" className="spec-label mb-1.5 block">Monto</label>
            <input id="price_amount" name="price_amount" type="number" step="0.01" min="0" defaultValue={initial?.price?.amount ?? ""} className={inputCls} />
          </div>
          <div>
            <label htmlFor="price_currency" className="spec-label mb-1.5 block">Moneda</label>
            <select id="price_currency" name="price_currency" defaultValue={initial?.price?.currency ?? "CLP"} className={selectCls}>
              <option value="CLP">CLP — Peso chileno</option>
              <option value="USD">USD — Dólar</option>
              <option value="EUR">EUR — Euro</option>
            </select>
          </div>
          <div>
            <label htmlFor="price_source" className="spec-label mb-1.5 block">Fuente del precio</label>
            <input id="price_source" name="price_source" defaultValue={initial?.price?.source ?? ""} className={inputCls} placeholder="Precio referencial" />
          </div>
        </div>
      </section>

      {/* SEO */}
      <section className="panel p-5">
        <h2 className="sec-label mb-4">SEO</h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="seoTitle" className="spec-label mb-1.5 block">Title (máx. 70)</label>
            <input id="seoTitle" name="seoTitle" defaultValue={initial?.seoTitle ?? ""} className={inputCls} maxLength={70} />
          </div>
          <div>
            <label htmlFor="seoDescription" className="spec-label mb-1.5 block">Meta description (máx. 160)</label>
            <textarea id="seoDescription" name="seoDescription" rows={2} defaultValue={initial?.seoDescription ?? ""} className={inputCls} maxLength={160} />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <SubmitButton label={isEdit ? "Guardar cambios" : "Crear producto"} />
        <Link href="/admin/products" className="text-sm text-ink-low transition hover:text-ink">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
