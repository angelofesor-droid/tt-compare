import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-metal bg-deep/80">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Image
              src="/logo/zt-wordmark.png"
              alt="Zona Tenis de Mesa"
              width={300}
              height={100}
              className="h-auto w-64 max-w-full object-contain"
              priority={false}
            />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-low">
              Catálogo, fichas técnicas y comparaciones de equipamiento de tenis de mesa.
              Datos verificados contra fuentes oficiales de fabricantes.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-mid" aria-label="Pie">
            <Link href="/rubbers" className="transition hover:text-ink">Gomas</Link>
            <Link href="/blades" className="transition hover:text-ink">Maderos</Link>
            <Link href="/tables" className="transition hover:text-ink">Mesas</Link>
            <Link href="/balls" className="transition hover:text-ink">Pelotas</Link>
            <Link href="/marcas" className="transition hover:text-ink">Marcas</Link>
            <Link href="/guias" className="transition hover:text-ink">Guías</Link>
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
