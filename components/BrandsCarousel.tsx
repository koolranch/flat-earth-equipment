import fs from "fs";
import path from "path";
import Link from "next/link";

export default function BrandsCarousel() {
  const files = fs
    .readdirSync(path.join(process.cwd(), "public", "brands"))
    .filter((f) => /\.(png|webp|jpe?g)$/i.test(f));

  return (
    <section className="py-16">
      <h2 className="text-2xl font-bold text-center mb-8">Shop by Brand</h2>
      <div className="container mx-auto flex space-x-6 overflow-x-auto">
        {files.map((file) => {
          const slug = path
            .basename(file, path.extname(file))
            .toLowerCase()
            .replace(/\s+/g, "-");
          return (
            <Link key={file} href={`/parts/${slug}`} className="flex-shrink-0">
              <img
                src={`/brands/${file}`}
                alt={slug.replace(/-/g, " ")}
                className="h-16 w-auto object-contain"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
} 