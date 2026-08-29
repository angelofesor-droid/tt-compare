import Link from "next/link";
import SearchBar from "@/components/search/SearchBar";

const nav = [
  { href: "/rubbers", label: "Gomas" },
  { href: "/blades", label: "Maderos" },
  { href: "/tables", label: "Mesas" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:gap-8 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
            TT
          </span>
          <span className="hidden text-lg font-semibold tracking-tight sm:block">
            TT <span className="text-accent">Compare</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/compare"
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-primary"
          >
            Comparar
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SearchBar />
          <Link
            href="/compare"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary md:hidden"
          >
            Comparar
          </Link>
        </div>
      </div>
    </header>
  );
}
