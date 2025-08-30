'use client';
import { useEffect, useState } from 'react';

export default function TranscriptAccordion({ slug, locale = 'en' }: { slug: string; locale?: 'en' | 'es' }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Try to fetch transcript in the requested locale first
        const res = await fetch(`/content/transcripts/${slug}.${locale}.txt`, { cache: 'no-store' });
        if (res.ok) {
          setText(await res.text());
        } else {
          // Fallback to English transcript
          const enRes = await fetch(`/content/transcripts/${slug}.en.txt`, { cache: 'no-store' });
          if (enRes.ok) {
            setText(await enRes.text());
          } else {
            setText('');
          }
        }
      } catch {
        setText('');
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, locale]);

  return (
    <section className="mt-3 border-t pt-3">
      <button 
        aria-expanded={open} 
        className="text-sm underline text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors" 
        onClick={() => setOpen(!open)}
        disabled={loading}
      >
        {loading ? 'Loading transcript...' : (open ? 'Hide transcript' : 'Show transcript')}
      </button>
      {open && (
        <div className="mt-2 rounded-lg bg-slate-50 dark:bg-slate-800 p-3 border">
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
            Video Transcript
            {locale !== 'en' && text && !text.includes('Transcript unavailable') && (
              <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                {locale.toUpperCase()}
              </span>
            )}
          </h3>
          <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {text || 'Transcript unavailable.'}
          </pre>
        </div>
      )}
    </section>
  );
}
