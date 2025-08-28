import React from 'react';

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Hook version for React components
export function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setPrefersReduced(mediaQuery.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReduced;
}

// CSS class helper for conditional animations
export function getMotionClass(animationClass: string, reducedClass: string = '') {
  if (typeof window === 'undefined') return animationClass;
  
  return prefersReducedMotion() ? reducedClass : animationClass;
}
