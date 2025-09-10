import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type Card = { id: string; front: string; back: string; icon?: string };
export function FlashDeck({ cards, className }: { cards: Card[]; className?: string }) {
  const [idx, setIdx] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const total = cards.length;
  const card = cards[idx];

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === ' ' || e.key.toLowerCase() === 'f') setFlipped(v => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx]);

  function next(){ setFlipped(false); setIdx(i => Math.min(i+1, total-1)); }
  function prev(){ setFlipped(false); setIdx(i => Math.max(i-1, 0)); }

  const Icon = () => {
    const src = card.icon || '';
    const alt = card.front;
    const [ok, setOk] = React.useState(true);
    React.useEffect(() => { setOk(true); }, [src]);
    return ok && src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className="w-24 h-24 object-contain"
        onError={() => setOk(false)}
        loading="lazy"
      />
    ) : (
      <div className="w-24 h-24 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
        <span className="text-2xl" aria-hidden>📘</span>
      </div>
    );
  };

  return (
    <div className={cn('w-full max-w-3xl mx-auto', className)}>
      <div className='text-sm text-slate-500 mb-2'>{idx+1} / {total}</div>
      <button
        aria-label='flash-card'
        onClick={() => setFlipped(v => !v)}
        className='w-full aspect-[16/9] rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center justify-center p-6 text-left transition-[transform] duration-300 hover:shadow-md'
      >
        <div className='grid grid-cols-[112px_1fr] gap-5 items-center w-full h-full'>
          <Icon />
          <div className='text-slate-800 text-lg leading-relaxed'>
            {flipped ? (
              <span className='block'>{card.back}</span>
            ) : (
              <span className='block font-medium'>{card.front}</span>
            )}
            <div className='mt-3 text-xs text-slate-500'>(Tap or press space to flip)</div>
          </div>
        </div>
      </button>
      <div className='mt-4 flex items-center justify-between'>
        <button onClick={prev} disabled={idx===0} className='px-3 py-2 rounded-md border disabled:opacity-40'>Back</button>
        <button onClick={() => setFlipped(v=>!v)} className='px-3 py-2 rounded-md border'>Flip</button>
        <button onClick={next} disabled={idx===total-1} className='px-3 py-2 rounded-md border disabled:opacity-40'>Next</button>
      </div>
    </div>
  );
}
