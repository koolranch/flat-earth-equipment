'use client';
import { useEffect, useState } from 'react';
import { getCtaVariant, type Variant } from '@/lib/ab';
import Link from 'next/link';

export default function BrandHubCTA({ slug, name }: { slug: string; name: string }){
  const [variant, setVariant] = useState<Variant>('cta_inline');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setVariant(getCtaVariant());
    setMounted(true);
    
    // Track variant view
    try {
      (window as any).va?.('cta_variant_view', { 
        variant: getCtaVariant(), 
        brand: slug 
      });
    } catch {}
  }, [slug]);

  const handleClick = () => {
    try {
      (window as any).va?.('cta_click', { 
        variant, 
        brand: slug 
      });
    } catch {}
  };

  if (!mounted) return null; // Prevent hydration mismatch

  const Cta = () => (
    <div className='rounded-2xl border p-4 bg-card/30'>
      <h3 className='font-semibold mb-1'>Need parts for {name}?</h3>
      <p className='text-sm text-muted-foreground mb-2'>Get expert help finding the right components.</p>
      <Link 
        href={`/quote?brand=${slug}`} 
        className='underline hover:no-underline'
        onClick={handleClick}
      >
        Request {name} parts
      </Link>
    </div>
  );

  if (variant === 'cta_top') return <div className='mb-4'><Cta /></div>;
  if (variant === 'cta_sidebar') return <aside className='mt-6'><Cta /></aside>;
  return <div className='my-6'><Cta /></div>; // cta_inline
}
