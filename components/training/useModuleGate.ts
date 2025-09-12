"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type StepKey = "osha" | "practice" | "cards" | "quiz";
type GateState = Record<StepKey, boolean>;

export function useModuleGate(opts: {
  courseId: string;
  moduleKey: string; // e.g., "m1","m2"...
  initial?: Partial<GateState>;
}) {
  const { courseId, moduleKey, initial } = opts;

  const [done, setDone] = useState<GateState>({
    osha: !!initial?.osha,
    practice: !!initial?.practice,
    cards: !!initial?.cards,
    quiz: !!initial?.quiz,
  });

  // optimistic toggle + persist
  const markDone = useCallback(async (step: StepKey) => {
    setDone((d) => ({ ...d, [step]: true }));
    try {
      await fetch("/api/training/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          moduleKey,
          stepKey: step,
          done: true,
        }),
      });
    } catch {
      // swallow; UI already optimistic
    }
  }, [courseId, moduleKey]);

  const allDone = useMemo(
    () => done.osha && done.practice && done.cards && done.quiz,
    [done]
  );

  return { done, markDone, allDone, setDone };
}
