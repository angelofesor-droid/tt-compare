import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CompareError, getCompareProducts, unionAttributes } from "@/lib/services/compare.service";
import RadarComparison, { type RadarRow, type RadarProduct } from "@/components/compare/RadarComparison";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slugs: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slugs } = await params;
  const list = slugs.split("-vs-");
  if (list.length < 2) return { title: "Comparación inválida" };

  try {
    const { categoryName, products } = await getCompareProducts(list);
    const names = products.map((p) => p.name);
    return {
      title: `${names.join(" vs ")} — comparación de ${categoryName.toLowerCase()}s`,
      description: `Compara ${names.join(" vs ")}: especificaciones, ventajas y desventajas para elegir la mejor ${categoryName.toLowerCase()}.`,
      alternates: { canonical: `/compare/${slugs}` },
    };
  } catch {
    return { title: "Comparación no disponible" };
  }
}

function formatPrice(value: string | null): string {
  if (!value) return "No disponible";
  const [amount, currency] = value.split(" ");
  if (currency === "CLP") return `$${Math.round(Number(amount)).toLocaleString("es-CL")}`;
  return value;
}

export default async function CompareDetailPage({ params }: PageProps) {
  const { slugs } = await params;
  const list = slugs.split("-vs-");

  let data;
  try {
    data = await getCompareProducts(list);
  } catch (e) {
    if (e instanceof CompareError) {
      notFound();
    }
    notFound();
  }

  const { categoryName, products } = data;
  const attributes = unionAttributes(products);
  const { rows: radarRows, radarProducts } = buildRadarData(products);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Comparación de ${categoryName.toLowerCase()}s`,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/product/${p.slug}`,
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Miga de pan" className="mb-6 text-xs text-ink-low">
        <Link href="/" className="transition hover:text-ink">Inicio</Link>
        <span className="mx-1.5 text-ink-faint">/</span>
        <Link href="/compare" className="transition hover:text-ink">Comparar</Link>
        <span className="mx-1.5 text-ink-faint">/</span>
        <span className="text-ink-mid">Análisis de {categoryName.toLowerCase()}s</span>
      </nav>

      <p className="sec-label mb-2">Panel de análisis</p>
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        Comparación de {categoryName.toLowerCase()}s
      </h1>
      <p className="mt-2 text-sm text-ink-low">
        {products.length} {categoryName.toLowerCase()}s alineados. Las escalas corresponden a cada fabricante.
      </p>

      {/* Cabecera: productos alineados (imagen + nombre clickeables) */}
      <div className={`mt-8 grid gap-4 ${products.length === 2 ? "sm:grid-cols-2" : products.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4"}`}>
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.slug}`}
            className="object-card group flex flex-col items-center p-4 text-center"
          >
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
        ))}
      </div>

      {/* Gráfico de radar comparativo (entre imágenes y matriz) */}
      <div className="mt-10">
        <RadarComparison rows={radarRows} products={radarProducts} />
      </div>

      {/* Matriz de análisis (desktop) */}
      <div className="spec-plate mt-10 hidden md:block">
        <div className="grid" style={{ gridTemplateColumns: `180px repeat(${products.length}, 1fr)` }}>
          {/* Encabezado */}
          <div className="border-b border-metal/70 bg-deep/40 px-4 py-3">
            <span className="spec-label">Característica</span>
          </div>
          {products.map((p) => (
            <div key={p.id} className="border-b border-l border-metal/70 bg-deep/40 px-4 py-3">
              <span className="text-sm font-semibold text-ink">{p.name}</span>
            </div>
          ))}

          {/* Marca */}
          <Row values={products.map((p) => p.brand)} label="Marca" products={products} />

          {/* Precio */}
          <Row values={products.map((p) => p.price)} label="Precio" products={products} />

          {/* Atributos */}
          {attributes.map((attr) => (
            <Row
              key={attr.key}
              label={attr.name}
              products={products}
              values={products.map((p) => {
                const found = p.attributes.find((a) => a.key === attr.key);
                if (!found) return null;
                return `${found.value}${found.unit ? ` ${found.unit}` : ""}${found.scale ? ` (${found.scale})` : ""}`;
              })}
            />
          ))}

          {/* Ventajas */}
          <Row
            label="Ventajas"
            products={products}
            values={products.map((p) => (p.pros.length > 0 ? p.pros.join(" · ") : null))}
            kind="pros"
          />

          {/* Desventajas */}
          <Row
            label="Desventajas"
            products={products}
            values={products.map((p) => (p.cons.length > 0 ? p.cons.join(" · ") : null))}
            kind="cons"
          />
        </div>
      </div>

      {/* Vista móvil: tarjetas apiladas */}
      <div className="mt-8 space-y-6 md:hidden">
        {products.map((p) => (
          <div key={p.id} className="panel p-4">
            <Link href={`/product/${p.slug}`} className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-deep">
                {p.image ? (
                  <Image src={p.image.url} alt={p.image.alt ?? p.name} fill sizes="56px" className="object-contain p-1" />
                ) : (
                  <span className="flex h-full items-center justify-center text-[10px] text-ink-faint">Sin img</span>
                )}
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">{p.brand}</p>
                <p className="text-sm font-semibold text-ink">{p.name}</p>
                <p className="text-xs text-ink-low">{formatPrice(p.price)}</p>
              </div>
            </Link>
            <div className="mt-3 space-y-1.5 border-t border-metal/60 pt-3">
              {attributes.map((attr) => {
                const found = p.attributes.find((a) => a.key === attr.key);
                return (
                  <div key={attr.key} className="flex justify-between gap-3 text-sm">
                    <span className="spec-label">{attr.name}</span>
                    <span className="spec-value">
                      {found ? (
                        <>
                          {found.value}
                          {found.unit ? ` ${found.unit}` : ""}
                        </>
                      ) : (
                        <span className="font-normal text-ink-faint">—</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/compare" className="ctl ctl-ghost rounded-lg px-5 py-2.5 text-sm">
          ← Elegir otros productos
        </Link>
      </div>
    </div>
  );
}

/** Detección de diferencias: si hay ≥2 valores distintos en la fila */
function valuesDiffer(values: (string | null)[]): boolean {
  const seen = new Set(values.filter(Boolean));
  return seen.size > 1;
}

/** Construye los datos del radar: solo atributos numéricos con la misma escala entre productos */
function buildRadarData(products: Awaited<ReturnType<typeof getCompareProducts>>["products"]): {
  rows: RadarRow[];
  radarProducts: RadarProduct[];
} {
  const palette = ["#e87b3f", "#5aa7d6", "#7bc98d", "#c08ad9"];
  const radarProducts: RadarProduct[] = products.map((p, i) => ({
    slug: p.slug,
    name: p.name,
    color: palette[i % palette.length],
  }));

  // Reunir todos los atributos numéricos presentes
  const byKey = new Map<string, { name: string; entries: { slug: string; raw: number; unit: string | null; scale: string | null }[] }>();
  for (const p of products) {
    for (const a of p.attributes) {
      const raw = Number.parseFloat(String(a.value).replace(",", "."));
      if (Number.isNaN(raw)) continue;
      const entry = byKey.get(a.key) ?? { name: a.name, entries: [] };
      entry.entries.push({ slug: p.slug, raw, unit: a.unit, scale: a.scale });
      byKey.set(a.key, entry);
    }
  }

  const rows: RadarRow[] = [];
  for (const [key, group] of byKey) {
    if (group.entries.length < 2) continue;
    // Escala coincidente entre los productos que tienen el atributo
    const scales = new Set(group.entries.map((e) => e.scale ?? ""));
    if (scales.size > 1) continue; // no mezclar escalas de fabricantes distintos
    const values = group.entries.map((e) => e.raw);
    const max = Math.max(...values);
    if (max <= 0) continue;
    rows.push({
      key,
      name: group.name,
      max,
      points: group.entries.map((e) => ({
        slug: e.slug,
        value: (e.raw / max) * 100,
        raw: e.raw,
        label: `${e.raw}${e.unit ? ` ${e.unit}` : ""}${e.scale ? ` (${e.scale})` : ""}`,
        unit: e.unit,
        scale: e.scale,
      })),
    });
  }

  return { rows, radarProducts };
}

/** Fila de la matriz con indicador discreto de diferencias */
function Row({
  label,
  values,
  products,
  kind,
}: {
  label: string;
  values: (string | null)[];
  products: { id: string }[];
  kind?: "pros" | "cons";
}) {
  const differs = valuesDiffer(values);
  return (
    <>
      <div className={`flex items-center gap-2 border-b border-metal/40 px-4 py-3 ${differs ? "bg-accent-wash/40" : ""}`}>
        {differs && (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden title="Valores diferentes" />
        )}
        <span className="spec-label">{label}</span>
      </div>
      {products.map((p, i) => {
        const value = values[i];
        return (
          <div key={p.id} className={`border-b border-l border-metal/40 px-4 py-3 ${differs ? "bg-accent-wash/40" : ""}`}>
            {value ? (
              <span
                className={`text-sm ${kind === "pros" ? "text-ok" : kind === "cons" ? "text-danger" : "text-ink"} ${
                  kind ? "leading-relaxed" : "font-medium tabular-nums"
                }`}
              >
                {value}
              </span>
            ) : (
              <span className="text-sm text-ink-faint">No disponible</span>
            )}
          </div>
        );
      })}
    </>
  );
}
