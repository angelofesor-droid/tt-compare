import type { Metadata } from "next";
import Link from "next/link";
import { LEVELS } from "@/lib/services/guide.service";

export const metadata: Metadata = {
  title: "Guías de compra de tenis de mesa",
  description:
    "Guías de compra por nivel: qué gomas y maderos elegir según tu nivel de juego (principiante, intermedio, avanzado).",
  alternates: { canonical: "/guias" },
};

export default function GuidesIndexPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <p className="sec-label mb-2">Guías de compra</p>
      <h1 className="text-3xl font-bold tracking-tight text-ink">Elige tu equipamiento por nivel</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-mid">
        Recomendaciones de gomas y maderos según tu nivel de juego, basadas en los datos verificados del catálogo.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {LEVELS.map((l) => (
          <Link key={l.key} href={`/guias/${l.slug}`} className="object-card group flex flex-col justify-between p-6">
            <div>
              <p className="sec-label">{l.name}</p>
              <p className="mt-3 text-lg font-bold text-ink transition group-hover:text-accent-hi">{l.title}</p>
              <p className="mt-2 text-sm text-ink-mid">{l.summary}</p>
            </div>
            <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-accent">Ver guía →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
