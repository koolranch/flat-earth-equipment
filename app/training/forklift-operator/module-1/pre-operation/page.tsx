"use client";
import * as React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FlashDeck } from '@/components/training/FlashDeck';
import flashData from '@/content/training/forklift-operator/module-1/preop-flashcards.json';

// Import the existing pre-op module component
import PreOpModule from '@/app/training/modules/pre-op/page';

export default function Page(){
  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
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

        <TabsContent value='practice'>
          <PreOpModule />
        </TabsContent>

        <TabsContent value='flash' className='pt-4'>
          <FlashDeck cards={(flashData as any).cards || []} />
        </TabsContent>

        <TabsContent value='osha' className='prose max-w-3xl pt-4'>
          <div className="space-y-4">
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
