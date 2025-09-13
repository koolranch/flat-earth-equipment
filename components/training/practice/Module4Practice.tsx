"use client";
import React from 'react';
import { Checklist, type ChecklistItem } from '@/components/practice/Checklist';

export function Module4Practice({ onComplete }: { onComplete: () => void }){
  const items: ChecklistItem[] = [
    { id: "spill", label: "Identify spill hazard" },
    { id: "corner", label: "Identify blind corner hazard" },
    { id: "overhead", label: "Identify overhead obstruction" },
  ];

  return (
    <Checklist
      title="Hazard hunt — mark each hazard"
      moduleId="m4"
      sectionKey="practice"
      items={items}
      onAllDone={onComplete}
    />
  );
}

