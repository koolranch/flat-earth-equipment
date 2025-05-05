"use client";

import fs from "fs";
import path from "path";
import Link from "next/link";
import Image from "next/image";

export default function BrandsCarousel() {
  const files = fs
    .readdirSync(path.join(process.cwd(), "public", "brands"))
    .filter((f) => /\.(png|webp)$/i.test(f));

  return (
    <nav aria-label="Shop by Brand" className="py-16 bg-gray-50 relative">
      <h2 className="text-2xl font-bold text-center mb-8">Shop by Brand</h2>
      <button
        aria-label="Previous"
        onClick={() =>
          document.querySelector('[data-carousel]')?.scrollBy({ left: -200, behavior: 'smooth' })
        }
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow"
      >
        ‹
      </button>
      <div
        data-carousel
        className="container mx-auto flex space-x-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
      >
        {files.map((file) => {
          const slug = path
            .basename(file, path.extname(file))
            .toLowerCase()
            .replace(/\s+/g, "-");
          return (
            <Link
              key={file}
              href={`/parts/${slug}`}
              className="relative flex-shrink-0 focus:ring-2 focus:ring-blue-500 rounded transition"
              aria-label={`View ${slug.replace(/-/g, " ")} parts`}
            >
              <div className="relative h-16 w-32">
                <Image
                  src={`/brands/${file}`}
                  alt={slug.replace(/-/g, " ")}
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
        onClick={() =>
          document.querySelector('[data-carousel]')?.scrollBy({ left: 200, behavior: 'smooth' })
        }
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow"
      >
        ›
      </button>
    </nav>
  );
} 