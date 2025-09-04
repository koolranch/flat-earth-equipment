'use client';
import React from 'react';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Hook for React components
export function useReducedMotion(): boolean {
  // For SSR compatibility, return false initially
  const [reducedMotion, setReducedMotion] = React.useState(false);
  
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return reducedMotion;
}

// Utility for conditional animation classes
export function motionSafe(animationClasses: string, reducedClasses: string = ''): string {
  if (prefersReducedMotion()) {
    return reducedClasses;
  }
  return animationClasses;
}