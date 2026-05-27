"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/shopify/types";

export default function ProductGallery({ images }: { images: ProductImage[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = images[selectedIndex];

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-gray-100 text-gray-400">
        No image
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex flex-col gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-gray-100 transition-colors ${
                i === selectedIndex ? "border-gray-900" : "border-transparent hover:border-gray-300"
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText ?? `Product image ${i + 1}`}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative aspect-square min-h-0 flex-1 overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={selected.url}
          alt={selected.altText ?? "Product image"}
          fill
          sizes="(min-width: 1024px) 45vw, 90vw"
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
