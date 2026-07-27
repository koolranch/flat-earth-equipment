'use client';

import { useEffect } from 'react';
import { getClickIds } from '@/lib/attribution/getClickIds';

/**
 * Mount on marketing/safety pages so a landing URL with ?gclid=… is persisted
 * to localStorage + cookies before the user scrolls to pricing or navigates.
 * Renders nothing.
 */
export default function CaptureClickIds() {
  useEffect(() => {
    getClickIds();
  }, []);

  return null;
}
