"use client";
import * as React from 'react';
import AnimatedSvg from '@/components/lessons/AnimatedSvg';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Using native range input instead of Slider component
import { Button } from '@/components/ui/button';

function track(name: string, data?: Record<string, any>) {
  try { (window as any).analytics?.track?.(name, { name, ts: Date.now(), ...data }); } catch {}
}

export default function BalanceSim() {
  const [dist, setDist] = React.useState(24); // inches from heel (nominal)
  const [weight, setWeight] = React.useState(1200); // lb per box (nominal)

  React.useEffect(() => { track('demo_start', { demo: 'balance' }); }, []);

  const onDist = (v: number[]) => { setDist(v[0]); track('sim_param_change', { demo: 'balance', param: 'distance', value: v[0] }); };
  const onWeight = (v: number[]) => { setWeight(v[0]); track('sim_param_change', { demo: 'balance', param: 'weight', value: v[0] }); };

  // Simple stability hint (for UI only)
  const moment = (dist * weight) | 0; // pseudo calc
  const safe = moment < 24000; // arbitrary cutoff for demo

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance & Load Handling</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-2xl border bg-white overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
          <AnimatedSvg src="/training/animations/d5-stability-triangle.svg" title="Stability triangle" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="mb-2 text-sm text-slate-700">Load distance from fork heel (in)</div>
            <input 
              type="range" 
              min={12} 
              max={48} 
              step={1} 
              value={dist}
              onChange={(e) => onDist([Number(e.target.value)])}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="mt-1 text-xs text-slate-500">{dist}"</div>
          </div>
          <div>
            <div className="mb-2 text-sm text-slate-700">Box weight (lb)</div>
            <input 
              type="range" 
              min={200} 
              max={2000} 
              step={50} 
              value={weight}
              onChange={(e) => onWeight([Number(e.target.value)])}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="mt-1 text-xs text-slate-500">{weight} lb</div>
          </div>
        </div>
        <div className={`rounded-xl border p-3 text-sm ${safe ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>Stability check: <span className="font-semibold">{safe ? 'Within safe range' : 'Risk of tip-over — reduce distance/weight'}</span></div>
        <Button onClick={() => track('demo_complete', { demo: 'balance' })}>Continue</Button>
      </CardContent>
    </Card>
  );
}
