'use client';

import Link from 'next/link';
import { track } from '@vercel/analytics/react';
import { Card } from '@/components/ui/card';

interface BrandHubBannerProps {
  slug: string;
  brandName: string;
}

export default function BrandHubBanner({ slug, brandName }: BrandHubBannerProps) {
  return (
    <Card className="p-4 my-4 border-brand-border/60">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="font-semibold">Explore the {brandName} Brand Hub</div>
          <p className="text-sm text-muted-foreground">
            Serial lookup, fault codes, and parts help — all in one place.
          </p>
        </div>
        <Link
          href={`/brand/${slug}?tab=serial`}
          onClick={() => track('brand_hub_banner_click', { brand: slug })}
          className="inline-flex items-center px-3 py-2 rounded-xl border hover:bg-accent transition"
        >
          Open {brandName} Hub
        </Link>
      </div>
    </Card>
  );
}
