'use client';

import Link from 'next/link';

interface HubQuickLinksProps {
  slug: string;
  serialToolUrl: string;
}

interface ItemProps {
  href: string;
  label: string;
  event: string;
  slug: string;
}

function Item({ href, label, event, slug }: ItemProps) {
  const handleClick = () => {
    try {
      // Fire Vercel Analytics event
      (window as any).va?.('brand_quicklink_click', { brand: slug, event });
    } catch (error) {
      // Silent fail for analytics
      console.debug('Analytics tracking failed:', error);
    }
  };

  return (
    <Link 
      href={href} 
      prefetch={false} 
      className="border rounded-lg p-3 hover:bg-accent transition-colors flex flex-col gap-1 text-center"
      onClick={handleClick}
    >
      <span className="font-medium">{label}</span>
    </Link>
  );
}

export function HubQuickLinks({ slug, serialToolUrl }: HubQuickLinksProps) {
  return (
    <aside className="grid sm:grid-cols-3 gap-3 my-4">
      <Item 
        href={serialToolUrl} 
        label="Open Serial Lookup" 
        event="serial" 
        slug={slug} 
      />
      <Item 
        href={`/brand/${slug}?tab=fault`} 
        label="Fault Codes & Retrieval" 
        event="fault" 
        slug={slug} 
      />
      <Item 
        href={`/brand/${slug}?tab=parts`} 
        label="Request Parts Help" 
        event="parts" 
        slug={slug} 
      />
    </aside>
  );
}
