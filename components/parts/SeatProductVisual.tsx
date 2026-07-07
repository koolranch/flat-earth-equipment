'use client';

import { useState } from 'react';
import {
  getSeatVisualFacts,
  getSeatVisualKind,
  getSeatVisualLabel,
  type SeatVisualKind,
} from '@/lib/parts/seatVisualUtils';

type SeatProductVisualProps = {
  name: string;
  brand?: string;
  category?: string;
  metadata?: Record<string, unknown> | null;
  imageUrl?: string | null;
  variant?: 'card' | 'detail';
};

function SeatSilhouette({ kind }: { kind: SeatVisualKind }) {
  const isCushion =
    kind === 'cushion_back' ||
    kind === 'cushion_bottom' ||
    kind === 'cushion_set' ||
    kind === 'cushion_single';
  const isCover = kind === 'cover';

  return (
    <svg
      viewBox="0 0 160 120"
      className="h-full w-full"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id="seatFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>

      {!isCushion && !isCover && (
        <>
          <rect x="88" y="88" width="28" height="18" rx="3" fill="#64748b" />
          <rect x="82" y="72" width="40" height="18" rx="5" fill="url(#seatFill)" />
          <path
            d="M48 72 L48 28 C48 22 52 18 58 18 L78 18 C84 18 88 22 88 28 L88 72 Z"
            fill="url(#seatFill)"
          />
          <rect x="42" y="58" width="10" height="24" rx="3" fill="#64748b" />
          <rect x="88" y="58" width="10" height="24" rx="3" fill="#64748b" />
        </>
      )}

      {isCushion && (
        <>
          {kind !== 'cushion_bottom' && (
            <rect x="52" y="18" width="56" height="44" rx="8" fill="url(#seatFill)" />
          )}
          {kind !== 'cushion_back' && (
            <rect x="44" y="68" width="72" height="24" rx="8" fill="url(#seatFill)" />
          )}
        </>
      )}

      {isCover && (
        <>
          <path
            d="M46 24 L46 70 C46 76 50 80 56 80 L104 80 C110 80 114 76 114 70 L114 24 Z"
            fill="url(#seatFill)"
            opacity="0.85"
          />
          <path
            d="M42 68 L42 88 C42 92 45 95 49 95 L111 95 C115 95 118 92 118 88 L118 68 Z"
            fill="#64748b"
          />
        </>
      )}
    </svg>
  );
}

export default function SeatProductVisual({
  name,
  brand,
  category,
  metadata,
  imageUrl,
  variant = 'card',
}: SeatProductVisualProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageUrl && !imageFailed) {
    const wrapperClass =
      variant === 'detail'
        ? 'relative aspect-square rounded-xl border border-slate-200 bg-white p-4 shadow-sm'
        : 'relative h-full w-full';

    return (
      <div className={wrapperClass}>
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-contain"
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }

  const kind = getSeatVisualKind(name, category, metadata);
  const label = getSeatVisualLabel(kind);
  const facts = getSeatVisualFacts(name, brand, metadata);
  const isCard = variant === 'card';

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-100 ${
        isCard ? 'h-full w-full' : 'aspect-square rounded-xl border border-slate-200 shadow-sm'
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[#F76511]" aria-hidden="true" />

      <div className={`relative flex h-full flex-col ${isCard ? 'p-3' : 'p-6'}`}>
        <div className={`${isCard ? 'h-[58%]' : 'h-[52%]'} px-2`}>
          <SeatSilhouette kind={kind} />
        </div>

        <div className={`${isCard ? 'mt-1 space-y-0.5' : 'mt-4 space-y-2'} min-w-0`}>
          <p
            className={`font-semibold uppercase tracking-wide text-[#F76511] ${
              isCard ? 'text-[10px]' : 'text-xs'
            }`}
          >
            {label}
          </p>
          {brand && (
            <p
              className={`truncate font-bold text-slate-900 ${
                isCard ? 'text-xs' : 'text-lg'
              }`}
            >
              {brand}
            </p>
          )}
          {!isCard && facts.oemPn && (
            <p className="font-mono text-sm text-slate-600">OEM {facts.oemPn}</p>
          )}
          {!isCard && (facts.dimensions || facts.material) && (
            <p className="text-sm text-slate-500">
              {[facts.dimensions, facts.material].filter(Boolean).join(' · ')}
            </p>
          )}
          {isCard && facts.oemPn && (
            <p className="truncate font-mono text-[10px] text-slate-500">OEM {facts.oemPn}</p>
          )}
        </div>
      </div>
    </div>
  );
}
