import * as React from 'react';
export function AnimatedSvg({ src, title, className }: { src: string; title?: string; className?: string }) {
  return (
    <div className={className ?? ''}>
      <object
        data={src}
        type="image/svg+xml"
        aria-label={title ?? 'animation'}
        className="h-full w-full"
      />
    </div>
  );
}
export default AnimatedSvg;
