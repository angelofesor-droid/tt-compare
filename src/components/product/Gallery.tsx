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
      <div className="panel flex aspect-square items-center justify-center text-sm text-ink-faint">
        Sin imagen
      </div>
    );
  }

  const current = images[active];

  return (
    <div className="space-y-3">
      {/* Zona de imagen: estudio fotográfico */}
      <div className="relative aspect-square overflow-hidden rounded-xl border border-metal bg-gradient-to-b from-graphite to-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_4px_16px_rgba(0,0,0,0.4)]">
        <Image
          src={current.url}
          alt={current.alt ?? name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-6"
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
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition ${
                idx === active
                  ? "border-accent shadow-[0_0_0_3px_rgba(232,123,63,0.15)]"
                  : "border-metal opacity-60 hover:opacity-100"
              } bg-deep`}
            >
              <Image src={img.url} alt={img.alt ?? `${name} imagen ${idx + 1}`} fill sizes="64px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
