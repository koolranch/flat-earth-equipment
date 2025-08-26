"use client";
import React from 'react';
import LoadCapacity from '@/components/tools/LoadCapacity';
import { DemoPanel } from '@/components/DemoPanel';
import { useT } from '@/lib/i18n';

export default function LoadCapacityPage() {
  const t = useT();

  return (
    <main className="container mx-auto p-4 md:p-6">
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
    </main>
  );
}
