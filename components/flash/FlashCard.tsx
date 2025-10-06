"use client";
import * as React from "react";

type FlipMode = "fade" | "3d";

type FlashCardProps = {
  front: React.ReactNode;
  back: React.ReactNode;
  isFlipped: boolean;
  onFlip: () => void;
  mode?: FlipMode;         // NEW: default "fade"
  allowAnimation?: boolean;
};

export function FlashCard({
  front,
  back,
  isFlipped,
  onFlip,
  mode = "fade",
  allowAnimation = true
}: FlashCardProps) {
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const animated = allowAnimation && !reduceMotion;

  if (mode === "3d") {
    // Keep 3D option (fixed orientation)
    return (
      <button
        type="button"
        aria-label={isFlipped ? "Show question" : "Show answer"}
        onClick={onFlip}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            onFlip();
          }
        }}
        className={[
          "relative w-full rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-canyon-rust",
          "min-h-[280px] md:min-h-[320px] select-none",
          "hover:shadow-md hover:border-canyon-rust/30 transition-all duration-200",
          "active:scale-[0.98] touch-manipulation",
          animated ? "transition-transform [transform-style:preserve-3d]" : ""
        ].join(" ")}
        style={
          animated
            ? {
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                perspective: 1000
              }
            : undefined
        }
      >
        <div
          className={["absolute inset-0 p-6", "backface-hidden"].join(" ")}
          style={{ transform: "rotateY(0deg)" }}
        >
          {front}
          <div className="pointer-events-none mt-4 flex items-center justify-center">
            <div className="bg-canyon-rust/10 text-canyon-rust px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <span>👆</span>
              <span>Tap to reveal answer</span>
            </div>
          </div>
        </div>
        <div
          className={[
            "absolute inset-0 p-6 rounded-2xl bg-slate-50",
            "backface-hidden"
          ].join(" ")}
          style={{ transform: "rotateY(180deg)" }}
        >
          {back}
        </div>
      </button>
    );
  }

  // Default: FADE (no mirrored text, most legible)
  return (
    <button
      type="button"
      aria-live="polite"
      aria-label={isFlipped ? "Show question" : "Show answer"}
      onClick={onFlip}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onFlip();
        }
      }}
      className={[
        "relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-canyon-rust",
        "min-h-[280px] md:min-h-[320px] select-none",
        "hover:shadow-md hover:border-canyon-rust/30 transition-all duration-200",
        "active:scale-[0.98] touch-manipulation" // Better mobile feedback
      ].join(" ")}
    >
      <div
        className={[
          "absolute inset-0 p-6",
          animated ? "transition-opacity duration-250" : "",
          isFlipped ? "opacity-0" : "opacity-100"
        ].join(" ")}
      >
        {front}
        <div className="pointer-events-none mt-4 flex items-center justify-center">
          <div className="bg-canyon-rust/10 text-canyon-rust px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <span>👆</span>
            <span>Tap to reveal answer</span>
          </div>
        </div>
      </div>
      <div
        className={[
          "absolute inset-0 p-6 rounded-2xl bg-slate-50",
          animated ? "transition-opacity duration-250" : "",
          isFlipped ? "opacity-100" : "opacity-0"
        ].join(" ")}
      >
        {back}
      </div>
    </button>
  );
}
