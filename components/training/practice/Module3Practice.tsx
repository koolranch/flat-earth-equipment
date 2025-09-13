"use client";
import React from 'react';
import { Checklist, type ChecklistItem } from '@/components/practice/Checklist';

export function Module3Practice({ onComplete }: { onComplete: () => void }){
  const items: ChecklistItem[] = [
    { id: "level", label: "Level forks at entry/exit" },
    { id: "tilt", label: "Keep load low & tilted back when traveling" },
  ];

  return (
    <Checklist
      moduleId="m3"
      sectionKey="practice"
      items={items}
      onAllDone={onComplete}
    />
  );
}

