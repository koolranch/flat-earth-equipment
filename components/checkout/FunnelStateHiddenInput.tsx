'use client';

import { useLayoutEffect, useState } from 'react';

/**
 * Persists safety LP state (oh/tx/…) into the training checkout form so
 * /api/checkout can write funnel_state on the Stripe session → orders row.
 */
function resolveFunnelState(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = sessionStorage.getItem('funnel_state');
    if (stored?.trim()) return stored.trim().toLowerCase();
  } catch {
    // ignore
  }
  const params = new URLSearchParams(window.location.search);
  const fromParam = (params.get('state') || params.get('utm_state') || '').trim();
  if (fromParam) {
    const normalized = fromParam.toLowerCase();
    try {
      sessionStorage.setItem('funnel_state', normalized);
    } catch {
      // ignore
    }
    return normalized;
  }
  const match = window.location.pathname.match(/\/safety\/forklift\/([a-z]{2})(?:\/|$)/i);
  if (match) {
    const code = match[1].toLowerCase();
    try {
      sessionStorage.setItem('funnel_state', code);
    } catch {
      // ignore
    }
    return code;
  }
  return null;
}

export default function FunnelStateHiddenInput() {
  const [state, setState] = useState<string | null>(null);

  useLayoutEffect(() => {
    setState(resolveFunnelState());
  }, []);

  if (!state) return null;
  return <input type="hidden" name="funnelState" value={state} />;
}
