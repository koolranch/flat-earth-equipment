import BrandsCarouselClient from "./BrandsCarouselClient";
import { brands } from "@/lib/data/brands";

export default function BrandsCarousel() {
  return <BrandsCarouselClient brands={brands} />;
} 