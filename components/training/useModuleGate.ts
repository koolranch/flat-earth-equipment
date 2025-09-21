"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { markGateDone } from '@/lib/training/markGateClient';

type StepKey = "osha" | "practice" | "cards" | "quiz";
type GateState = Record<StepKey, boolean>;

export function useModuleGate(opts: {
  courseId: string;
  moduleKey: string; // e.g., "m1","m2"...
  moduleSlug?: string; // NEW: content_slug for proper gate tracking
  initial?: Partial<GateState>;
}) {
  const { courseId, moduleKey, moduleSlug, initial } = opts;

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
      if (moduleSlug) {
        // Use new fractional progress system
        await markGateDone(moduleSlug, step);
      } else {
        // Fallback to legacy API for backward compatibility
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
      }
    } catch {
      // swallow; UI already optimistic
    }
  }, [courseId, moduleKey, moduleSlug]);

  const allDone = useMemo(
    () => done.osha && done.practice && done.cards && done.quiz,
    [done]
  );

  return { done, markDone, allDone, setDone };
}
