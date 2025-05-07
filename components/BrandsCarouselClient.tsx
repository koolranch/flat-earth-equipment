"use client";

import { useRef } from "react";
import Link from "next/link";
import ImageWrapper from "./ImageWrapper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

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
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow hover:bg-gray-50 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <motion.div
        ref={carouselRef}
        data-carousel
        className="container mx-auto flex space-x-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide focus:outline-none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
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
              <ImageWrapper
                src={`/brands/${file}`}
                alt={name.replace(/-/g, " ")}
                width={128}
                height={64}
              />
            </Link>
          );
        })}
      </motion.div>
      <button
        aria-label="Next"
        onClick={() => scrollByOffset(200)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow hover:bg-gray-50 transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </nav>
  );
} 