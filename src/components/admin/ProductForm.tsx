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
      className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-primary-soft disabled:opacity-50"
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
      // si marcan esta como principal, desmarcan las demás
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
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="id" value={initial?.id ?? ""} />

      {formState.error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {formState.error}
        </div>
      )}
      {formState.success && (
        <div role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Producto guardado correctamente.
        </div>
      )}

      {/* Información básica */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-base font-bold">Información básica</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="mb-1 block text-sm font-medium">Nombre *</label>
            <input id="name" name="name" required defaultValue={initial?.name ?? ""} className={inputCls} placeholder="Butterfly Dignics 05" />
          </div>
          <div>
            <label htmlFor="brandId" className="mb-1 block text-sm font-medium">Marca *</label>
            <select id="brandId" name="brandId" required defaultValue={initial?.brandId ?? ""} className={inputCls}>
              <option value="">Selecciona…</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="categoryId" className="mb-1 block text-sm font-medium">Categoría *</label>
            <select
              id="categoryId"
              name="categoryId"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputCls}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="slug" className="mb-1 block text-sm font-medium">
              Slug <span className="text-xs text-slate-400">(vacío = automático)</span>
            </label>
            <input id="slug" name="slug" defaultValue={initial?.slug ?? ""} className={inputCls} placeholder="butterfly-dignics-05" />
          </div>
          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium">Estado</label>
            <select id="status" name="status" defaultValue={initial?.status ?? "DRAFT"} className={inputCls}>
              <option value="DRAFT">Borrador</option>
              <option value="PUBLISHED">Publicado</option>
              <option value="ARCHIVED">Archivado</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="summary" className="mb-1 block text-sm font-medium">Resumen corto</label>
            <input id="summary" name="summary" defaultValue={initial?.summary ?? ""} className={inputCls} placeholder="Goma de alta velocidad con gran control…" maxLength={300} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className="mb-1 block text-sm font-medium">Descripción completa</label>
            <textarea id="description" name="description" rows={5} defaultValue={initial?.description ?? ""} className={inputCls} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" defaultChecked={initial?.featured ?? false} className="h-4 w-4 text-primary" />
            Destacado en homepage
          </label>
        </div>
      </section>

      {/* Atributos dinámicos por categoría */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-1 text-base font-bold">Especificaciones — {activeCategory?.name}</h2>
        <p className="mb-4 text-xs text-slate-500">
          Los campos cambian según la categoría. Si el fabricante no publica un dato, déjalo vacío (se muestra «No disponible»).
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {activeAttrs.map((attr) => {
            const current = attrValues.get(attr.key);
            return (
              <div key={attr.key}>
                <label htmlFor={`attr_${attr.key}`} className="mb-1 block text-sm font-medium">
                  {attr.name}
                  {attr.unit ? <span className="ml-1 text-xs text-slate-400">({attr.unit})</span> : null}
                  {attr.scaleName ? <span className="ml-1 text-xs text-slate-400">— {attr.scaleName}</span> : null}
                </label>
                {attr.valueType === "ENUM" && attr.options ? (
                  <select id={`attr_${attr.key}`} name={`attr_${attr.key}`} defaultValue={current?.value ?? ""} className={inputCls}>
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
          <p className="text-sm text-slate-400">Esta categoría aún no tiene atributos definidos.</p>
        )}
      </section>

      {/* Imágenes */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-1 text-base font-bold">Imágenes *</h2>
        <p className="mb-4 text-xs text-slate-500">
          La imagen debe corresponder EXACTAMENTE al producto. Marca una como principal (obligatoria para publicar).
        </p>
        <div className="space-y-4">
          {images.map((img, idx) => (
            <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor={`image_url_${idx}`} className="mb-1 block text-xs font-medium text-slate-600">URL de la imagen *</label>
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
                  <label htmlFor={`image_alt_${idx}`} className="mb-1 block text-xs font-medium text-slate-600">Texto alternativo (alt)</label>
                  <input
                    id={`image_alt_${idx}`}
                    name={`image_alt_${idx}`}
                    value={img.alt}
                    onChange={(e) => updateImage(idx, { alt: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor={`image_source_${idx}`} className="mb-1 block text-xs font-medium text-slate-600">Fuente de la imagen</label>
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
                  <label htmlFor={`image_sourceUrl_${idx}`} className="mb-1 block text-xs font-medium text-slate-600">URL de la fuente</label>
                  <input
                    id={`image_sourceUrl_${idx}`}
                    name={`image_sourceUrl_${idx}`}
                    value={img.sourceUrl}
                    onChange={(e) => updateImage(idx, { sourceUrl: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div className="flex items-end gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name={`image_primary_${idx}`}
                      checked={img.isPrimary}
                      onChange={(e) => updateImage(idx, { isPrimary: e.target.checked })}
                      className="h-4 w-4 text-primary"
                    />
                    Imagen principal
                  </label>
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addImage} className="mt-3 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:border-primary hover:text-primary">
          + Añadir imagen
        </button>
      </section>

      {/* Fuentes */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-1 text-base font-bold">Fuentes *</h2>
        <p className="mb-4 text-xs text-slate-500">URL real de donde se obtuvo la información. Nunca inventar.</p>
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
                  className="text-sm text-red-600 hover:underline"
                >
                  Quitar
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setSources((prev) => [...prev, { url: "", name: "" }])} className="mt-3 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:border-primary hover:text-primary">
          + Añadir fuente
        </button>
      </section>

      {/* Pros / Contras */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-base font-bold text-green-800">Ventajas</h2>
          <div className="space-y-2">
            {pros.map((p, idx) => (
              <input key={idx} name={`pro_${idx}`} defaultValue={p} className={inputCls} placeholder="Ventaja…" />
            ))}
          </div>
          <button type="button" onClick={() => setPros((prev) => [...prev, ""])} className="mt-3 text-sm font-medium text-primary hover:underline">
            + Añadir ventaja
          </button>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-base font-bold text-red-800">Desventajas</h2>
          <div className="space-y-2">
            {cons.map((c, idx) => (
              <input key={idx} name={`con_${idx}`} defaultValue={c} className={inputCls} placeholder="Desventaja…" />
            ))}
          </div>
          <button type="button" onClick={() => setCons((prev) => [...prev, ""])} className="mt-3 text-sm font-medium text-primary hover:underline">
            + Añadir desventaja
          </button>
        </div>
      </section>

      {/* Precio (manual, MVP) */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-1 text-base font-bold">Precio referencial (opcional)</h2>
        <p className="mb-4 text-xs text-slate-500">Precio manual, no se actualiza automáticamente en el MVP.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="price_amount" className="mb-1 block text-sm font-medium">Monto</label>
            <input id="price_amount" name="price_amount" type="number" step="0.01" min="0" defaultValue={initial?.price?.amount ?? ""} className={inputCls} />
          </div>
          <div>
            <label htmlFor="price_currency" className="mb-1 block text-sm font-medium">Moneda</label>
            <select id="price_currency" name="price_currency" defaultValue={initial?.price?.currency ?? "CLP"} className={inputCls}>
              <option value="CLP">CLP — Peso chileno</option>
              <option value="USD">USD — Dólar</option>
              <option value="EUR">EUR — Euro</option>
            </select>
          </div>
          <div>
            <label htmlFor="price_source" className="mb-1 block text-sm font-medium">Fuente del precio</label>
            <input id="price_source" name="price_source" defaultValue={initial?.price?.source ?? ""} className={inputCls} placeholder="Precio referencial" />
          </div>
        </div>
      </section>

      {/* SEO */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-base font-bold">SEO</h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="seoTitle" className="mb-1 block text-sm font-medium">Title (máx. 70)</label>
            <input id="seoTitle" name="seoTitle" defaultValue={initial?.seoTitle ?? ""} className={inputCls} maxLength={70} />
          </div>
          <div>
            <label htmlFor="seoDescription" className="mb-1 block text-sm font-medium">Meta description (máx. 160)</label>
            <textarea id="seoDescription" name="seoDescription" rows={2} defaultValue={initial?.seoDescription ?? ""} className={inputCls} maxLength={160} />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <SubmitButton label={isEdit ? "Guardar cambios" : "Crear producto"} />
        <Link href="/admin/products" className="text-sm text-slate-500 hover:text-slate-700">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
