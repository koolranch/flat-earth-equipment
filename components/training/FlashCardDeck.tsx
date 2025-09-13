import * as React from "react";

export type CardItem = {
  id: string;
  front: React.ReactNode;
  back: React.ReactNode;
  media?: React.ReactNode; // optional img/svg above text
};

type Props = {
  items: CardItem[];
  onComplete?: () => void;            // fires once when all viewed
  onCtaClick: () => void;              // go-to-quiz action
  autoAdvanceMs?: number;              // default 8000
  ctaLabel?: string;                   // customizable label
  className?: string;
};

export default function FlashCardDeck({
  items,
  onComplete,
  onCtaClick,
  autoAdvanceMs = 8000,
  ctaLabel = "Mark Flash Cards done → Quiz",
  className,
}: Props) {
  const [index, setIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [viewed, setViewed] = React.useState<Set<string>>(
    () => (items[0]?.id ? new Set([items[0].id]) : new Set())
  );

  const current = items[index];
  const allViewed = viewed.size >= items.length && items.length > 0;

  // mark current viewed
  React.useEffect(() => {
    if (!current) return;
    setViewed((s) => {
      if (s.has(current.id)) return s;
      const next = new Set(s);
      next.add(current.id);
      return next;
    });
  }, [current]);

  // notify once all viewed (only once)
  const hasNotifiedRef = React.useRef(false);
  React.useEffect(() => {
    if (allViewed && onComplete && !hasNotifiedRef.current) {
      hasNotifiedRef.current = true;
      onComplete();
    }
  }, [allViewed, onComplete]);

  // auto-advance; pause while flipped
  React.useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => {
      if (flipped) { setFlipped(false); return; }
      setIndex((i) => Math.min(i + 1, items.length - 1));
    }, autoAdvanceMs);
    return () => clearTimeout(t);
  }, [index, flipped, current, autoAdvanceMs, items.length]);

  // keyboard controls
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); setFlipped((f) => !f); }
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, items.length - 1));
      if (e.key === "ArrowLeft")  setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items.length]);

  if (!current) return null;

  return (
    <div className={`flex flex-col gap-4 ${className ?? ""}`}>
      {/* Card */}
      <button
        type="button"
        aria-label={flipped ? "Show question" : "Show answer"}
        onClick={() => setFlipped((f) => !f)}
        className="w-full rounded-xl border border-slate-200 bg-white shadow-sm p-6 text-left transition active:scale-[0.997] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        style={{ minHeight: 260 }}
      >
        {current.media && (
          <div className="mb-3 flex items-center justify-center">{current.media}</div>
        )}
        <div className="text-slate-900 leading-relaxed">
          {flipped ? current.back : current.front}
        </div>
        <div className="mt-3 text-xs text-slate-500">(Tap/click or press Space to flip)</div>
      </button>

      {/* Controls + pager */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="h-11 px-4 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40"
            onClick={() => setIndex((i) => Math.max(i - 1, 0))}
            disabled={index === 0}
          >Back</button>

          <button
            className="h-11 px-4 rounded-lg border border-slate-300 text-slate-700"
            onClick={() => setFlipped((f) => !f)}
          >{flipped ? "Show question" : "Show answer"}</button>

          <button
            className="h-11 px-4 rounded-lg bg-slate-900 text-white disabled:bg-slate-300"
            onClick={() => setIndex((i) => Math.min(i + 1, items.length - 1))}
            disabled={index === items.length - 1}
          >Next</button>
        </div>

        <div className="flex items-center gap-1">
          {items.map((_, i) => (
            <span key={i} className={`h-2 w-2 rounded-full ${i === index ? "bg-orange-500" : "bg-slate-300"}`} />
          ))}
        </div>

        <div className="w-[140px]" aria-hidden />
      </div>

      {/* Footer CTA (single location) */}
      <div className="mt-2 flex justify-end">
        <button
          className="h-11 px-4 rounded-lg bg-orange-600 text-white disabled:opacity-40"
          onClick={onCtaClick}
          disabled={!allViewed}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
