"use client";
import * as React from "react";

type FlashCardProps = {
  front: React.ReactNode;
  back: React.ReactNode;
  isFlipped: boolean;
  onFlip: () => void;
  allowAnimation?: boolean;
};

export function FlashCard({ front, back, isFlipped, onFlip, allowAnimation = true }: FlashCardProps) {
  // Respect prefers-reduced-motion
  const reduceMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const animated = allowAnimation && !reduceMotion;

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
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400",
        "min-h-[280px] md:min-h-[320px] select-none",
        animated ? "transition-transform [transform-style:preserve-3d]" : ""
      ].join(" ")}
      style={animated ? {
        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        perspective: 1000
      } : undefined}
    >
      {/* Front */}
      <div
        className={[
          "absolute inset-0 p-6",
          animated ? "backface-hidden" : ""
        ].join(" ")}
        style={animated ? { transform: "rotateY(0deg)" } : undefined}
      >
        {front}
        <p className="pointer-events-none mt-4 text-xs text-slate-500">Tap or press space to flip</p>
      </div>

      {/* Back */}
      <div
        className={[
          "absolute inset-0 p-6 rounded-2xl",
          animated ? "backface-hidden" : "",
          "bg-slate-50"
        ].join(" ")}
        style={animated ? { transform: "rotateY(180deg)" } : undefined}
      >
        {back}
      </div>
    </button>
  );
}
