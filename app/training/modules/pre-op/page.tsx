"use client";
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FlashDeck } from '@/components/training/FlashDeck';
import { StatusDot } from '@/components/training/StatusDot';
import SvgEmbed from '@/components/training/SvgEmbed';
import SimpleQuizModal from '@/components/quiz/SimpleQuizModal';
import { track } from '@/lib/analytics/track';
import { assetUrl } from '@/lib/assets';
import { resolveAsset } from '@/lib/asset-manifest';
import { recordStepCompleteSafe } from '@/lib/progress/client';
import flashData from '@/content/training/forklift-operator/module-1/preop-flashcards.json';

const steps = [
  { key: 'ppe_vest', label: 'Hi-vis vest', iconKey: 'ppeVest' },
  { key: 'ppe_hardhat', label: 'Hard hat', iconKey: 'ppeHardhat' },
  { key: 'ppe_boots', label: 'Safety boots', iconKey: 'ppeBoots' },
  { key: 'ppe_eyes_ears', label: 'Eye/Ear protection', iconKey: 'ppeGoggles' },
  { key: 'horn_test', label: 'Horn test', iconKey: 'controlHorn' },
  { key: 'lights_test', label: 'Lights test', iconKey: 'controlLights' },
  { key: 'data_plate', label: 'Data plate present/legible', iconKey: 'dataPlate' }
] as const;

