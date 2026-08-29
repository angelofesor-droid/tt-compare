import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { getHomepageProducts } from "@/lib/services/catalog.service";

export const dynamic = "force-dynamic";

const categoryIcons: Record<string, string> = {
  RUBBER: "🖐️",
  BLADE: "🏓",
  TABLE: "🏆",
};

export default async function HomePage() {
  const { featured, recent, categories } = await getHomepageProducts();

  return (
    <div>
      {/* Hero */}
      <section className="hero-grid bg-primary text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider">
            Catálogo · Base de datos · Comparador · Guía de compra
          </p>
          <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">
            Elige tu equipamiento de tenis de mesa con datos, no con suerte.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            Gomas, maderos y mesas con características verificadas contra fuentes oficiales.
            Filtra, compara y decide con confianza.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/rubbers"
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/90"
            >
              Explorar gomas
            </Link>
            <Link
              href="/compare"
              className="rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Comparar productos
            </Link>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${cat.slug}`}
              className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 transition hover:border-primary/40 hover:shadow-md"
            >
              <div>
                <p className="text-2xl">{categoryIcons[cat.key] ?? "🏓"}</p>
                <h2 className="mt-2 text-lg font-semibold">{cat.namePlural}</h2>
                <p className="text-xs text-slate-500">
                  {cat._count.products} {cat._count.products === 1 ? "producto" : "productos"}
                </p>
              </div>
              <span className="text-sm font-medium text-primary opacity-0 transition group-hover:opacity-100">
                Ver →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Destacados */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-bold">Destacados</h2>
            <Link href="/rubbers" className="text-sm font-medium text-primary hover:underline">
              Ver todo
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Recientes */}
      {recent.length > 0 && (
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <h2 className="mb-4 text-xl font-bold">Agregados recientemente</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {recent.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Propuesta de valor */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              title: "Datos verificados",
              text: "Cada especificación conserva su fuente y escala original del fabricante. No inventamos números.",
            },
            {
              title: "Comparación real",
              text: "Compara solo productos de la misma categoría, con las características que importan.",
            },
            {
              title: "Imágenes correctas",
              text: "La imagen de cada producto corresponde al modelo exacto, con su fuente registrada.",
            },
          ].map((v) => (
            <div key={v.title} className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-base font-semibold">{v.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{v.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
