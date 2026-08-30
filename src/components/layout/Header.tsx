import Link from "next/link";
import SearchBar from "@/components/search/SearchBar";

const nav = [
  { href: "/rubbers", label: "Gomas" },
  { href: "/blades", label: "Maderos" },
  { href: "/tables", label: "Mesas" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-metal bg-graphite/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:gap-6 sm:px-6">
        {/* Logo: placa cyberpunk con glow */}
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="flex h-9 items-center justify-center rounded-md border border-accent bg-gradient-to-b from-surface-raised to-surface px-2 text-sm font-extrabold tracking-tight text-accent shadow-[0_0_12px_rgba(0,229,255,0.35),inset_0_1px_0_rgba(255,255,255,0.1)]">
            ZT
          </span>
          <span className="hidden text-[15px] font-bold uppercase tracking-[0.14em] text-ink sm:block">
            Zona <span className="text-accent [text-shadow:0_0_10px_rgba(0,229,255,0.6)]">Tenis de Mesa</span>
          </span>
        </Link>

        {/* Nav: placa técnica */}
        <nav className="hidden items-center gap-1 rounded-full border border-metal bg-deep/60 p-1 md:flex" aria-label="Principal">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-1.5 text-sm font-medium text-ink-mid transition hover:bg-surface-raised hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/compare"
            className="rounded-full px-3.5 py-1.5 text-sm font-medium text-ink-mid transition hover:bg-surface-raised hover:text-ink"
          >
            Comparar
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SearchBar />
          <Link
            href="/compare"
            className="ctl ctl-compare rounded-full px-3.5 py-1.5 text-sm md:hidden"
          >
            Comparar
          </Link>
        </div>
      </div>
    </header>
  );
}
