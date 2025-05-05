"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";

interface BrandsCarouselClientProps {
  files: string[];
}

export default function BrandsCarouselClient({ files }: BrandsCarouselClientProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollByOffset = (offset: number) => {
    carouselRef.current?.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <nav aria-label="Shop by Brand" className="py-16 bg-gray-50 relative">
      <h2 className="text-2xl font-bold text-center mb-8">Shop by Brand</h2>
      <button
        aria-label="Previous"
        onClick={() => scrollByOffset(-200)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow"
      >
        ‹
      </button>
      <div
        ref={carouselRef}
        data-carousel
        className="container mx-auto flex space-x-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide focus:outline-none"
      >
        {files.map((file) => {
          const name = file.replace(/\.[^/.]+$/, "");
          const slug = name.toLowerCase().replace(/\s+/g, "-");
          return (
            <Link
              key={file}
              href={`/parts/${slug}`}
              className="relative flex-shrink-0 focus:ring-2 focus:ring-blue-500 rounded transition"
              aria-label={`View ${name.replace(/-/g, " ")} parts`}
            >
              <div className="relative h-16 w-32">
                <Image
                  src={`/brands/${file}`}
                  alt={name.replace(/-/g, " ")}
                  fill
                  sizes="(max-width: 640px) 4rem, 8rem"
                  className="object-contain"
                />
              </div>
            </Link>
          );
        })}
      </div>
      <button
        aria-label="Next"
        onClick={() => scrollByOffset(200)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow"
      >
        ›
      </button>
    </nav>
  );
} 