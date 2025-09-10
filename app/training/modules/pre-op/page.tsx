"use client";
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FlashDeck } from '@/components/training/FlashDeck';
import SvgEmbed from '@/components/training/SvgEmbed';
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

  function toggle(k: string) {
    setDone(d => {
      const v = !d[k];
      const next = { ...d, [k]: v };
      track('preop_step_toggle', { step: k, done: v });
      return next;
    });
  }

  const allDone = steps.every(s => done[s.key]);

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Module 1: Pre-Operation</h1>
        <p className="text-slate-600">Equip PPE and complete basic safety checks before you move the truck.</p>
      </header>

      <Tabs defaultValue='practice' className='w-full'>
        <TabsList>
          <TabsTrigger value='practice'>Practice</TabsTrigger>
          <TabsTrigger value='flash'>Flash Cards</TabsTrigger>
          <TabsTrigger value='osha'>OSHA Basics</TabsTrigger>
        </TabsList>

        <TabsContent value='practice' className="space-y-8">
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

          <footer className="pt-2">
            <button
              disabled={!allDone}
              data-testid="preop-continue"
              onClick={async () => {
                try {
                  await recordStepCompleteSafe({course:'forklift_operator', module:1, step:'preop'});
                  track('preop_complete', { allDone });
                } catch(_) {
                  /* no-op */
                }
                // Navigate back to course modules list
                router.push('/training?courseId=forklift_operator');
              }}
              className={`px-5 py-3 rounded-xl font-semibold ${allDone ? 'bg-black text-white' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
            >
              {allDone ? 'Continue' : 'Complete all steps to continue'}
            </button>
          </footer>
        </TabsContent>

        <TabsContent value='flash' className='pt-4'>
          <FlashDeck cards={(flashData as any).cards || []} />
        </TabsContent>

        <TabsContent value='osha' className='pt-4'>
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
        </TabsContent>
      </Tabs>
    </main>
  );
}
