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
    console.log('Using fallback image for:', props.alt);
    return (
      <Image
        {...props}
        src="/images/placeholder-logo.png"
        alt={props.alt || "Image not found"}
      />
    );
  }

  return (
    <Image
      {...props}
      onError={handleError}
    />
  );
} 