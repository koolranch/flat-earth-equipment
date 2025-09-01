'use client';
import { useRef, useEffect } from 'react';

interface LiveRegionProps {
  text: string;
  polite?: boolean;
}

export default function LiveRegion({ text, polite = true }: LiveRegionProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = text;
    }
  }, [text]);
  
  return (
    <div 
      ref={ref} 
      className="sr-only" 
      aria-live={polite ? 'polite' : 'assertive'} 
      aria-atomic="true"
    />
  );
}