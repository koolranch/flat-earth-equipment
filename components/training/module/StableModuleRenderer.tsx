'use client';
import React from 'react';
import TabbedModuleLayout from '@/components/training/module/TabbedModuleLayout';
import ModuleDebugOverlay from '@/components/training/module/ModuleDebugOverlay';

const SLUG_MAP: Record<number, { title: string; contentSlug: string; moduleKey: 'm1'|'m2'|'m3'|'m4'|'m5' }> = {
  2: { title: 'Module 1: Pre-Operation Inspection', contentSlug: 'pre-operation-inspection', moduleKey: 'm1' },
  3: { title: 'Module 2: 8-Point Inspection', contentSlug: 'eight-point-inspection', moduleKey: 'm2' },
  4: { title: 'Module 3: Balance & Load Handling', contentSlug: 'stability-and-load-handling', moduleKey: 'm3' },
  5: { title: 'Module 4: Hazard Hunt', contentSlug: 'safe-operation-and-hazards', moduleKey: 'm4' },
  6: { title: 'Module 5: Advanced Operations', contentSlug: 'shutdown-and-parking', moduleKey: 'm5' }
};

export default function StableModuleRenderer({ order, courseSlug, __debug }: { order: number; courseSlug: string; __debug?: boolean; }) {
  const mapped = SLUG_MAP[order];
  if (!mapped) {
    return (
      <div className="mx-auto max-w-3xl py-10">
        <h1 className="text-2xl font-semibold">Module</h1>
        <p className="mt-2 text-muted-foreground">This step is not part of the stabilized mapping. Use Intro or Completion pages.</p>
        <ModuleDebugOverlay __debug={__debug} order={order} courseSlug={courseSlug} mapped={null} />
      </div>
    );
  }

  return (
    <>
      <TabbedModuleLayout
        title={mapped.title}
        courseSlug={courseSlug}
        contentSlug={mapped.contentSlug}
        moduleSlug={mapped.contentSlug}
        moduleKey={mapped.moduleKey}
        order={order}
        quizMeta={{ questions: 8, passPct: 80 }}
      />
      <ModuleDebugOverlay __debug={__debug} order={order} courseSlug={courseSlug} mapped={mapped} forcedTabbed={true} />
    </>
  );
}
