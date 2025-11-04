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
 * - Mobile-optimized: uses object-contain to show full screenshot without cropping
 * - Responsive aspect ratio: taller on mobile (3/4) for better portrait screenshots
 */
export default function ScreenshotCard({ src, alt, caption, aspect = '4/3', className }: ScreenshotCardProps) {
  // Mobile gets taller container (3:4), desktop gets wider (4:3)
  const aspectClass = aspect === '16/9' 
    ? 'aspect-video' 
    : 'aspect-[3/4] sm:aspect-[4/3]';
  
  return (
    <figure className={cn('group', className)}>
      <div className={cn(
        'relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg ring-0 focus-within:ring-2 focus-within:ring-orange-500 transition-shadow duration-300 hover:shadow-xl',
        aspectClass
      )}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 700px"
          className="object-contain p-2 sm:p-4"
          priority={false}
        />
        <span className="pointer-events-none absolute left-2 top-2 sm:left-3 sm:top-3 rounded-full bg-orange-500/90 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-medium text-white shadow-sm">Actual interface</span>
      </div>
      {caption ? (
        <figcaption className="mt-3 text-sm text-slate-600" dangerouslySetInnerHTML={{ __html: caption }} />
      ) : null}
    </figure>
  );
}

