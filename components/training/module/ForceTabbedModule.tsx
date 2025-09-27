/* Force-tabbed wrapper: renders the original TabbedModuleLayout when a DB module has content_slug. */
'use client';
import React, { useMemo } from 'react';
import TabbedModuleLayout from '@/components/training/module/TabbedModuleLayout';

type ModuleRow = {
  id: string;
  title: string;
  content_slug: string | null;
  order: number;
};

export default function ForceTabbedModule({ module, courseSlug }: { module: ModuleRow; courseSlug: string }) {
  // Map DB order to your historical moduleKey (m1..m5) used by progress gating
  const moduleKey = useMemo(() => {
    const map: Record<number, 'm1'|'m2'|'m3'|'m4'|'m5'|undefined> = {
      2: 'm1',
      3: 'm2',
      4: 'm3',
      5: 'm4',
      6: 'm5'
    };
    return map[module.order];
  }, [module.order]);

  if (!module.content_slug) {
    // Should never be called for intro/complete; guard just in case
    return <div className="mx-auto max-w-3xl py-10 text-red-600">This module has no content; cannot render tabbed layout.</div>;
  }

  return (
    <TabbedModuleLayout
      courseSlug={courseSlug}
      contentSlug={module.content_slug}
      moduleSlug={module.content_slug}
      title={module.title}
      order={module.order}
      moduleKey={moduleKey}
    />
  );
}
