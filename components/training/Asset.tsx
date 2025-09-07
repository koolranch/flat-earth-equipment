import React from 'react';
import { getAsset } from '@/lib/assets';

type Props = { id: keyof ReturnType<typeof Object>; className?: string; preferPng?: boolean; alt?: string } & React.ImgHTMLAttributes<HTMLImageElement>;

export default function Asset({ id, className, preferPng = false, alt, ...imgProps }: Props) {
  const meta = getAsset(id as any);
  const src = (() => {
    if (!preferPng) return meta.src;
    return meta.src.toLowerCase().endsWith('.svg') ? meta.src.replace(/\.svg$/i, '.png') : meta.src;
  })();
  return <img src={src} alt={alt ?? meta.alt} className={className} loading="lazy" {...imgProps} />;
}
