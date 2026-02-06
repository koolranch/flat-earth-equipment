import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ScreenshotCardProps {
  src: string;
  alt: string;
  caption?: string;
  badge?: string;
  badgeColor?: 'orange' | 'emerald' | 'blue';
  /** CSS object-position to crop the image (e.g., 'top' to hide bottom black bars) */
  objectPosition?: string;
  className?: string;
}

/**
 * Premium browser-framed screenshot component.
 * - Realistic browser chrome with URL bar
 * - Gradient backdrop for visual depth
 * - Optional feature badge overlay
 * - Smart cropping via objectPosition
 */
export default function ScreenshotCard({ 
  src, alt, caption, badge, badgeColor = 'orange', objectPosition = 'top', className 
}: ScreenshotCardProps) {
  const badgeColors = {
    orange: 'bg-orange-500 text-white',
    emerald: 'bg-emerald-500 text-white',
    blue: 'bg-blue-500 text-white',
  };

  return (
    <figure className={cn('group', className)}>
      {/* Gradient backdrop */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-white p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        {/* Browser window */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-500 group-hover:-translate-y-0.5 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
          {/* Browser Chrome - Title bar */}
          <div className="flex items-center h-9 sm:h-10 bg-gradient-to-b from-slate-50 to-slate-100/80 border-b border-slate-200/60 px-3 sm:px-4 gap-2">
            {/* Window controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/80"></div>
            </div>
            {/* URL bar */}
            <div className="flex-1 mx-2 sm:mx-8">
              <div className="flex items-center h-6 bg-white rounded-md border border-slate-200/60 px-2.5 sm:px-3 max-w-sm mx-auto">
                <svg className="w-3 h-3 text-emerald-500 shrink-0 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-[10px] sm:text-xs text-slate-400 truncate font-medium">flatearthequipment.com/training</span>
              </div>
            </div>
            {/* Spacer for symmetry */}
            <div className="w-[52px] shrink-0"></div>
          </div>
          
          {/* Screenshot content */}
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 768px) 85vw, (max-width: 1280px) 50vw, 600px"
              className="object-cover"
              style={{ objectPosition }}
              priority={false}
            />
          </div>
        </div>

        {/* Feature badge */}
        {badge && (
          <div className={cn(
            'absolute -top-2 -right-2 sm:top-1 sm:right-1 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10',
            badgeColors[badgeColor]
          )}>
            {badge}
          </div>
        )}
      </div>

      {/* Caption */}
      {caption && (
        <figcaption 
          className="mt-4 text-center text-sm text-slate-600 font-medium leading-relaxed" 
          dangerouslySetInnerHTML={{ __html: caption }} 
        />
      )}
    </figure>
  );
}
