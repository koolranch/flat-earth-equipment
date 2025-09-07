"use client";
import React from 'react';
import { getAsset } from '@/lib/assets';

type Props = { id: keyof ReturnType<typeof Object>; className?: string; title?: string; fallbackPng?: boolean };

/**
 * Embeds an SVG (keeps SMIL animations working) with a PNG fallback for PDF/email.
 */
export default function SvgEmbed({ id, className, title, fallbackPng = false }: Props) {
  const meta = getAsset(id as any);
  const isSvg = meta.src.toLowerCase().endsWith('.svg');
  if (!isSvg || fallbackPng) {
    const png = meta.src.replace(/\.svg$/i, '.png');
    return <img src={png} alt={meta.alt} className={className} loading="lazy" />;
  }
  return (
    <object data={meta.src} type="image/svg+xml" className={className} aria-label={meta.alt} title={title ?? meta.alt}>
      <img src={meta.src.replace(/\.svg$/i, '.png')} alt={meta.alt} />
    </object>
  );
}
