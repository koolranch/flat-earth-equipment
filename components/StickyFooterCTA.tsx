'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface StickyFooterCTAProps {
  children: React.ReactNode;
}

export default function StickyFooterCTA({ children }: StickyFooterCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > 300); // Show after scrolling 300px
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300 ease-in-out">
      {children}
    </div>
  );
} 