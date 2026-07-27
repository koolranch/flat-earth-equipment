'use client';

import { useLayoutEffect, useState } from 'react';
import { getClickIds, type ClickIds } from '@/lib/attribution/getClickIds';

/**
 * Injects Google click ids (gclid / gbraid / wbraid) as hidden inputs into a
 * <form action={createTrainingCheckoutSessionFromForm}> so they reach the
 * Stripe Checkout Session metadata for ad attribution.
 *
 * Uses useLayoutEffect (not useEffect) so ids are in the DOM before the first
 * paint/interaction when possible — avoids a race where Buy is clicked before
 * a deferred effect runs.
 */
export default function ClickIdsHiddenInput() {
  const [clickIds, setClickIds] = useState<ClickIds>({});

  useLayoutEffect(() => {
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
