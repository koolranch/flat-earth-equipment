'use client';
import { useEffect, useState } from 'react';

interface TranscriptToggleProps {
  url: string;
  className?: string;
}

export default function TranscriptToggle({ url, className = '' }: TranscriptToggleProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && !text) {
      setLoading(true);
      fetch(url)
        .then(r => r.text())
        .then(content => {
          setText(content);
          setLoading(false);
        })
        .catch(() => {
          setText('Transcript unavailable.');
          setLoading(false);
        });
    }
  }, [open, url, text]);

  return (
    <div className={`mt-2 ${className}`}>
      <button 
        className="rounded-xl border px-3 py-1 text-sm hover:bg-slate-50 transition-colors disabled:opacity-50" 
        onClick={() => setOpen(o => !o)} 
        aria-expanded={open}
        aria-controls="transcript-content"
        disabled={loading}
      >
        {loading ? 'Loading...' : open ? 'Hide Transcript' : 'Show Transcript'}
      </button>
      
      {open && (
        <div 
          id="transcript-content"
          className="mt-2 whitespace-pre-wrap text-sm p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 max-h-64 overflow-y-auto"
          role="region"
          aria-label="Video transcript"
        >
          {text || '—'}
        </div>
      )}
    </div>
  );
}
