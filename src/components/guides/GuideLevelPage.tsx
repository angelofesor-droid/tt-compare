import Link from "next/link";
import Image from "next/image";
import { LEVELS, type Level, type getRubberRecommendations } from "@/lib/services/guide.service";

type Recommendation = Awaited<ReturnType<typeof getRubberRecommendations>>;

const TIPS: Record<Level, string[]> = {
  beginner: [
    "Prioriza el CONTROL sobre la velocidad: te da margen de error mientras aprendes.",
    "Una goma con esponja blanda y duradera es ideal para empezar.",
    "Elige un madero equilibrado (ALL/ALL+) que no te penalice los golpes imperfectos.",
    "Compra gomas de dureza media-baja: más fáciles de controlar y menos exigentes físicamente.",
  ],
  intermediate: [
    "Ya dominas lo básico: busca un equilibrio entre velocidad y efecto sin perder control.",
    "Una goma 'todo-campo' (ALL+ / OFF-) te permite crecer sin cambiar de equipo al poco tiempo.",
    "Fíjate en el spin: un topsheet adherente mejora el efecto en el juego corto.",
    "El grosor importa: 1.9–2.0 mm ofrece un buen punto medio entre velocidad y control.",
  ],
  advanced: [
    "Busca velocidad y efecto máximos: gomas tensor duras (OFF/OFF+) y maderos con fibra.",
    "Con buen físico, una goma dura de 2.1 mm o Max libera toda su potencia.",
    "Combina gomas según tu estilo: una agresiva en derecha y una más controladora en revés.",
    "Un madero con carbono/ALC aporta velocidad extra para el juego ofensivo de élite.",
  ],
};

export default async function GuideLevelPage({
  level,
  title,
  summary,
  recommendations,
}: {
  level: Level;
  title: string;
  summary: string;
  recommendations: Recommendation;
}) {
  const tips = TIPS[level];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav aria-label="Miga de pan" className="mb-6 text-xs text-ink-low">
        <Link href="/" className="transition hover:text-ink">Inicio</Link>
        <span className="mx-1.5 text-ink-faint">/</span>
        <Link href="/guias" className="transition hover:text-ink">Guías</Link>
        <span className="mx-1.5 text-ink-faint">/</span>
        <span className="text-ink-mid">{LEVELS.find((l) => l.key === level)?.name}</span>
      </nav>

      <p className="sec-label mb-2">Guía de compra</p>
      <h1 className="text-3xl font-bold tracking-tight text-ink">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-mid">{summary}</p>

      {/* Consejos por nivel */}
      <section className="mt-8 grid gap-3 sm:grid-cols-2">
        {tips.map((tip, i) => (
          <div key={i} className="panel p-4 text-sm text-ink-mid">
            <span className="mr-2 font-mono text-accent">0{i + 1}</span>
            {tip}
          </div>
        ))}
      </section>

      {/* Gomas recomendadas */}
      <section className="mt-10">
        <div className="mb-4 flex items-baseline gap-3 border-b border-metal/60 pb-2">
          <h2 className="sec-label">Gomas recomendadas para {LEVELS.find((l) => l.key === level)?.name.toLowerCase()}</h2>
        </div>
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {recommendations.map((r) => (
              <Link key={r.id} href={`/product/${r.slug}`} className="object-card group flex flex-col p-4">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-deep">
                  {r.image ? (
                    <Image src={r.image.url} alt={r.image.alt ?? r.name} fill sizes="(max-width:640px) 50vw, 25vw" className="object-contain p-2" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs text-ink-faint">Sin imagen</span>
                  )}
                </div>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-accent">{r.brand}</p>
                <p className="mt-0.5 text-sm font-semibold text-ink transition group-hover:text-accent-hi">{r.name}</p>
                <p className="mt-1 text-xs text-ink-low">
                  Vel. {r.speed}/10 · Control {r.control}/10{r.spin != null ? ` · Spin ${r.spin}/10` : ""}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="panel p-6 text-sm text-ink-low">
            Aún no hay suficientes gomas con datos en este rango. Pronto se completará la selección.
          </p>
        )}
      </section>
    </div>
  );
}
