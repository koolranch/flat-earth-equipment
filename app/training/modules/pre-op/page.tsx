"use client";
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { StatusDot } from '@/components/training/StatusDot';
import SvgEmbed from '@/components/training/SvgEmbed';
import SimpleQuizModal from '@/components/quiz/SimpleQuizModal';
import FlashCardDeck from '@/components/training/FlashCardDeck';
import { getModuleFlashcards } from '@/lib/training/flashcards';
import { track } from '@/lib/analytics/track';
import { assetUrl } from '@/lib/assets';
import { resolveAsset } from '@/lib/asset-manifest';
import { recordStepCompleteSafe } from '@/lib/progress/client';

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
        <section className='rounded-2xl border bg-white p-6 mb-4'>
          <div className="space-y-6 max-w-4xl mx-auto">
            <header className="text-center">
              <h2 className="text-2xl font-bold text-slate-900">OSHA 1910.178 — Pre-Operation Requirements</h2>
              <p className="text-slate-600 mt-2">Essential safety checks before operating powered industrial trucks</p>
            </header>
            
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center text-xl font-bold">
                  !
                </div>
                <div>
                  <h3 className="font-bold text-amber-900">Daily Inspection Required</h3>
                  <p className="text-sm text-amber-800 mt-1">
                    Powered industrial trucks must be inspected at least daily and when used on each shift.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg text-slate-900 mb-4">Key Safety Requirements:</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                
                {/* PPE Card */}
                <div className="group bg-white rounded-xl border-2 border-slate-200 hover:border-[#F76511] transition-all p-4 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F76511]"></div>
                  <div className="flex items-start gap-3">
                    <img src="/training/flashcards/m1-hivis-vest.svg" alt="PPE" className="w-12 h-12 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 mb-1">PPE & Seatbelts</h4>
                      <p className="text-sm text-slate-700">Wear seatbelts and required PPE as posted by your facility</p>
                    </div>
                  </div>
                </div>

                {/* Data Plate Card */}
                <div className="group bg-white rounded-xl border-2 border-slate-200 hover:border-[#F76511] transition-all p-4 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F76511]"></div>
                  <div className="flex items-start gap-3">
                    <img src="/training/flashcards/m1-data-plate.svg" alt="Data plate" className="w-12 h-12 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 mb-1">Data Plate Verification</h4>
                      <p className="text-sm text-slate-700">Verify data plate matches truck and any attachments in use</p>
                    </div>
                  </div>
                </div>

                {/* Horn Card */}
                <div className="group bg-white rounded-xl border-2 border-slate-200 hover:border-[#F76511] transition-all p-4 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F76511]"></div>
                  <div className="flex items-start gap-3">
                    <img src="/training/flashcards/m1-horn-test.svg" alt="Horn" className="w-12 h-12 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 mb-1">Horn Test</h4>
                      <p className="text-sm text-slate-700">Test horn before moving; use at intersections and blind corners</p>
                    </div>
                  </div>
                </div>

                {/* Lights Card */}
                <div className="group bg-white rounded-xl border-2 border-slate-200 hover:border-[#F76511] transition-all p-4 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F76511]"></div>
                  <div className="flex items-start gap-3">
                    <img src="/training/flashcards/m1-lights.svg" alt="Lights" className="w-12 h-12 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 mb-1">Lights & Beacons</h4>
                      <p className="text-sm text-slate-700">Confirm lights and beacons work where required</p>
                    </div>
                  </div>
                </div>

                {/* Inspection Card */}
                <div className="group bg-white rounded-xl border-2 border-slate-200 hover:border-[#F76511] transition-all p-4 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F76511]"></div>
                  <div className="flex items-start gap-3">
                    <img src="/training/flashcards/m1-inspection-checklist.svg" alt="Inspection" className="w-12 h-12 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 mb-1">Equipment Inspection</h4>
                      <p className="text-sm text-slate-700">Check tires, forks, chains, hydraulics, and look for leaks</p>
                    </div>
                  </div>
                </div>

                {/* Service Removal Card */}
                <div className="group bg-white rounded-xl border-2 border-slate-200 hover:border-[#F76511] transition-all p-4 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F76511]"></div>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 flex-shrink-0 rounded-full bg-red-100 flex items-center justify-center text-2xl">
                      ⚠️
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 mb-1">Service Removal</h4>
                      <p className="text-sm text-slate-700">Remove trucks from service if any condition adversely affects safety</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl">
                  💡
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 mb-1">Remember</h4>
                  <p className="text-sm text-blue-800">
                    This is a plain-language summary to help you pass and operate safely. Always follow your site policy and the manufacturer's manual.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Continue to Practice button */}
            <div className="flex justify-end">
              <button
                onClick={() => setTab('practice')}
                className="inline-flex items-center gap-2 bg-[#F76511] text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all shadow-md hover:shadow-lg"
              >
                Mark OSHA Basics done → Practice
              </button>
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
              <div className="flex justify-center">
                <img 
                  src="/training/d1-seatbelt.svg" 
                  alt="Seatbelt latch animation" 
                  className="w-full max-w-lg"
                />
              </div>
              <p className="text-sm text-slate-600 mt-2 text-center">Always buckle your seatbelt before moving the forklift</p>
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
          <FlashCardDeck
            cards={getModuleFlashcards('module-1')}
            title="Flash Cards"
            onDone={() => setFlashTouched(true)}
          />
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

      {/* Footer CTA - Always visible for clarity */}
      <div className={`mt-8 p-6 rounded-2xl border-2 transition-all ${
        quizPassed 
          ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 shadow-md' 
          : 'bg-slate-50 border-slate-200'
      }`}>
        <div className='flex items-center justify-between gap-4'>
          <div className='flex items-center gap-4'>
            {quizPassed && (
              <div className='flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#F76511] to-orange-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg'>
                ✓
              </div>
            )}
            <div>
              <h3 className='font-bold text-lg mb-1'>
                {quizPassed ? 'Module 1 Complete!' : '📋 Complete Module 1'}
              </h3>
              <p className='text-sm text-slate-600'>
                {quizPassed 
                  ? 'Great job! Click to continue to the next module.' 
                  : 'Finish all tabs above, then pass the quiz to continue.'}
              </p>
            </div>
          </div>
          <button
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
              quizPassed 
                ? 'bg-[#F76511] text-white hover:bg-orange-600 shadow-md hover:shadow-xl' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            disabled={!quizPassed}
            onClick={async () => {
              try {
                await recordStepCompleteSafe({course:'forklift', module:1, step:'preop'});
                track('preop_complete', { allDone: true, quizPassed: true });
              } catch {}
              router.push('/training?course=forklift');
            }}
          >
            {quizPassed ? 'Continue to Module 2 →' : 'Locked'}
          </button>
        </div>
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
