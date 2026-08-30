import Link from "next/link";
import { getProductReviewSummary, getProductReviews } from "@/lib/services/review.service";

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span role="img" className="inline-flex items-center gap-0.5" aria-label={`${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 20 20"
          className={`h-4 w-4 ${n <= full ? "fill-accent" : "fill-metal stroke-metal-light"}`}
          aria-hidden
        >
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

export default async function ReviewsSection({ productId }: { productId: string }) {
  const [summary, reviews] = await Promise.all([
    getProductReviewSummary(productId),
    getProductReviews(productId, 10),
  ]);

  return (
    <section className="mt-14">
      <h2 className="sec-label mb-5">Comentarios de usuarios</h2>

      {summary.count === 0 ? (
        <div className="panel flex flex-col items-center justify-center p-10 text-center">
          <p className="text-base font-semibold text-ink">Sin comentarios aún</p>
          <p className="mt-1 max-w-md text-sm text-ink-low">
            Este producto todavía no tiene feedback de la comunidad. Pronto podrás dejar tu comentario.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          {/* Resumen */}
          <div className="panel h-fit p-5">
            <div className="flex items-end gap-3">
              <span className="text-5xl font-bold tabular-nums text-ink">{summary.avgRating}</span>
              <div className="pb-1">
                <Stars rating={summary.avgRating ?? 0} />
                <p className="mt-0.5 text-xs text-ink-low">
                  {summary.count} {summary.count === 1 ? "comentario" : "comentarios"}
                </p>
              </div>
            </div>

            {summary.avgDurability !== null && (
              <div className="mt-4 rounded-lg border border-metal/60 bg-deep/40 p-3">
                <p className="spec-label">Durabilidad según usuarios</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-ink">
                  {summary.avgDurability}
                  <span className="text-sm font-normal text-ink-low"> / 10</span>
                </p>
              </div>
            )}

            <div className="mt-4 space-y-1.5">
              {summary.distribution.map((d) => (
                <div key={d.stars} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-ink-low">{d.stars}</span>
                  <span className="w-4 text-accent" aria-hidden>★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-deep">
                    <div
                      className="h-full rounded-full bg-accent/70"
                      style={{ width: `${summary.count > 0 ? (d.count / summary.count) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="w-4 text-right tabular-nums text-ink-faint">{d.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lista de comentarios */}
          <div className="space-y-3">
            {reviews.map((r) => (
              <article key={r.id} className="panel p-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-sm font-semibold text-ink">{r.author}</p>
                  <Stars rating={r.rating} />
                  {r.isEditorial && (
                    <span className="tag border-accent-line text-accent-hi">Valoración editorial</span>
                  )}
                  {r.durabilityRating !== null && (
                    <span className="tag" title="Durabilidad reportada por este usuario">
                      Durabilidad {r.durabilityRating}/10
                    </span>
                  )}
                </div>
                {r.title && <p className="mt-2 text-sm font-medium text-ink-mid">{r.title}</p>}
                <p className="mt-1 text-sm leading-relaxed text-ink-mid">{r.comment}</p>
                {r.source && (
                  <p className="mt-2 text-xs text-ink-faint">
                    Fuente:{" "}
                    <Link
                      href={r.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent transition hover:text-accent-hi"
                    >
                      {new URL(r.source).hostname}
                    </Link>
                    {!r.isEditorial && " · opinión de un usuario, no de Zona Tenis de Mesa"}
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
