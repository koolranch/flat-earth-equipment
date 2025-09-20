'use client';
import { useEffect, useRef, useState } from 'react';

type Step = 'osha' | 'practice' | 'cards' | 'quiz';
type TabKey = 'osha' | 'practice' | 'flash' | 'quiz';

export default function StepContinue({
  step,
  nextTab,
  markDone,
  onSwitchTab,
  alreadyDone
}: {
  step: Extract<Step, 'osha' | 'practice'>;
  nextTab: Extract<TabKey, 'practice' | 'flash' | 'quiz'>;
  markDone: (s: Step) => Promise<void>;
  onSwitchTab: (next: TabKey) => void;
  alreadyDone?: boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  async function handleClick() {
    if (submitting) return;
    setSubmitting(true);
    try {
      await markDone(step); // idempotent server-side
      setSaved(true);
      // hide the badge after ~1.5s
      timer.current = window.setTimeout(() => setSaved(false), 1500) as unknown as number;
    } catch (e) {
      // Non-blocking: still advance; server remains source of truth
      console.warn('step-continue error', e);
    } finally {
      setSubmitting(false);
      onSwitchTab(nextTab);
    }
  }

  const label = step === 'osha' ? 'Mark reviewed & continue' : 'Mark practiced & continue';

  return (
    <div className="mt-4 flex items-center justify-end gap-3">
      <div aria-live="polite" className="text-xs text-slate-600 min-h-[1.25rem]">
        {saved && (
          <span className="inline-flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>
            Saved
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={handleClick}
        disabled={submitting}
        className="btn-primary"
        data-testid={`step-continue-${step}`}
        aria-label={alreadyDone ? 'Continue' : label}
      >
        {submitting ? 'Saving…' : alreadyDone ? 'Continue' : label}
      </button>
    </div>
  );
}
