'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ImageWithFallback(props: React.ComponentProps<typeof Image>) {
  const [error, setError] = useState(false);

  const handleError = (e: any) => {
    console.error('Image failed to load:', {
      src: props.src,
      alt: props.alt,
      error: e
    });
    setError(true);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded px-4 py-2">
        <span className="text-gray-600 font-medium text-sm">
          {props.alt || "Image not found"}
        </span>
      </div>
    );
  }

  return (
    <Image
      {...props}
      onError={handleError}
    />
  );
} 