export default function PreOpModule() {
  const router = useRouter();
  const [done, setDone] = React.useState<Record<string, boolean>>({});
  
  // New tab-based state management
  const [tab, setTab] = React.useState<'osha'|'practice'|'flash'|'quiz'>('osha');
  const [flashTouched, setFlashTouched] = React.useState(false);
  const [quizPassed, setQuizPassed] = React.useState(false);
  const [openQuiz, setOpenQuiz] = React.useState(false);

  // Persist state for preview sessions
  React.useEffect(() => {
    try {
      const key = 'm1-preop-preview';
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      if (saved.done) setDone(saved.done);
      if (saved.flashTouched) setFlashTouched(true);
      if (saved.quizPassed) setQuizPassed(true);
    } catch {}
  }, []);
  
  React.useEffect(() => {
    try {
      const key = 'm1-preop-preview';
      localStorage.setItem(key, JSON.stringify({ done, flashTouched, quizPassed }));
    } catch {}
  }, [done, flashTouched, quizPassed]);

  function toggle(k: string) {
    setDone(d => {
      const v = !d[k];
      const next = { ...d, [k]: v };
      track('preop_step_toggle', { step: k, done: v });
      return next;
    });
  }

  const allDone = steps.every(s => done[s.key]);
  const prereqsMet = allDone && flashTouched;

  async function markModuleComplete() {
    try {
      await recordStepCompleteSafe({course:'forklift_operator', module:1, step:'preop'});
      track('preop_complete', { allDone: true, quizPassed: true });
    } catch {}
  }

  React.useEffect(() => {
    if (quizPassed) markModuleComplete();
  }, [quizPassed]);

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Module 1: Pre-Operation</h1>
        <p className="text-slate-600">Equip PPE and complete basic safety checks before you move the truck.</p>
      </header>

      {/* Tabs: OSHA → Practice → Flash → Quiz */}
      <div className='flex gap-2 mb-4'>
        <button 
          className={`px-3 py-1.5 rounded-md border ${tab==='osha'?'bg-white border-blue-500':'bg-slate-50 border-slate-200'}`} 
          onClick={() => setTab('osha')}
        >
          OSHA Basics <StatusDot state={allDone||flashTouched||quizPassed ? 'done':'todo'} />
        </button>
        <button 
          className={`px-3 py-1.5 rounded-md border ${tab==='practice'?'bg-white border-blue-500':'bg-slate-50 border-slate-200'}`} 
          onClick={() => setTab('practice')}
        >
          Practice <StatusDot state={allDone ? 'done':'todo'} />
        </button>
        <button 
          className={`px-3 py-1.5 rounded-md border ${tab==='flash'?'bg-white border-blue-500':'bg-slate-50 border-slate-200'}`} 
          onClick={() => { setTab('flash'); setFlashTouched(true); }}
        >
          Flash Cards <StatusDot state={flashTouched ? 'done':'todo'} />
        </button>
        <button
          className={`px-3 py-1.5 rounded-md border ${tab==='quiz'?'bg-white border-blue-500':'bg-slate-50 border-slate-200'} ${!prereqsMet && 'opacity-50 cursor-not-allowed'}`}
          onClick={() => prereqsMet && setTab('quiz')}
          aria-disabled={!prereqsMet}
        >
          Quiz <StatusDot state={quizPassed ? 'done' : (prereqsMet ? 'todo' : 'locked')} />
        </button>
      </div>

      {/* Panels */}
      {tab==='osha' && (
        <section className='rounded-2xl border bg-white p-4 mb-4'>
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-xl font-semibold">OSHA 1910.178 — Pre-Operation Requirements</h2>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-medium text-amber-900">Daily Inspection Required</h3>
              <p className="text-sm text-amber-800 mt-1">
                Powered industrial trucks must be inspected at least daily and when used on each shift.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">Safety Requirements:</h3>
              <ul className="space-y-2 text-sm">
                <li>• Remove trucks from service if any condition adversely affects safety</li>
                <li>• Verify the <strong>data plate</strong> matches the truck and any attachments in use</li>
                <li>• Wear <strong>seatbelts</strong> and required <strong>PPE</strong> as posted</li>
                <li>• Test <strong>horn</strong> before moving; use at intersections and blind corners</li>
                <li>• Confirm <strong>lights</strong>/beacons work where required</li>
                <li>• Check tires, forks, chains, hydraulics, and look for leaks</li>
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-sm text-slate-600">
                <em>This is a plain-language summary to help you pass and operate safely. Always follow your site policy and the manufacturer's manual.</em>
              </p>
            </div>
          </div>
        </section>
      )}

      {tab==='practice' && (
        <section className='rounded-2xl border bg-white p-4 mb-4'>
          <div className="space-y-8">
            <section className="grid sm:grid-cols-2 gap-6">
              {steps.map(s => (
                <button
                  key={s.key}
                  onClick={() => toggle(s.key)}
                  className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${done[s.key] ? 'border-emerald-500 ring-1 ring-emerald-200' : 'border-slate-200 hover:border-slate-300'}`}
                  aria-pressed={!!done[s.key]}
                >
                  <Image 
                    src={assetUrl(resolveAsset(s.iconKey))} 
                    alt={s.label} 
                    width={48} 
                    height={48} 
                    className="w-12 h-12 rounded-md" 
                  />
                  <div className="flex-1">
                    <div className="font-medium">{s.label}</div>
                    <div className="text-sm text-slate-500">Tap to mark {done[s.key] ? 'complete' : 'complete this step'}.</div>
                  </div>
                  <div aria-hidden className={`w-3 h-3 rounded-full ${done[s.key] ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </button>
              ))}
            </section>

            <section className="border rounded-2xl p-4">
              <h2 className="font-medium mb-2">Seatbelt reminder</h2>
              <img 
                src={assetUrl(resolveAsset('seatbeltReminder'))} 
                alt="Seatbelt latch animation" 
                className="w-full max-w-lg mx-auto"
              />
            </section>

            {allDone && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">✅ Practice section completed!</p>
              </div>
            )}
          </div>
        </section>
      )}

      {tab==='flash' && (
        <section className='rounded-2xl border bg-white p-4 mb-4'>
          <FlashDeck cards={(flashData as any).cards || []} />
          <div className='text-xs text-slate-500 mt-2'>Tip: open each card once before taking the quiz.</div>
        </section>
      )}

      {tab==='quiz' && (
        <section className='rounded-2xl border bg-white p-4 mb-4'>
          {!prereqsMet ? (
            <div className='text-sm text-slate-600'>
              <p className='mb-2 flex items-center gap-2'><span>🔒</span> The quiz unlocks after:</p>
              <ul className='list-disc ml-6 space-y-1'>
                <li>Complete the Practice checklist</li>
                <li>Open the Flash Cards</li>
              </ul>
            </div>
          ) : (
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='font-medium'>Module 1 Quiz</h3>
                <p className='text-sm text-slate-600'>8 questions · pass ≥ 80%</p>
              </div>
              <button className='px-4 py-2 rounded-md border bg-blue-600 text-white border-blue-600' onClick={() => setOpenQuiz(true)}>Take quiz</button>
            </div>
          )}
        </section>
      )}

      {/* Footer CTA */}
      <div className='mt-4 flex justify-end'>
        <button
          className={`px-4 py-2 rounded-md border ${quizPassed ? 'bg-blue-600 text-white border-blue-600' : 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200'}`}
          disabled={!quizPassed}
          onClick={async () => {
            try {
              await recordStepCompleteSafe({course:'forklift_operator', module:1, step:'preop'});
              track('preop_complete', { allDone: true, quizPassed: true });
            } catch {}
            router.push('/training?courseId=forklift_operator');
          }}
        >
          {quizPassed ? 'Continue to Module 2' : 'Complete all steps to continue'}
        </button>
      </div>

      {/* Quiz modal */}
      {openQuiz && (
        <SimpleQuizModal 
          module={1} 
          onClose={() => setOpenQuiz(false)} 
          onPassed={() => { setQuizPassed(true); setOpenQuiz(false); }} 
        />
      )}
    </main>
  );
}
