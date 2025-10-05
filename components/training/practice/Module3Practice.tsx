"use client";
import React from 'react';
import { Checklist, type ChecklistItem } from '@/components/practice/Checklist';

export function Module3Practice({ onComplete }: { onComplete: () => void }){
  const items: ChecklistItem[] = [
    { id: "level", label: "Level forks at entry/exit" },
    { id: "tilt", label: "Keep load low & tilted back when traveling" },
    { id: "capacity", label: "Verify load is within rated capacity" },
    { id: "triangle", label: "Check stability triangle alignment" },
    { id: "square", label: "Position load square and centered on forks" },
    { id: "turns", label: "Make slow, controlled turns with load" },
    { id: "elevated", label: "Avoid traveling with elevated loads" },
  ];

  return (
    <Checklist
      title="Balance & load handling checks"
      moduleId="m3"
      sectionKey="practice"
      items={items}
      onAllDone={onComplete}
    />
  );
}

