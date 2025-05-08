'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ImageWithFallback(props: React.ComponentProps<typeof Image>) {
  const [error, setError] = useState(false);

  if (error) {
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
      onError={() => setError(true)}
    />
  );
} 