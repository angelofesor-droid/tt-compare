import Link from "next/link";
import Image from "next/image";
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
        {/* Logo: monograma generado + wordmark animado */}
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center">
            <Image
              src="/logo/zt-monogram.png"
              alt="Zona Tenis de Mesa"
              width={40}
              height={40}
              className="h-10 w-10 object-contain drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]"
            />
          </span>
          <span className="hidden text-[15px] font-bold uppercase tracking-[0.14em] sm:block">
            Zona <span className="neon-wordmark inline-block">Tenis de Mesa</span>
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
