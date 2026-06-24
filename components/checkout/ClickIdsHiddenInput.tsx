'use client';

import { useEffect, useState } from 'react';
import { getClickIds, type ClickIds } from '@/lib/attribution/getClickIds';

/**
 * Injects Google click ids (gclid / gbraid / wbraid) as hidden inputs into a
 * <form action={createTrainingCheckoutSessionFromForm}> so they reach the
 * Stripe Checkout Session metadata for ad attribution.
 *
 * Mirrors the ReferralHiddenInput pattern. Reads on mount (client only); renders
 * nothing when no click ids are present.
 */
export default function ClickIdsHiddenInput() {
  const [clickIds, setClickIds] = useState<ClickIds>({});

  useEffect(() => {
    setClickIds(getClickIds());
  }, []);

  return (
    <>
      {clickIds.gclid && <input type="hidden" name="gclid" value={clickIds.gclid} />}
      {clickIds.gbraid && <input type="hidden" name="gbraid" value={clickIds.gbraid} />}
      {clickIds.wbraid && <input type="hidden" name="wbraid" value={clickIds.wbraid} />}
    </>
  );
}
