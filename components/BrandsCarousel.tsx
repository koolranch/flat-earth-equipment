import fs from "fs";
import path from "path";
import Link from "next/link";
import Image from "next/image";

export default function BrandsCarousel() {
  const files = fs
    .readdirSync(path.join(process.cwd(), "public", "brands"))
    .filter((f) => /\.(png|webp)$/i.test(f));

  return (
    <nav aria-label="Shop by Brand" className="py-16 bg-gray-50">
      <h2 className="text-2xl font-bold text-center mb-8">Shop by Brand</h2>
      <div className="container mx-auto flex space-x-6 overflow-x-auto focus:outline-none">
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
    </nav>
  );
} 