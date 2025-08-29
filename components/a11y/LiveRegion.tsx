'use client';
import { useEffect, useRef } from 'react';

export default function LiveRegion({ message }: { message: string }) {
  const ref = useRef<HTMLDivElement|null>(null);
  useEffect(() => { if (ref.current) ref.current.textContent = message; }, [message]);
  return <div ref={ref} className="sr-only" aria-live="polite" aria-atomic="true"/>;
}