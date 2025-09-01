export function motionSafe<T extends Record<string, any>>(props: T, reduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  if (!reduced) return props;
  const clone: any = { ...props };
  delete clone.animate; 
  delete clone.initial; 
  delete clone.transition;
  return clone;
}
