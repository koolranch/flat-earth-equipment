"use client";

import Image from "next/image";
import { useState } from "react";

export default function ImageWrapper({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative" style={{ width, height }}>
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`(max-width: 640px) ${width}px, ${width}px`}
        className={`object-contain transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoadingComplete={() => setLoaded(true)}
      />
    </div>
  );
} 