'use client';

import { useEffect } from 'react';
import { trackChargerViewItem } from '@/lib/analytics/charger-modules';

/** Fires a one-shot GA4 view_item when a dedicated charger SKU page mounts. */
export default function ChargerViewTracker({
  slug,
  brand,
  partNumber,
  priceCents,
  offer = 'Reman Exchange',
}: {
  slug: string;
  brand: string;
  partNumber: string;
  priceCents: number;
  offer?: string;
}) {
  useEffect(() => {
    trackChargerViewItem({ slug, brand, partNumber, priceCents, offer });
  }, [slug, brand, partNumber, priceCents, offer]);

  return null;
}
