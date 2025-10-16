'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { slugToTitle } from '@/lib/state';

const CHECKOUT_URL = process.env.NEXT_PUBLIC_CHECKOUT_URL || '/training/checkout';

export default function StickyCTA() {
  const params = useParams() as Record<string, string> | null;
  const slug = (params?.state || params?.slug || '').toLowerCase();
  const STATE = slugToTitle(slug);
  
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/90 md:hidden border-t border-white/10">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">Get certified in {STATE}</div>
          <div className="text-xs text-slate-300">$59 • Under 60 minutes</div>
        </div>
        <Link 
          href={`${CHECKOUT_URL}?state=${encodeURIComponent(STATE)}`} 
          className="rounded-lg bg-orange-500 px-5 py-2.5 text-white font-bold hover:bg-orange-600 transition-colors whitespace-nowrap"
        >
          Start Now →
        </Link>
      </div>
    </div>
  );
}

