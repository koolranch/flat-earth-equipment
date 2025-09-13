"use client";
import * as React from "react";
import { FlashCard } from "./FlashCard";

export type Card = { id: string; front: React.ReactNode; back: React.ReactNode };

type FlashDeckProps = {
  moduleId: string | number;
  cards: Card[];
  onAllDone?: () => void;
  persistUrl?: string;
  ctaRight?: React.ReactNode;
  autoAdvanceMs?: number;        // default 3500 (was 600)
  flipMode?: "fade" | "3d";      // default "fade"
};

export function FlashDeck({
  moduleId,
  cards,
  onAllDone,
  persistUrl = "/api/progress/section",
  ctaRight,
  autoAdvanceMs = 3500,
  flipMode = "fade"
}: FlashDeckProps) {
  const storageKey = `feq:${moduleId}:flash`;
  const [idx, setIdx] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [visited, setVisited] = React.useState<string[]>(() => {
    try {
      const s = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(s) ? s : [];
    } catch { return []; }
  });

  const allDone = visited.length >= cards.length;

  React.useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(visited)); } catch {}
    // soft server persist
    (async () => {
      try {
        await fetch(persistUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moduleId, section: "flash", visited })
        });
      } catch {}
    })();
    if (allDone) onAllDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visited]);

  const current = cards[idx];

  const markVisited = (id: string) => {
    setVisited((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(cards.length - 1, next));
    setIdx(clamped);
    setFlipped(false);
  };

  const onFlip = () => {
    setFlipped((f) => !f);
    if (!visited.includes(current.id)) {
      markVisited(current.id);
    }
    // Slow down auto-advance for readability; allow turning off by passing 0
    if (!flipped && autoAdvanceMs > 0) {
      const next = idx + 1;
      if (next < cards.length) {
        window.setTimeout(() => go(next), autoAdvanceMs);
      }
    }
  };

  // keyboard: arrows + space flip
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(idx + 1);
      if (e.key === "ArrowLeft")  go(idx - 1);
      if (e.key === " ")          { e.preventDefault(); onFlip(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, flipped, visited]);

  // swipe
  const touchRef = React.useRef<{x:number|null}>({x:null});
  const onTouchStart = (e: React.TouchEvent) => (touchRef.current.x = e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchRef.current.x;
    if (start == null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) > 40) { dx < 0 ? go(idx + 1) : go(idx - 1); }
    touchRef.current.x = null;
  };

  const canNext = flipped || visited.includes(current.id);
  const progress = `${idx + 1} / ${cards.length}`;

  return (
    <div className="space-y-4" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-sm text-slate-600">
          <span className="rounded-full bg-slate-100 px-2 py-0.5">{progress}</span>
          <span>Open each card before taking the quiz.</span>
        </span>
        <div className="hidden md:block">{ctaRight}</div>
      </div>

      <FlashCard
        front={current.front}
        back={current.back}
        isFlipped={flipped}
        onFlip={onFlip}
        mode={flipMode}      // NEW
      />

      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => go(idx - 1)}
          disabled={idx === 0}
          className={[
            "rounded-lg border px-3 py-2 text-sm transition",
            idx === 0 ? "border-slate-200 text-slate-400 cursor-not-allowed" : "border-slate-300 text-slate-700 hover:bg-slate-50"
          ].join(" ")}
        >
          Back
        </button>

        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {cards.map((c, i) => (
            <button
              key={c.id}
              aria-label={`Go to card ${i+1}`}
              onClick={() => go(i)}
              className={[
                "h-2.5 w-2.5 rounded-full transition",
                i === idx ? "bg-[#F76511]" : visited.includes(c.id) ? "bg-slate-400" : "bg-slate-200 hover:bg-slate-300"
              ].join(" ")}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onFlip}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            {flipped ? "Show question" : "Flip"}
          </button>
          <button
            type="button"
            onClick={() => go(idx + 1)}
            disabled={idx >= cards.length - 1 || !canNext}
            className={[
              "rounded-lg px-3 py-2 text-sm font-medium transition",
              idx >= cards.length - 1 || !canNext
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-[#F76511] text-white hover:brightness-95"
            ].join(" ")}
          >
            Next
          </button>
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="md:hidden pt-1">{ctaRight}</div>

      {!visited.length ? (
        <p className="text-xs text-slate-500">Tap a card to flip.</p>
      ) : !allDone ? (
        <p className="text-xs text-slate-500">You've opened {visited.length} of {cards.length} cards.</p>
      ) : (
        <p className="text-xs text-green-700">All cards viewed — you're ready for the quiz.</p>
      )}
    </div>
  );
}
