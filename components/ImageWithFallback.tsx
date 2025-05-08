'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ImageWithFallback(props: React.ComponentProps<typeof Image>) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Log when component mounts
    console.log('ImageWithFallback mounted:', {
      src: props.src,
      alt: props.alt
    });
  }, [props.src, props.alt]);

  const handleError = (e: any) => {
    console.error('Image failed to load:', {
      src: props.src,
      alt: props.alt,
      error: e
    });
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    console.log('Image loaded successfully:', {
      src: props.src,
      alt: props.alt
    });
    setLoading(false);
  };

  if (error) {
    console.log('Using fallback image for:', props.alt);
    return (
      <Image
        {...props}
        src="/images/placeholder-logo.png"
        alt={props.alt || "Image not found"}
        onLoad={handleLoad}
      />
    );
  }

  return (
    <Image
      {...props}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
} 