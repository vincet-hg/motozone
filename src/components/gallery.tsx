"use client";

import Image from "next/image";
import { useState } from "react";
import { imageUrl } from "@/lib/format";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded border border-neutral-200 text-neutral-600">
        ფოტო არ არის
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded border border-neutral-200 bg-white">
        <Image
          src={imageUrl(images[selected])}
          alt={alt}
          fill
          sizes="(min-width: 768px) 600px, 100vw"
          quality={75}
          preload={selected === 0}
          className="object-contain p-3"
        />
      </div>
      {images.length > 1 && (
        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
          {images.map((path, index) => (
            <button
              key={path}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`ფოტო ${index + 1}`}
              aria-pressed={index === selected}
              className={`relative size-16 shrink-0 overflow-hidden rounded border-2 bg-white ${
                index === selected ? "border-accent" : "border-neutral-200"
              }`}
            >
              <Image src={imageUrl(path)} alt="" fill sizes="96px" quality={75} className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
