"use client";
import * as React from 'react';
import AnimatedSvg from '@/components/lessons/AnimatedSvg';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function track(name: string, data?: Record<string, any>) {
  try { (window as any).analytics?.track?.(name, { name, ts: Date.now(), ...data }); } catch {}
}

const STEPS = [
  { id: 'ppe', label: 'PPE on (vest, hard hat, boots, eye/ear protection)', type: 'check' as const },
  { id: 'seatbelt', label: 'Buckle seatbelt', type: 'anim' as const, src: '/training/animations/d1-seatbelt.svg' },
  { id: 'brake', label: 'Set parking brake', type: 'anim' as const, src: '/training/animations/d2-parking-brake.svg' },
  { id: 'horn_lights', label: 'Test horn and lights', type: 'check' as const }
];

export default function PreOp() {
  const [idx, setIdx] = React.useState(0);
  const [done, setDone] = React.useState<Record<string, boolean>>({});
  const step = STEPS[idx];

  React.useEffect(() => { track('demo_start', { demo: 'preop' }); }, []);
  React.useEffect(() => { track('sim_param_change', { demo: 'preop', step: step.id, index: idx }); }, [idx, step.id]);

  const markDone = () => {
    setDone((d) => ({ ...d, [step.id]: true }));
    track('quiz_item_answered', { demo: 'preop', item: step.id, correct: true });
  };

  const next = () => {
    if (idx < STEPS.length - 1) setIdx((n) => n + 1); else track('demo_complete', { demo: 'preop' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">Pre-Operation Inspection<span className="text-sm text-slate-500">Step {idx + 1} / {STEPS.length}</span></CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-slate-800 font-medium">{step.label}</div>
        {step.type === 'anim' && (
          <div className="rounded-2xl border bg-white overflow-hidden" style={{ aspectRatio: '3 / 1' }}>
            <AnimatedSvg src={step.src} title={step.label} />
          </div>
        )}
        <div className="flex gap-3">
          {!done[step.id] ? (
            <Button onClick={markDone}>Mark Step Complete</Button>
          ) : (
            <Button onClick={next}>{idx < STEPS.length - 1 ? 'Next →' : 'Finish'}</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
