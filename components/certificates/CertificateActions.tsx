'use client';
import { useState } from 'react';

export function WalletCardButton({ certificateId, url }: { certificateId: string; url?: string | null }) {
  const [busy, setBusy] = useState(false);

  const handleGenerate = async () => {
    try {
      setBusy(true);
      const res = await fetch(`/api/certificates/${certificateId}/wallet`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed');
      if (json?.url) window.open(json.url, '_blank');
    } catch (e) {
      console.error(e);
      alert('Could not generate wallet card.');
    } finally {
      setBusy(false);
    }
  };

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-lg border px-3 py-2 text-sm">
        Wallet card (PDF)
      </a>
    );
  }

  return (
    <button onClick={handleGenerate} disabled={busy} className="inline-flex items-center rounded-lg border px-3 py-2 text-sm">
      {busy ? 'Generating…' : 'Generate wallet card'}
    </button>
  );
}
