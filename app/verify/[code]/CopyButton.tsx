'use client'

import React, { useState } from 'react';

export default function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        const href = url.startsWith('/') ? new URL(url, window.location.origin).toString() : url;
        await navigator.clipboard.writeText(href);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded bg-slate-900 text-white px-3 py-2 text-sm">
      {copied ? 'Copied' : 'Copy link'}
    </button>
  );
}


