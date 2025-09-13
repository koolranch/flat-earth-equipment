import * as React from "react";
import { FlashDeck, type Card } from "@/components/flash/FlashDeck";

export default function FlashCardsPanel({ moduleId }: { moduleId: string }) {
  const cards: Card[] = [
    { id: "forks", front: <>Forks — rejection criteria</>, back: <>Reject if cracks, excessive heel wear, bent/deflected, locking pins missing, or uneven tips.</>, readSecondsHint: 8 },
    { id: "chains", front: <>Chains & hoses — OK?</>, back: <>No frays/kinks; equal tension; no leaks; lube per manual.</>, readSecondsHint: 6 },
    { id: "tires", front: <>Tire inspection points</>, back: <>Check for proper inflation, excessive wear, cuts, punctures, or embedded objects. Verify tread depth.</>, readSecondsHint: 10 },
    { id: "fluids", front: <>Fluid level checks</>, back: <>Engine oil, hydraulic fluid, coolant, and fuel levels. Look for leaks under the forklift.</>, readSecondsHint: 9 },
    { id: "controls", front: <>Control system test</>, back: <>Test all controls for proper operation: steering, brakes, lift, tilt, and horn functionality.</>, readSecondsHint: 8 },
    { id: "safety", front: <>Safety equipment check</>, back: <>Verify seatbelt, overhead guard, load backrest, and warning lights are present and functional.</>, readSecondsHint: 8 },
    { id: "capacity", front: <>Load capacity verification</>, back: <>Check data plate for maximum load capacity and center of gravity requirements for safe operation.</>, readSecondsHint: 10 },
    { id: "environment", front: <>Work area assessment</>, back: <>Survey for overhead obstructions, floor conditions, pedestrian traffic, and adequate lighting.</>, readSecondsHint: 8 }
  ];

  const [allDone, setAllDone] = React.useState(false);
  const RightCTA = (
    <button
      type="button"
      disabled={!allDone}
      onClick={() => document.querySelector<HTMLButtonElement>("[data-tab='quiz']")?.click()}
      aria-label="Mark Flash Cards done and open quiz"
      className={[
        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition w-full sm:w-auto",
        allDone ? "bg-[#F76511] text-white hover:brightness-95" : "bg-slate-200 text-slate-600 cursor-not-allowed"
      ].join(" ")}
    >
      Mark Flash Cards done → Quiz
    </button>
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
      <FlashDeck
        moduleId={moduleId}
        cards={cards}
        onAllDone={() => setAllDone(true)}
        autoMode="content"       // content-aware timing
        defaultSeconds={9}       // fallback for cards without hints
        flipMode="fade"          // use fade to avoid mirrored text
        ctaRight={RightCTA}
      />
    </div>
  );
}
