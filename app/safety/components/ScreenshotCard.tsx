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
        'relative overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)]',
        aspectClass
      )}>
        {/* Browser Chrome */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-1.5 z-10">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
        </div>
        
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 700px"
          className="object-contain pt-8 pb-2 px-2 sm:pt-12 sm:pb-4 sm:px-4"
          priority={false}
        />
      </div>
      {caption ? (
        <figcaption className="mt-4 text-center text-sm text-slate-600 font-medium" dangerouslySetInnerHTML={{ __html: caption }} />
      ) : null}
    </figure>
  );
}

