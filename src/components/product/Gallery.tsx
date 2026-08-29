"use client";

import Image from "next/image";
import { useState } from "react";

export interface GalleryImage {
  url: string;
  alt: string | null;
  width?: number | null;
  height?: number | null;
}

export default function Gallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-sm text-slate-400">
        Sin imagen
      </div>
    );
  }

  const current = images[active];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white">
        <Image
          src={current.url}
          alt={current.alt ?? name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain"
          priority={active === 0}
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Galería de imágenes">
          {images.map((img, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={idx === active}
              aria-label={`Ver imagen ${idx + 1}`}
              onClick={() => setActive(idx)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition ${
                idx === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img.url} alt={img.alt ?? `${name} imagen ${idx + 1}`} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
