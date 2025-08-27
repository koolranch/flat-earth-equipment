/* Real tab navigation with Link elements for proper routing */
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { canonForBrand } from '@/lib/brandCanon';

function Tab({ href, children, active }: { href: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      onClick={() => {
        try {
          (window as any).va?.('brand_tab_click', { href });
        } catch (error) {
          // Silent fail for analytics
          console.debug('Analytics tracking failed:', error);
        }
      }}
      className={[
        'inline-flex items-center rounded-xl px-4 py-2 border transition',
        active 
          ? 'bg-brand/5 border-brand-accent text-brand-ink' 
          : 'bg-card hover:bg-muted border-border text-foreground'
      ].join(' ')}
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}

export default function BrandTabs({ slug }: { slug: string }) {
  const pathname = usePathname();
  
  // TEMP FIX: Use direct paths instead of canonForBrand to avoid any redirect loops
  const serialPath = `/brand/${slug}/serial-lookup`;
  const faultsPath = `/brand/${slug}/fault-codes`;
  const isActive = (p: string) => pathname === p;
  
  return (
    <>
      <div className='flex flex-wrap gap-3 mt-4 mb-6'>
        <Tab href={serialPath} active={isActive(serialPath)}>
          Open Serial Lookup
        </Tab>
        <Tab href={faultsPath} active={isActive(faultsPath)}>
          Fault Codes & Retrieval
        </Tab>
        {/* Parts goes to an in-page anchor for smooth scroll to the form */}
        <Tab href={`/brand/${slug}/serial-lookup#parts-request`} active={pathname === `/brand/${slug}/serial-lookup`}>
          Request Parts Help
        </Tab>
      </div>
      {/* CTA for tips submission */}
      <div className='w-full text-right -mt-2 mb-2'>
        <a href='#tips' onClick={() => (window as any)?.va?.track?.('cta_scroll_tips')} className='text-sm underline hover:no-underline'>
          Got a tip for this brand?
        </a>
      </div>
    </>
  );
}