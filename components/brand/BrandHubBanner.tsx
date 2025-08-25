'use client';

import Link from 'next/link';

interface BrandHubBannerProps {
  slug: string;
  name: string;
}

export default function BrandHubBanner({ slug, name }: BrandHubBannerProps) {
  const handleClick = () => {
    try {
      // Fire Vercel Analytics event
      (window as any).va?.('brand_hub_banner_click', { brand: slug });
    } catch (error) {
      // Silent fail for analytics
      console.debug('Analytics tracking failed:', error);
    }
  };

  return (
    <div className="my-4 rounded-xl border p-4 bg-card">
      <div className="font-semibold">Looking for more {name} help?</div>
      <p className="text-sm text-muted-foreground">
        Open the {name} Brand Hub to see serial lookup, fault codes, and parts assistance in one place.
      </p>
      <Link 
        href={`/brand/${slug}`} 
        className="inline-block mt-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity" 
        onClick={handleClick}
      >
        Open {name} Hub
      </Link>
    </div>
  );
}