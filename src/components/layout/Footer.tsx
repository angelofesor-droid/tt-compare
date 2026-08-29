import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">
              TT <span className="text-accent">Compare</span>
            </p>
            <p className="mt-1 max-w-md text-xs text-slate-500">
              Catálogo, fichas y comparaciones de equipamiento de tenis de mesa.
              Datos verificados contra fuentes oficiales de fabricantes.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600" aria-label="Pie">
            <Link href="/rubbers" className="hover:text-primary">Gomas</Link>
            <Link href="/blades" className="hover:text-primary">Maderos</Link>
            <Link href="/tables" className="hover:text-primary">Mesas</Link>
            <Link href="/compare" className="hover:text-primary">Comparar</Link>
          </nav>
        </div>
        <p className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-400">
          Las marcas mencionadas pertenecen a sus respectivos dueños. La información proviene de fuentes públicas.
        </p>
      </div>
    </footer>
  );
}
