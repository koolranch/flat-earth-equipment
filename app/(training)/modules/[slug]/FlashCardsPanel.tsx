import * as React from "react";
import { FlashDeck, type Card } from "@/components/flash/FlashDeck";

export default function FlashCardsPanel({ moduleId }: { moduleId: string }) {
  // Replace these with your actual flash cards content
  const cards: Card[] = [
    { 
      id: "forks", 
      front: <>Forks — rejection criteria</>, 
      back: <>Reject forks if: cracks, heel wear beyond spec, bent/deflected, locking pins missing, or tips uneven.</> 
    },
    { 
      id: "chains", 
      front: <>Chains & hoses — OK?</>, 
      back: <>No frays/kinks; equal tension. No leaks. Lubrication per manual.</> 
    },
    { 
      id: "tires", 
      front: <>Tire inspection points</>, 
      back: <>Check for proper inflation, excessive wear, cuts, punctures, or embedded objects. Verify tread depth.</> 
    },
    { 
      id: "fluids", 
      front: <>Fluid level checks</>, 
      back: <>Engine oil, hydraulic fluid, coolant, and fuel levels. Look for leaks under the forklift.</> 
    },
    { 
      id: "controls", 
      front: <>Control system test</>, 
      back: <>Test all controls for proper operation: steering, brakes, lift, tilt, and horn functionality.</> 
    },
    { 
      id: "safety", 
      front: <>Safety equipment check</>, 
      back: <>Verify seatbelt, overhead guard, load backrest, and warning lights are present and functional.</> 
    },
    { 
      id: "capacity", 
      front: <>Load capacity verification</>, 
      back: <>Check data plate for maximum load capacity and center of gravity requirements for safe operation.</> 
    },
    { 
      id: "environment", 
      front: <>Work area assessment</>, 
      back: <>Survey for overhead obstructions, floor conditions, pedestrian traffic, and adequate lighting.</> 
    }
  ];

  const [allDone, setAllDone] = React.useState(false);
  const RightCTA = (
    <button
      type="button"
      disabled={!allDone}
      onClick={() => {
        const quizTab = document.querySelector<HTMLButtonElement>("[data-tab='quiz']");
        quizTab?.click();
      }}
      className={[
        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
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
        // persistUrl="/api/progress/section" // keep default soft persist; localStorage fallback
        ctaRight={RightCTA}
        autoAdvanceMs={600}
      />
    </div>
  );
}
