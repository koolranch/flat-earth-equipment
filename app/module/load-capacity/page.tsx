"use client";
import React from 'react';
import LoadCapacity from '@/components/tools/LoadCapacity';
import { DemoPanel } from '@/components/DemoPanel';
import { useT } from '@/lib/i18n';
import GuideSection from '@/components/guides/GuideSection';
import { moduleGuides } from '@/content/guides/modules';

export default function LoadCapacityPage() {
  const t = useT();
  const guides = moduleGuides['balance-load-handling']?.guides || [];

  return (
    <main className="container mx-auto p-4 md:p-6 space-y-4">
      <DemoPanel
        title={t('load_capacity.demo_title', 'Load Capacity Calculator')}
        objective={t('load_capacity.demo_objective', 'Learn how to calculate adjusted load capacity based on load center distance and attachment weights.')}
        steps={[
          t('load_capacity.step_1', 'Enter the forklift\'s rated capacity from the capacity plate'),
          t('load_capacity.step_2', 'Input the rated load center (typically 24 inches)'),
          t('load_capacity.step_3', 'Measure and enter the actual load center distance'),
          t('load_capacity.step_4', 'Add any attachment weight (forks, clamps, etc.)'),
          t('load_capacity.step_5', 'Enter your planned load weight'),
          t('load_capacity.step_6', 'Review the safety assessment and recommendations')
        ]}
        onStart={() => {
          console.log('Starting Load Capacity Calculator');
        }}
        onComplete={() => {
          console.log('Load Capacity Calculator completed');
        }}
      >
        <LoadCapacity />
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
