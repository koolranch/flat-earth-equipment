"use client";
import * as React from 'react';
import AnimatedSvg from '@/components/lessons/AnimatedSvg';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function track(name: string, data?: Record<string, any>) {
  try { (window as any).analytics?.track?.(name, { name, ts: Date.now(), ...data }); } catch {}
}

const STEPS = [
  { id: 'neutral', label: 'Shift to neutral', note: 'Center the selector before stopping.' },
  { id: 'steer', label: 'Steer wheels straight', note: 'Keeps the truck stable when parked.' },
  { id: 'brake', label: 'Set parking brake', anim: '/training/animations/d2-parking-brake.svg' },
  { id: 'forks', label: 'Lower forks to the ground', anim: '/training/animations/d3-forks-lower.svg' },
  { id: 'key', label: 'Turn key off', note: 'Power down before charging.' },
  { id: 'charge', label: 'Connect charger', anim: '/training/animations/d4-connect-charger.svg' },
  { id: 'chock', label: 'Apply wheel chock', note: 'Prevent unintended movement.' }
];

export default function ShutdownSteps() {
  const [idx, setIdx] = React.useState(0);
  const [done, setDone] = React.useState<Record<string, boolean>>({});
  const step = STEPS[idx];

  React.useEffect(() => { track('demo_start', { demo: 'shutdown' }); }, []);
  React.useEffect(() => { track('sim_param_change', { demo: 'shutdown', step: step.id, index: idx }); }, [idx, step.id]);

  const markDone = () => {
    setDone((d) => ({ ...d, [step.id]: true }));
    track('quiz_item_answered', { demo: 'shutdown', item: step.id, correct: true });
  };
  const next = () => {
    if (idx < STEPS.length - 1) setIdx((n) => n + 1); else track('demo_complete', { demo: 'shutdown' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">Shutdown Sequence<span className="text-sm text-slate-500">Step {idx + 1} / {STEPS.length}</span></CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-slate-900 font-medium">{step.label}</div>
          {step.note && <div className="text-sm text-slate-600">{step.note}</div>}
        </div>
        {step.anim && (
          <div className="rounded-2xl border bg-white overflow-hidden" style={{ aspectRatio: '16 / 7' }}>
            <AnimatedSvg src={step.anim} title={step.label} />
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
