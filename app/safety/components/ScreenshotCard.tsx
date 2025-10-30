import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ScreenshotCardProps {
  src: string;
  alt: string;
  caption?: string;
  aspect?: '4/3' | '16/9';
  className?: string;
}

/**
 * Visual-only framed screenshot component.
 * - Consistent rounded border, subtle shadow, focus ring on keyboard nav
 * - Uses a fixed aspect container to avoid CLS
 */
export default function ScreenshotCard({ src, alt, caption, aspect = '4/3', className }: ScreenshotCardProps) {
  const aspectClass = aspect === '16/9' ? 'aspect-video' : 'aspect-[4/3]';
  return (
    <figure className={cn('group', className)}>
      <div className={cn(
        'relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg ring-0 focus-within:ring-2 focus-within:ring-orange-500 transition',
        aspectClass
      )}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 700px"
          className="object-cover"
          priority={false}
        />
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-orange-500/90 px-3 py-1 text-xs font-medium text-white shadow-sm">Actual interface</span>
      </div>
      {caption ? (
        <figcaption className="mt-3 text-sm text-slate-600">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

