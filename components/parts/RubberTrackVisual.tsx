import { parseTrackSize } from '@/lib/parts/rubberTrackUtils';

type RubberTrackVisualProps = {
  name: string;
  imageUrl?: string | null;
  trackSize?: string;
  treadPattern?: string;
};

export default function RubberTrackVisual({
  name,
  imageUrl,
  trackSize,
  treadPattern,
}: RubberTrackVisualProps) {
  const specs = parseTrackSize(trackSize);
  const treadLabel = treadPattern
    ? treadPattern.replace(/\bpattern\b/i, '').trim()
    : 'Track';

  if (imageUrl) {
    return (
      <div className="relative aspect-square bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <img src={imageUrl} alt={name} className="object-contain w-full h-full" />
      </div>
    );
  }

  return (
    <div className="relative aspect-square bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl shadow-sm border border-slate-700 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 400 400" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, row) =>
            Array.from({ length: 6 }).map((__, col) => (
              <rect
                key={`${row}-${col}`}
                x={20 + col * 62}
                y={30 + row * 44}
                width="48"
                height="28"
                rx="4"
                fill="currentColor"
                className="text-slate-600"
              />
            ))
          )}
        </svg>
      </div>
      <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-300">
            Rubber Track
          </p>
          <p className="mt-2 text-2xl font-bold leading-tight">
            {trackSize?.replace(/x/gi, '×') ?? 'Replacement track'}
          </p>
          <p className="mt-1 text-sm text-slate-300 capitalize">{treadLabel} tread</p>
        </div>
        {specs && (
          <dl className="grid grid-cols-3 gap-2 rounded-lg bg-white/10 p-3 text-center text-xs backdrop-blur-sm">
            <div>
              <dt className="text-slate-400">Width</dt>
              <dd className="font-semibold">{specs.widthMm} mm</dd>
              <dd className="text-slate-400">({specs.widthIn}&quot;)</dd>
            </div>
            <div>
              <dt className="text-slate-400">Pitch</dt>
              <dd className="font-semibold">{specs.pitchMm} mm</dd>
            </div>
            <div>
              <dt className="text-slate-400">Links</dt>
              <dd className="font-semibold">{specs.links}</dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
