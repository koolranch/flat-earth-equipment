import React from 'react';
import { assetUrl } from '@/lib/assets';

type Props = { 
  id?: string; 
  src?: string; 
  className?: string; 
  alt?: string; 
  preferPng?: boolean;
} & React.ImgHTMLAttributes<HTMLImageElement>;

export default function Asset({ id, src, className, alt, preferPng = false, ...imgProps }: Props) {
  // Handle both old (id) and new (src) prop formats
  const assetPath = src || (id ? `assets/${id}.svg` : '');
  const url = assetUrl(assetPath);
  return <img src={url} alt={alt || ''} className={className} loading="lazy" {...imgProps} />;
}
