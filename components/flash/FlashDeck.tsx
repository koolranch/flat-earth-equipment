"use client";
import * as React from "react";
import { FlashCard } from "./FlashCard";

export type Card = {
  id: string;
  front: React.ReactNode;
  back: React.ReactNode;
  // Optional timing hint for long/visual cards (seconds). If omitted, we use a 9s fallback.
  readSecondsHint?: number;
};

type FlashDeckProps = {
  moduleId: string | number;
  cards: Card[];
  onAllDone?: () => void;
  persistUrl?: string;
  ctaRight?: React.ReactNode;
  /** Auto mode: stays on, but slow and user-friendly */
  autoMode?: "content";     // fixed value for now; content-aware timing
  defaultSeconds?: number;  // fallback when no hint provided (default 9s)
  flipMode?: "fade" | "3d"; // default "fade"
};

export function FlashDeck({
  moduleId,
  cards,
  onAllDone,
  persistUrl = "/api/progress/section",
  ctaRight,
  autoMode = "content",
  defaultSeconds = 9,
  flipMode = "fade"
}: FlashDeckProps) {
  const storageKey = `feq:${moduleId}:flash`;
  const [idx, setIdx] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [visited, setVisited] = React.useState<string[]>(() => {
    try { const s = JSON.parse(localStorage.getItem(storageKey) || "[]"); return Array.isArray(s) ? s : []; }
    catch { return []; }
  });

  // progress bar + timers
  const [progressPct, setProgressPct] = React.useState(0);
  const timerRef = React.useRef<number | null>(null);
  const startRef = React.useRef<number | null>(null);
  const durationRef = React.useRef<number>(0);
  const pausedRef = React.useRef<boolean>(false);

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

  const markVisited = (id: string) =>
    setVisited((p) => (p.includes(id) ? p : [...p, id]));

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(cards.length - 1, next));
    setIdx(clamped);
    setFlipped(false);
    stopTimer();
    setProgressPct(0);
  };

  function targetMsForCard() {
    if (autoMode !== "content") return 0;
    const hint = current?.readSecondsHint;
    const baseSec = typeof hint === "number" && hint > 0 ? hint : defaultSeconds;
    return Math.round(baseSec * 1000);
  }

  function stopTimer() {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    startRef.current = null;
    setProgressPct(0);
  }
  function tick() {
    if (pausedRef.current) return;
    const start = startRef.current!;
    const elapsed = performance.now() - start;
    const pct = Math.min(100, (elapsed / durationRef.current) * 100);
    setProgressPct(pct);
    if (elapsed >= durationRef.current) {
      stopTimer();
      const next = idx + 1;
      if (next < cards.length) go(next);
      return;
    }
    timerRef.current = window.setTimeout(tick, 100) as any;
  }
  function startTimer(ms: number) {
    if (!ms) return;
    stopTimer();
    durationRef.current = ms;
    startRef.current = performance.now();
    pausedRef.current = false;
    tick();
  }
  function pauseTimer() { pausedRef.current = true; }
  function resumeTimer() {
    if (startRef.current == null) return;
    const now = performance.now();
    const elapsed = now - startRef.current;
    durationRef.current = Math.max(0, durationRef.current - elapsed);
    startRef.current = now;
    pausedRef.current = false;
    tick();
  }

  const onFlip = () => {
    setFlipped((f) => !f);
    if (!visited.includes(current.id)) markVisited(current.id);
    // auto: only when ANSWER is showing (after user flips)
    if (!flipped && autoMode === "content") {
      startTimer(targetMsForCard());
    } else {
      stopTimer();
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
  const onTouchStart = (e: React.TouchEvent) => { touchRef.current.x = e.touches[0].clientX; pauseTimer(); };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchRef.current.x; if (start == null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) > 40) { dx < 0 ? go(idx + 1) : go(idx - 1); }
    touchRef.current.x = null;
    if (flipped && autoMode === "content") resumeTimer();
  };

  const canNext = flipped || visited.includes(current.id);
  const progress = `${idx + 1} / ${cards.length}`;

  return (
    <div
      className="space-y-4"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseEnter={pauseTimer}
      onMouseLeave={() => { if (flipped && autoMode === "content") resumeTimer(); }}
    >
      <div className="flex items-center justify-center">
        <span className="inline-flex items-center gap-2 text-sm text-slate-600">
          <span className="rounded-full bg-slate-100 px-2 py-0.5">{progress}</span>
          <span>Open each card before taking the quiz.</span>
        </span>
      </div>

      <div className="relative">
        <FlashCard
          front={current.front}
          back={current.back}
          isFlipped={flipped}
          onFlip={onFlip}
          mode={flipMode}
        />
        {autoMode === "content" && flipped && (
          <div className="absolute inset-x-6 -bottom-2 h-1.5 overflow-hidden rounded bg-slate-200">
            <div
              className="h-full bg-[#F76511] transition-[width] duration-100"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5">
        {cards.map((c, i) => (
          <button key={c.id} onClick={() => go(i)} aria-label={`Go to card ${i+1}`}
            className={[
              "h-2.5 w-2.5 rounded-full transition",
              i === idx ? "bg-[#F76511]"
              : visited.includes(c.id) ? "bg-slate-400"
              : "bg-slate-200 hover:bg-slate-300"
            ].join(" ")}
          />
        ))}
      </div>

      {/* Footer with controls and CTA */}
      <div className="mt-4 border-t border-slate-200 pt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => go(idx - 1)} 
            disabled={idx === 0}
            aria-label="Back card"
            className={["rounded-lg border px-3 py-2 text-sm transition",
              idx === 0 ? "border-slate-200 text-slate-400 cursor-not-allowed"
                        : "border-slate-300 text-slate-700 hover:bg-slate-50"].join(" ")}
          >
            Back
          </button>
          <button 
            onClick={onFlip}
            aria-label="Flip card"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            {flipped ? "Show question" : "Flip"}
          </button>
          <button 
            onClick={() => go(idx + 1)}
            disabled={idx >= cards.length - 1 || !canNext}
            aria-label="Next card"
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
        <div className="w-full sm:w-auto sm:ml-auto">
          {ctaRight}
        </div>
      </div>

      {!visited.length
        ? <p className="text-xs text-slate-500">Tap a card to flip.</p>
        : !allDone
          ? <p className="text-xs text-slate-500">You've opened {visited.length} of {cards.length} cards.</p>
          : <p className="text-xs text-green-700">All cards viewed — you're ready for the quiz.</p>}
    </div>
  );
}
