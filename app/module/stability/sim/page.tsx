"use client";
import React from 'react';
import StabilityTriangle from '@/components/sim/StabilityTriangle';
import { DemoPanel } from '@/components/DemoPanel';
import { useT } from '@/lib/i18n';
import GuideSection from '@/components/guides/GuideSection';
import { moduleGuides } from '@/content/guides/modules';

export default function StabilitySimPage() {
  const t = useT();
  const guides = moduleGuides['balance-load-handling']?.guides || [];

  return (
    <main className="container mx-auto p-4 md:p-6 space-y-4">
      <DemoPanel
        title={t('stability.sim_title', 'Stability Triangle Simulation')}
        objective={t('stability.sim_objective', 'Learn how load weight, position, and mast tilt affect forklift stability.')}
        steps={[
          t('stability.step_1', 'Adjust the load weight using the first slider'),
          t('stability.step_2', 'Change the load center distance with the second slider'),
          t('stability.step_3', 'Modify the mast tilt angle with the third slider'),
          t('stability.step_4', 'Observe how the center of gravity moves within the stability triangle'),
          t('stability.step_5', 'Watch the stability status change from stable to at-risk to tip warning')
        ]}
        onStart={() => {
          console.log('Starting Stability Triangle simulation');
        }}
        onComplete={() => {
          console.log('Stability Triangle simulation completed');
        }}
      >
        <StabilityTriangle />
      </DemoPanel>

      {/* OSHA Guide Cards */}
      {guides.length > 0 && (
        <section className='space-y-2'>
          <h2 className='text-lg font-semibold text-[#0F172A] dark:text-white'>Guides</h2>
          <GuideSection guides={guides} />
        </section>
      )}
    </main>
  );
}
