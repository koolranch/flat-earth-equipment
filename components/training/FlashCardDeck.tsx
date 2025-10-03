// components/training/FlashCardDeck.tsx
// Question → Answer deck with safer timing, badges, and bottom CTA.
'use client';
import React from 'react';
import clsx from 'clsx';

export type FlashCard = {
  id: string | number;
  front: React.ReactNode;   // QUESTION
  back: React.ReactNode;    // ANSWER
  img?: React.ReactNode;    // optional illustration (SVG/IMG component)
  icon?: string;            // optional icon URL (for SVG images)
};

export default function FlashCardDeck({
  cards,
  onDone,
  title = 'Flash Cards',
  autoAdvanceMs = 12000,          // 12s dwell
  revealHoldMs = 4500,            // 4.5s min hold after reveal
  allowAuto = true
}: {
  cards: FlashCard[];
  onDone?: () => void;
  title?: string;
  autoAdvanceMs?: number;
  revealHoldMs?: number;
  allowAuto?: boolean;
}) {
  const [idx, setIdx] = React.useState(0);
  const [revealed, setRevealed] = React.useState(false);
  const [auto, setAuto] = React.useState(allowAuto);
  const [visited, setVisited] = React.useState(() => new Set<number>());
  const total = cards.length;

  React.useEffect(() => { if (revealed) setVisited(p => new Set(p).add(idx)); }, [revealed, idx]);

  React.useEffect(() => {
    if (!auto || !revealed) return;
    const t = setTimeout(() => { next(); }, Math.max(revealHoldMs, autoAdvanceMs));
    return () => clearTimeout(t);
  }, [auto, revealed, idx, autoAdvanceMs, revealHoldMs]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ') { e.preventDefault(); toggleReveal(); }
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, revealed]);

  function toggleReveal() { setRevealed(v => !v); }
  function prev() { setIdx(i => Math.max(0, i - 1)); setRevealed(false); }
  function next() {
    setRevealed(false);
    setIdx(i => {
      if (i === total - 1) { onDone?.(); return i; }
      return i + 1;
    });
  }

  const card = cards[idx];
  const allViewed = visited.size >= total;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-600">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{idx + 1} / {total}</span>
          <button
            type="button"
            onClick={() => setAuto(a => !a)}
            className={clsx('rounded-full px-2.5 py-1 text-xs border', auto ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600')}
            aria-pressed={auto}
          >{auto ? 'Auto: On' : 'Auto: Off'}</button>
        </div>
      </div>

      <div className="relative w-full rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <span className={clsx('absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] border', revealed ? 'border-emerald-300 text-emerald-700 bg-emerald-50' : 'border-sky-300 text-sky-700 bg-sky-50')}>
          {revealed ? 'Answer' : 'Question'}
        </span>

        <div className="mt-5 grid gap-4 sm:grid-cols-[auto,1fr] items-start">
          {(card.img || card.icon) && (
            <div className="mx-auto sm:mx-0 sm:mt-1">
              {card.img || (card.icon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={card.icon} 
                  alt={card.front || 'Flashcard icon'} 
                  className="w-24 h-24 object-contain"
                  loading="lazy"
                />
              ))}
            </div>
          )}
          <div className="min-h-[144px] text-[15px] leading-relaxed text-slate-800">
            {revealed ? (<div aria-live="polite">{card.back}</div>) : (<div>{card.front}</div>)}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button type="button" onClick={prev} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" disabled={idx === 0}>Back</button>
            <button type="button" onClick={toggleReveal} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" data-testid="flashcard-reveal">{revealed ? 'Hide answer' : 'Reveal answer'}</button>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: total }).map((_, i) => (<span key={i} className={clsx('h-2 w-2 rounded-full', i === idx ? 'bg-slate-900' : 'bg-slate-300')} />))}
            </div>
            <button type="button" onClick={next} className="rounded-md bg-orange-600 px-3 py-1.5 text-sm text-white hover:bg-orange-700" data-testid="flashcard-next">{idx === total - 1 ? 'Finish' : 'Next card'}</button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onDone?.()}
          disabled={!allViewed}
          className={clsx('rounded-lg px-4 py-2 text-sm font-medium', allViewed ? 'bg-slate-900 text-white hover:bg-black' : 'bg-slate-200 text-slate-500 cursor-not-allowed')}
          data-testid="flashcard-complete"
        >{allViewed ? 'Mark Flash Cards done → Quiz' : 'Open each card to continue'}</button>
      </div>
    </div>
  );
}
