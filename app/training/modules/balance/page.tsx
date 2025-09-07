"use client";
import React from 'react';
import SvgEmbed from '@/components/training/SvgEmbed';
import { track } from '@/lib/analytics/track';

export default function BalanceModule() {
  const [weight, setWeight] = React.useState(1200); // lb
  const [distance, setDistance] = React.useState(18); // in, load center

  const cap = 3000; // example nominal
  const stable = distance <= 24 && weight <= cap; // naive rule-of-thumb for demo

  React.useEffect(() => { track('balance_param_change', { weight, distance }); }, [weight, distance]);

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Balance & Load Handling</h1>
        <p className="text-slate-600">Adjust weight and load center. Stay within rated capacity and keep the COG inside the triangle.</p>
      </header>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium">Load Weight (lb): {weight}</label>
            <input type="range" min={200} max={5000} step={50} value={weight} onChange={e => setWeight(parseInt(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium">Load Center (in): {distance}</label>
            <input type="range" min={12} max={36} step={1} value={distance} onChange={e => setDistance(parseInt(e.target.value))} className="w-full" />
          </div>
          <div className={`rounded-xl p-4 border ${stable ? 'border-emerald-400 bg-emerald-50' : 'border-rose-400 bg-rose-50'}`}>
            <div className="font-medium">{stable ? 'Stable' : 'Warning: Outside safe envelope'}</div>
            <div className="text-sm text-slate-600">This demo is simplified for training. Always follow the data plate.</div>
          </div>
        </div>
        <div className="border rounded-2xl p-3">
          <SvgEmbed id={'D5_stability_cog' as any} />
        </div>
      </section>

      <footer>
        <button onClick={() => track('balance_complete', { weight, distance, stable })} className="px-5 py-3 rounded-xl font-semibold bg-black text-white">Continue</button>
      </footer>
    </main>
  );
}
