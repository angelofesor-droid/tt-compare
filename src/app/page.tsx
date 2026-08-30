import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { getHomepageProducts } from "@/lib/services/catalog.service";

export const dynamic = "force-dynamic";

const categoryMeta: Record<string, { label: string; desc: string; accent: string }> = {
  RUBBER: {
    label: "Gomas",
    desc: "Velocidad, spin y control. Lisas, antispin y granos.",
    accent: "text-accent",
  },
  BLADE: {
    label: "Maderos",
    desc: "Composición, capas y mango. La base de tu juego.",
    accent: "text-ink-mid",
  },
  TABLE: {
    label: "Mesas",
    desc: "Indoor y outdoor, plegables, con certificación ITTF.",
    accent: "text-ink-mid",
  },
};

export default async function HomePage() {
  const { featured, recent, categories } = await getHomepageProducts();

  // ProductCard espera { image } (singular) y { price }; getHomepageProducts devuelve
  // objetos Prisma con { images[] } y { prices[] }. Se mapea a la forma de la tarjeta.
  const toCard = (p: {
    id: string;
    name: string;
    slug: string;
    brand: { name: string; slug: string };
    images: { url: string; alt: string | null }[];
    prices: { amount: unknown; currency: string }[];
  }) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: { name: p.brand.name, slug: p.brand.slug },
    image: p.images[0] ? { url: p.images[0].url, alt: p.images[0].alt } : null,
    price: p.prices[0] ? { amount: Number(p.prices[0].amount), currency: p.prices[0].currency } : null,
  });

  // Módulos de categoría: GOMAS | MADEROS / MESAS (grid modernista responsive)
  const catModules = categories.slice(0, 3);

  return (
    <div>
      {/* Composición editorial de entrada */}
      <section className="relative overflow-hidden border-b border-metal">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_420px_at_70%_-10%,rgba(232,123,63,0.08),transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20">
          <p className="sec-label mb-6">Catálogo técnico · Base de datos · Comparador</p>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Zona Tenis de Mesa
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-mid sm:text-lg">
            Compara el equipamiento que realmente necesitas. Gomas, maderos y mesas
            con características verificadas contra fuentes oficiales.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/compare" className="ctl ctl-primary px-5 py-2.5 text-sm">
              Comparar productos
            </Link>
            <Link href="/rubbers" className="ctl ctl-ghost px-5 py-2.5 text-sm">
              Explorar el catálogo
            </Link>
          </div>
        </div>
      </section>

      {/* Módulos de categoría (cuadrícula modernista) */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {catModules.slice(0, 2).map((cat) => (
            <CategoryModule key={cat.id} cat={cat} />
          ))}
        </div>
        {catModules[2] && (
          <div className="mt-4">
            <CategoryModule cat={catModules[2]} />
          </div>
        )}
      </section>

      {/* Destacados */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="sec-label">Destacados</h2>
            <Link href="/rubbers" className="text-sm font-medium text-accent transition hover:text-accent-hi">
              Ver todo →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={toCard(p)} />
            ))}
          </div>
        </section>
      )}

      {/* Recientes */}
      {recent.length > 0 && (
        <section className="border-t border-metal bg-graphite/40">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <h2 className="sec-label mb-5">Agregados recientemente</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {recent.map((p) => (
                <ProductCard key={p.id} product={toCard(p)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Propuesta de valor */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              title: "Datos verificados",
              text: "Cada especificación conserva su fuente y su escala original del fabricante. No inventamos números.",
            },
            {
              title: "Comparación real",
              text: "Compara solo productos de la misma categoría, con las características que importan para decidir.",
            },
            {
              title: "Imágenes correctas",
              text: "La imagen de cada producto corresponde al modelo exacto, con su fuente registrada.",
            },
          ].map((v) => (
            <div key={v.title} className="panel p-5">
              <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-ink">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-mid">{v.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

async function CategoryModule({ cat }: { cat: { id: string; key: string; namePlural: string; slug: string; description: string | null; _count: { products: number } } }) {
  const meta = categoryMeta[cat.key] ?? { label: cat.namePlural, desc: cat.description ?? "", accent: "text-ink-mid" };
  return (
    <Link
      href={`/${cat.slug}`}
      className="object-card group relative flex min-h-36 flex-col justify-between overflow-hidden p-6"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.04),transparent_70%)]" />
      <div>
        <p className={`text-2xl font-bold uppercase tracking-[0.1em] sm:text-3xl ${meta.accent}`}>
          {meta.label}
        </p>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-low">{meta.desc}</p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="tag">
          {cat._count.products} {cat._count.products === 1 ? "producto" : "productos"}
        </span>
        <span className="text-sm font-semibold text-ink-low transition group-hover:translate-x-0.5 group-hover:text-accent">
          Ver →
        </span>
      </div>
    </Link>
  );
}
