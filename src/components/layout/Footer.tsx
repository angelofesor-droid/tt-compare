import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-metal bg-deep/80">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em]">
              Zona <span className="text-accent">Tenis de Mesa</span>
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-low">
              Catálogo, fichas técnicas y comparaciones de equipamiento de tenis de mesa.
              Datos verificados contra fuentes oficiales de fabricantes.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-mid" aria-label="Pie">
            <Link href="/rubbers" className="transition hover:text-ink">Gomas</Link>
            <Link href="/blades" className="transition hover:text-ink">Maderos</Link>
            <Link href="/tables" className="transition hover:text-ink">Mesas</Link>
            <Link href="/compare" className="transition hover:text-ink">Comparar</Link>
          </nav>
        </div>
        <hr className="metal-divider mt-8" />
        <p className="mt-4 text-xs text-ink-faint">
          Las marcas mencionadas pertenecen a sus respectivos dueños. La información proviene de fuentes públicas.
        </p>
      </div>
    </footer>
  );
}
