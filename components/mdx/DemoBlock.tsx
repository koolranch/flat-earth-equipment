'use client';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const GameComponent = dynamic(() => import('@/components/training/GameComponent'), { ssr:false });

export default function DemoBlock({ demo, title }:{ demo:string; title?:string }){
  useEffect(()=>{ (window as any)?.analytics?.track?.('demo_start', { demo }); },[demo]);
  return (
    <section className="rounded-2xl border p-3 bg-white dark:bg-slate-900">
      {title && <div className="text-sm font-semibold mb-2">{title}</div>}
      {/* @ts-expect-error dynamic component map */}
      <GameComponent name={demo} />
    </section>
  );
}
