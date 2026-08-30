import Link from "next/link";
import Image from "next/image";
import CompareButton from "@/components/compare/CompareButton";

export interface CardProduct {
  id: string;
  name: string;
  slug: string;
  summary?: string | null;
  brand: { name: string; slug: string };
  category?: { key: string; name: string; slug: string } | null;
  image?: { url: string; alt?: string | null } | null;
  price?: { amount: number; currency: string } | null;
  attributes?: { key: string; value: string; unit?: string | null }[];
}

function formatPrice(amount: number, currency: string): string {
  if (currency === "CLP") {
    return `$${Math.round(amount).toLocaleString("es-CL")}`;
  }
  return `${amount.toLocaleString("es-CL")} ${currency}`;
}

export default function ProductCard({ product, showCategory = false }: { product: CardProduct; showCategory?: boolean }) {
  const href = `/product/${product.slug}`;
  const specs = (product.attributes ?? []).slice(0, 3);

  return (
    <article className="object-card group flex flex-col overflow-hidden">
      {/* Imagen: objeto colocado físicamente sobre la superficie */}
      <Link
        href={href}
        className="relative m-2.5 block aspect-square overflow-hidden rounded-lg bg-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_2px_6px_rgba(0,0,0,0.45)]"
        aria-label={product.name}
      >
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.alt ?? product.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-contain p-2 transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-ink-faint">
            Sin imagen
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 px-4 pb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
          {product.brand.name}
        </p>
        <h3 className="text-sm font-semibold leading-snug text-ink">
          <Link href={href} className="transition hover:text-accent-hi">
            {product.name}
          </Link>
        </h3>
        {showCategory && product.category && (
          <p className="text-xs text-ink-low">{product.category.name}</p>
        )}

        {specs.length > 0 && (
          <ul className="mt-1 flex flex-wrap gap-1">
            {specs.map((s) => (
              <li key={s.key} className="tag">
                {s.value}
                {s.unit ? ` ${s.unit}` : ""}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          {product.price ? (
            <span className="text-sm font-bold tabular-nums text-ink">
              {formatPrice(product.price.amount, product.price.currency)}
            </span>
          ) : (
            <span className="text-xs text-ink-faint">Precio no disponible</span>
          )}
          <CompareButton slug={product.slug} className="ctl ctl-compare rounded-full px-3 py-1.5 text-xs" />
        </div>
      </div>
    </article>
  );
}
