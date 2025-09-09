"use client";
import React from 'react';
import { assetUrl } from '@/lib/assets';

type Props = { id: string; className?: string; title?: string; fallbackPng?: boolean };

/**
 * Embeds an SVG (keeps SMIL animations working) with a PNG fallback for PDF/email.
 */
export default function SvgEmbed({ id, className, title, fallbackPng = false }: Props) {
  const src = assetUrl(`assets/${id}.svg`);
  const isSvg = src.toLowerCase().endsWith('.svg');
  if (!isSvg || fallbackPng) {
    const png = src.replace(/\.svg$/i, '.png');
    return <img src={png} alt={title || id} className={className} loading="lazy" />;
  }
  return (
    <object data={src} type="image/svg+xml" className={className} aria-label={title || id} title={title || id}>
      <img src={src.replace(/\.svg$/i, '.png')} alt={title || id} />
    </object>
  );
}
