'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getBrandLogoUrl, getBrandMonogram } from '@/lib/parts/brandLogo';

type Props = {
  brand: string;
  logoUrl?: string | null;
  active?: boolean;
};

function BrandMonogram({ brand, active }: { brand: string; active?: boolean }) {
  return (
    <span
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold uppercase ${
        active
          ? 'bg-white/20 text-white'
          : 'bg-slate-100 text-slate-600'
      }`}
      aria-hidden="true"
    >
      {getBrandMonogram(brand)}
    </span>
  );
}

export default function BrandMark({ brand, logoUrl, active = false }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const resolvedLogoUrl = getBrandLogoUrl(brand, logoUrl);

  if (!resolvedLogoUrl || imageFailed) {
    return <BrandMonogram brand={brand} active={active} />;
  }

  return (
    <span className="relative h-5 w-12 shrink-0">
      <Image
        src={resolvedLogoUrl}
        alt=""
        fill
        className="object-contain object-left"
        sizes="48px"
        onError={() => setImageFailed(true)}
      />
    </span>
  );
}
