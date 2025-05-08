import BrandsCarouselClient from "./BrandsCarouselClient";

type BrandsCarouselProps = {
  files: string[];
};

export default function BrandsCarousel({ files }: BrandsCarouselProps) {
  return <BrandsCarouselClient files={files} />;
} 