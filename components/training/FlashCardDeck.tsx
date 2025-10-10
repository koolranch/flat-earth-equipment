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
  const [visited, setVisited] = React.useState(() => new Set<string>());
  const total = cards.length;

  React.useEffect(() => { if (revealed && cards[idx]) setVisited(p => new Set(p).add(String(cards[idx].id))); }, [revealed, idx, cards]);

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
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header with Progress */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600 mt-1">Review key concepts - open each card once</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-[#F76511]">{idx + 1}</div>
          <div className="text-xs text-slate-600">of {total}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#F76511] to-orange-600 transition-all duration-300"
            style={{ width: `${((idx + 1) / total) * 100}%` }}
          ></div>
        </div>
        <button
          type="button"
          onClick={() => setAuto(a => !a)}
          className={clsx(
            'rounded-xl px-4 py-2 text-sm font-semibold border-2 transition-all',
            auto 
              ? 'bg-[#F76511] border-orange-600 text-white shadow-md' 
              : 'bg-white border-slate-300 text-slate-700 hover:border-[#F76511]'
          )}
          aria-pressed={auto}
        >
          {auto ? '⏯️ Auto: On' : '⏸️ Auto: Off'}
        </button>
      </div>

      <div className="relative w-full rounded-2xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow">
        <span className={clsx('absolute left-4 top-4 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold border-2', revealed ? 'border-orange-300 text-orange-700 bg-orange-50' : 'border-blue-300 text-blue-700 bg-blue-50')}>
          {revealed ? '💡 Answer' : '❓ Question'}
        </span>

        <div className="mt-5 grid gap-4 sm:grid-cols-[auto,1fr] items-start">
          {(card.img || card.icon) && (
            <div className="mx-auto sm:mx-0 sm:mt-1">
              {card.img || (card.icon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={card.icon} 
                  alt={typeof card.front === 'string' ? card.front : 'Flashcard icon'} 
                  className="w-28 h-28 object-contain drop-shadow-md"
                  loading="lazy"
                />
              ))}
            </div>
          )}
          <div className="min-h-[144px] text-[15px] leading-relaxed text-slate-800">
            {revealed ? (<div aria-live="polite">{card.back}</div>) : (<div>{card.front}</div>)}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={prev} 
              className="rounded-xl border-2 border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={idx === 0}
            >
              ← Back
            </button>
            <button 
              type="button" 
              onClick={toggleReveal} 
              className={clsx(
                'rounded-xl px-5 py-2 text-sm font-semibold transition-all shadow-md',
                revealed 
                  ? 'bg-slate-100 border-2 border-slate-300 text-slate-700 hover:bg-slate-200' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              )}
              data-testid="flashcard-reveal"
            >
              {revealed ? 'Hide Answer' : '🔍 Reveal Answer'}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5">
              {Array.from({ length: total }).map((_, i) => {
                const cardId = cards[i]?.id;
                const isVisited = cardId ? visited.has(String(cardId)) : false;
                return (
                  <span 
                    key={i} 
                    className={clsx('h-2.5 w-2.5 rounded-full transition-all', i === idx ? 'bg-[#F76511] scale-125' : isVisited ? 'bg-orange-300' : 'bg-slate-300')} 
                  />
                );
              })}
            </div>
            <button 
              type="button" 
              onClick={next} 
              className="rounded-xl bg-[#F76511] px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
              data-testid="flashcard-next"
              disabled={idx === total - 1}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {allViewed && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl">
              ✓
            </div>
            <div>
              <h3 className="font-bold text-emerald-900 text-lg">All Cards Reviewed!</h3>
              <p className="text-sm text-emerald-700">You've reviewed all flashcards. Ready for the quiz?</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onDone?.()}
          disabled={!allViewed}
          className={clsx(
            'rounded-xl px-6 py-3 text-sm font-semibold transition-all shadow-md',
            allViewed 
              ? 'bg-[#F76511] text-white hover:bg-orange-600 hover:shadow-lg' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          )}
          data-testid="flashcard-complete"
        >
          {allViewed ? 'Mark Flash Cards done → Quiz' : 'View all cards to continue'}
        </button>
      </div>
    </div>
  );
}
