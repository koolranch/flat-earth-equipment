import fs from "fs";
import path from "path";
import BrandsCarouselClient from "./BrandsCarouselClient";

export default function BrandsCarousel() {
  const files = fs
    .readdirSync(path.join(process.cwd(), "public", "brands"))
    .filter((f) => /\.(png|webp)$/i.test(f));

  return <BrandsCarouselClient files={files} />;
} 