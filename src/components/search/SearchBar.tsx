"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={onSubmit} role="search" className="relative">
      <div className="well flex items-center">
        <svg
          className="ml-3 h-4 w-4 shrink-0 text-ink-low"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden
        >
          <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar producto, marca…"
          aria-label="Buscar en el catálogo"
          className="well-input w-36 rounded-r-[10px] sm:w-52"
        />
      </div>
    </form>
  );
}
