"use client";
import React from 'react';
import { Checklist, type ChecklistItem } from '@/components/practice/Checklist';

export function Module4Practice({ onComplete }: { onComplete: () => void }){
  const items: ChecklistItem[] = [
    { id: "spill", label: "Identify spill hazard" },
    { id: "corner", label: "Identify blind corner hazard" },
    { id: "overhead", label: "Identify overhead obstruction" },
    { id: "pedestrian", label: "Identify pedestrian crossing area" },
    { id: "dock", label: "Identify dock edge/ramp hazard" },
    { id: "speed", label: "Identify speed zone violation" },
    { id: "unstable", label: "Identify unstable load hazard" },
    { id: "congestion", label: "Identify congested aisle hazard" },
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

