"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Part = {
  slug: string;
  name: string;
  price: number;
  image_filename: string;
};

export default function FeaturedParts() {
  const [parts, setParts] = useState<Part[]>([]);

  useEffect(() => {
    const placeholderParts: Part[] = Array.from({ length: 6 }, (_, idx) => ({
      slug: `part-${idx + 1}`,
      name: `Featured Part ${idx + 1}`,
      price: (idx + 1) * 99.99,
      image_filename: `part-${idx + 1}.png`,
    }));
    setParts(placeholderParts);
  }, []);

  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-3xl font-heading text-center mb-8 text-brand-dark">
          Featured Products
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {parts.map((p) => (
            <Link
              key={p.slug}
              href={`/parts/charger-modules/${p.slug}`}
              className="block border rounded-lg shadow-card overflow-hidden hover:shadow-lg transition"
            >
              <img
                src={`/images/featured/${p.image_filename}`}
                alt={p.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="mt-2 text-lg text-brand-dark">${p.price.toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 