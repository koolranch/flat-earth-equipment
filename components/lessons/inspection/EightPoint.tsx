"use client";
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function track(name: string, data?: Record<string, any>) {
  try { (window as any).analytics?.track?.(name, { name, ts: Date.now(), ...data }); } catch {}
}

const ITEMS = [
  { id: 'tires', label: 'Tires' },
  { id: 'forks', label: 'Forks & tips' },
  { id: 'chains', label: 'Lift chains' },
  { id: 'horn', label: 'Horn' },
  { id: 'lights', label: 'Lights' },
  { id: 'hydraulics', label: 'Hydraulics' },
  { id: 'leaks', label: 'Leaks' },
  { id: 'data_plate', label: 'Data plate' }
];

export default function EightPoint() {
  const [checked, setChecked] = React.useState<Record<string, boolean>>({});
  const allDone = ITEMS.every((i) => checked[i.id]);

  React.useEffect(() => { track('demo_start', { demo: 'eight_point' }); }, []);

  const toggle = (id: string) => {
    setChecked((c) => ({ ...c, [id]: !c[id] }));
    track('quiz_item_answered', { demo: 'eight_point', item: id, correct: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>8-Point Inspection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2">
          {ITEMS.map((i) => (
            <li key={i.id} className="flex items-center justify-between rounded-xl border p-3">
              <span className="text-slate-800">{i.label}</span>
              <button
                onClick={() => toggle(i.id)}
                className={`h-6 w-11 rounded-full transition ${checked[i.id] ? 'bg-orange-600' : 'bg-slate-300'}`}
                aria-pressed={!!checked[i.id]}
                aria-label={`Mark ${i.label} checked`}
              >
                <span className={`block h-5 w-5 rounded-full bg-white translate-y-0.5 transition ${checked[i.id] ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </li>
          ))}
        </ul>
        <div className="pt-2">
          {allDone ? (
            <Button onClick={() => track('demo_complete', { demo: 'eight_point' })}>Continue</Button>
          ) : (
            <div className="text-sm text-slate-600">Check all items to continue.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
