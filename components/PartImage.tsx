"use client";

interface PartImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
}

export default function PartImage({ src, alt, fallbackSrc = '/images/parts/placeholder.jpg' }: PartImageProps) {
  return (
    <div className="relative w-full h-48 bg-gray-200 animate-pulse">
      <img
        src={src || fallbackSrc}
        alt={alt}
        loading="lazy"
        onLoad={(e) => {
          e.currentTarget.parentElement?.classList.remove('animate-pulse', 'bg-gray-200');
        }}
        onError={(e) => {
          e.currentTarget.src = fallbackSrc;
        }}
        className="absolute inset-0 w-full h-full object-contain rounded"
      />
    </div>
  );
} 