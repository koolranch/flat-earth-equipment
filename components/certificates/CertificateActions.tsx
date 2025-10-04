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
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-200 transition-all border-2 border-slate-300"
      >
        <span>💳</span> Wallet Card
      </a>
    );
  }

  return (
    <button 
      onClick={handleGenerate} 
      disabled={busy} 
      className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-200 transition-all border-2 border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {busy ? 'Generating…' : (
        <>
          <span>💳</span> Generate Wallet Card
        </>
      )}
    </button>
  );
}
