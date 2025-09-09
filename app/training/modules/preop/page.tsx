'use client';
import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { FORKLIFT_MODULES_FALLBACK } from '@/lib/courses';

// Lazy-load to avoid SSR hydration issues with SVG animations
const PPESequenceDemo = dynamic(() => import('@/components/demos/PPESequenceDemo'), { ssr: false });

async function postProgress(moduleKey: string){
  try{
    await fetch('/api/progress/module-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: 'forklift_operator', moduleKey })
    });
  }catch(e){ console.error('progress post failed', e); }
}

export default function Page(){
  const [demoDone, setDemoDone] = React.useState(false);
  const preop = FORKLIFT_MODULES_FALLBACK.find(m => m.key === 'preop');

  return (
    <main className='mx-auto max-w-5xl px-4 py-8'>
      <header className='mb-6'>
        <h1 className='text-2xl font-semibold text-slate-900'>Module 1: Pre-Operation Inspection</h1>
        <p className='text-slate-600 mt-1'>Hands-on: complete the PPE sequence, then take a short quiz.</p>
      </header>

      <section className='mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
        <h2 className='mb-3 text-lg font-medium text-slate-900'>PPE Sequence Demo</h2>
        <div className='rounded-lg bg-slate-50 p-3'>
          <PPESequenceDemo
            onComplete={async () => {
              setDemoDone(true);
              await postProgress('preop');
              if (typeof window !== 'undefined' && (window as any).gtag){ (window as any).gtag('event','demo_complete',{ module: 'preop' }); }
            }}
          />
        </div>
      </section>

      <section className='mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
        <h2 className='mb-2 text-lg font-medium text-slate-900'>Quiz</h2>
        <p className='text-slate-600 mb-4'>Unlocks after you finish the demo.</p>
        <div className='flex items-center gap-3'>
          <button
            disabled={!demoDone}
            onClick={() => {
              const el = document.getElementById('open-quiz-modal');
              if (el) { el.click(); return; }
              // Fallback: route to a quiz page if your app uses a dedicated route
              window.location.href = '/training/quiz?module=preop';
            }}
            className={'inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white ' + (demoDone ? 'bg-orange-600 hover:bg-orange-700' : 'bg-slate-400 cursor-not-allowed')}
            aria-disabled={!demoDone}
          >Start quiz</button>

          {preop?.href && (
            <Link href='/training' className='text-sm text-slate-600 hover:text-slate-900'>Back to modules</Link>
          )}
        </div>
      </section>

      {/* Optional: anchor that some quiz modal listeners bind to */}
      <button id='open-quiz-modal' className='hidden' type='button' aria-hidden='true'/>
    </main>
  );
}
