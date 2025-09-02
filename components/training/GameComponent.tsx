'use client';
import dynamic from 'next/dynamic';
import React from 'react';

// Lazy maps (SSR off for canvas/DOM math)
const StabilityTriangle = dynamic(()=> import('@/components/games/module3/StabilityTriangleSim'), { ssr:false });
const LoadCapacityCalc = dynamic(()=> import('@/components/games/common/LoadCapacityCalc'), { ssr:false });
const ShutdownTrainer = dynamic(()=> import('@/components/games/module5/ShutdownTrainer'), { ssr:false });
// MiniHazard may already exist; if not, fallback placeholder
const MiniHazard = dynamic(async ()=> {
  try { return (await import('@/components/games/module4/MiniHazard')).default; }
  catch { return () => <div className='text-sm text-slate-600'>Coming soon.</div>; }
}, { ssr:false });

// Legacy components for compatibility
const MiniPPE = dynamic(()=> import('@/components/games/module1/MiniPPE'), { ssr:false });
const MiniInspection = dynamic(()=> import('@/components/games/module2/MiniInspection'), { ssr:false });

export default function GameComponent({ name }: { name: string }){
  const map: Record<string, React.ComponentType<any>> = {
    StabilityTriangle, LoadCapacityCalc, ShutdownTrainer, MiniHazard,
    // legacy names for compatibility
    'pre-operation-inspection': MiniPPE,
    'eight-point-inspection': MiniInspection,
    'stability-triangle': StabilityTriangle,
    'hazard-hunt': MiniHazard,
    'shutdown-sequence': ShutdownTrainer,
    // New demo names
    'MiniPPE': MiniPPE,
    'MiniInspection': MiniInspection
  };
  const Cmp = map[name] || (()=> <div className='text-sm text-slate-600'>Unknown demo: {name}</div>);
  return <Cmp />;
}
