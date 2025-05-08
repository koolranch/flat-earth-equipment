'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ImageWithFallback(props: React.ComponentProps<typeof Image>) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Log when component mounts
    console.log('ImageWithFallback mounted:', {
      src: props.src,
      alt: props.alt,
      retryCount
    });

    // Reset error state when src changes
    if (error) {
      setError(false);
      setLoading(true);
    }
  }, [props.src, props.alt, error, retryCount]);

  const handleError = (e: any) => {
    console.error('Image failed to load:', {
      src: props.src,
      alt: props.alt,
      error: e,
      retryCount
    });

    // Retry loading up to 3 times
    if (retryCount < 3) {
      console.log(`Retrying image load (attempt ${retryCount + 1})`);
      setRetryCount(prev => prev + 1);
      setError(false);
      setLoading(true);
      return;
    }

    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    console.log('Image loaded successfully:', {
      src: props.src,
      alt: props.alt,
      retryCount
    });
    setLoading(false);
  };

  if (error) {
    console.log('Using fallback image for:', props.alt);
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-50">
        <Image
          {...props}
          src="/images/placeholder-logo.png"
          alt={props.alt || "Image not found"}
          onLoad={handleLoad}
          className={`${props.className || ''} opacity-50`}
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${loading ? 'animate-pulse bg-gray-100' : ''}`}>
      <Image
        {...props}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
} 