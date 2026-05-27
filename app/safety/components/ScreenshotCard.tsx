import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ScreenshotCardProps {
  src: string;
  alt: string;
  caption?: string;
  badge?: string;
  badgeColor?: 'orange' | 'emerald' | 'blue';
  /** Max height constraint for the image area (Tailwind class). Defaults to max-h-[480px]. */
  maxHeight?: string;
  className?: string;
  /** Phone shows app screenshots; browser keeps the web training chrome mockup. */
  variant?: 'phone' | 'browser';
}

/**
 * Premium screenshot card for safety marketing.
 * - `phone`: rounded device shell for mobile app captures (no URL bar)
 * - `browser`: realistic browser chrome for web training hub shots
 */
export default function ScreenshotCard({
  src,
  alt,
  caption,
  badge,
  badgeColor = 'orange',
  maxHeight = 'max-h-[480px]',
  className,
  variant = 'browser',
}: ScreenshotCardProps) {
  const badgeColors = {
    orange: 'bg-orange-500 text-white',
    emerald: 'bg-emerald-500 text-white',
    blue: 'bg-blue-500 text-white',
  };

  const badgeEl = badge ? (
    <div
      className={cn(
        'absolute -top-2 -right-2 sm:top-1 sm:right-1 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10',
        badgeColors[badgeColor],
      )}
    >
      {badge}
    </div>
  ) : null;

  return (
    <figure className={cn('group', className)}>
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-white p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        {variant === 'phone' ? (
          <div className="relative mx-auto max-w-[280px] sm:max-w-[300px] transition-all duration-500 group-hover:-translate-y-0.5">
            <div
              className={cn(
                'overflow-hidden rounded-[2rem] bg-slate-900 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)] ring-1 ring-slate-900/10',
                maxHeight,
              )}
            >
              <Image
                src={src}
                alt={alt}
                width={390}
                height={844}
                sizes="(max-width: 768px) 70vw, 300px"
                className="h-auto w-full object-contain"
                priority={false}
              />
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-500 group-hover:-translate-y-0.5 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
            <div className="flex h-9 items-center gap-2 border-b border-slate-200/60 bg-gradient-to-b from-slate-50 to-slate-100/80 px-3 sm:h-10 sm:px-4">
              <div className="flex shrink-0 items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
              </div>
              <div className="mx-2 flex-1 sm:mx-8">
                <div className="mx-auto flex h-6 max-w-sm items-center rounded-md border border-slate-200/60 bg-white px-2.5 sm:px-3">
                  <svg className="mr-1.5 h-3 w-3 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="truncate text-[10px] font-medium text-slate-400 sm:text-xs">
                    flatearthequipment.com/training
                  </span>
                </div>
              </div>
              <div className="w-[52px] shrink-0" />
            </div>

            <div
              className={cn(
                'relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100/50',
                maxHeight,
              )}
            >
              <Image
                src={src}
                alt={alt}
                width={800}
                height={600}
                sizes="(max-width: 768px) 85vw, (max-width: 1280px) 50vw, 600px"
                className="h-auto max-h-full w-full object-contain"
                priority={false}
              />
            </div>
          </div>
        )}

        {badgeEl}
      </div>

      {caption && (
        <figcaption
          className="mt-4 text-center text-sm font-medium leading-relaxed text-slate-600"
          dangerouslySetInnerHTML={{ __html: caption }}
        />
      )}
    </figure>
  );
}
