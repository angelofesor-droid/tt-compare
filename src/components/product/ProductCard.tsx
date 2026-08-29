import Link from "next/link";
import Image from "next/image";

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
    <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-primary/40 hover:shadow-md">
      <Link href={href} className="relative block aspect-square overflow-hidden bg-slate-100" aria-label={product.name}>
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.alt ?? product.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            Sin imagen
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          {product.brand.name}
        </p>
        <h3 className="text-sm font-semibold leading-snug text-slate-900">
          <Link href={href} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>
        {showCategory && product.category && (
          <p className="text-xs text-slate-500">{product.category.name}</p>
        )}

        {specs.length > 0 && (
          <ul className="mt-1 flex flex-wrap gap-1">
            {specs.map((s) => (
              <li
                key={s.key}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
              >
                {s.value}
                {s.unit ? ` ${s.unit}` : ""}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          {product.price ? (
            <span className="text-sm font-semibold text-slate-900">
              {formatPrice(product.price.amount, product.price.currency)}
            </span>
          ) : (
            <span className="text-xs text-slate-400">Precio no disponible</span>
          )}
          <Link
            href={`/compare?a=${product.slug}`}
            className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-primary hover:text-primary"
          >
            Comparar
          </Link>
        </div>
      </div>
    </article>
  );
}
