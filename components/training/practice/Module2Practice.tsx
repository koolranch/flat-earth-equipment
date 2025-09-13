"use client";
import React from 'react';
import { Checklist, type ChecklistItem } from '@/components/practice/Checklist';

export function Module2Practice({ onComplete }: { onComplete: () => void }){
  const items: ChecklistItem[] = [
    { id: "forks", label: "Forks inspected" },
    { id: "chains", label: "Chains & hoses OK" },
    { id: "tires", label: "Tires/Wheels OK" },
    { id: "horn", label: "Horn & lights work" },
    { id: "seatbelt", label: "Seatbelt present" },
    { id: "dataplate", label: "Data plate legible" },
    { id: "leaks", label: "No visible leaks" },
    { id: "battery", label: "Battery/LP secure" },
  ];

  return (
    <Checklist
      moduleId="m2"
      sectionKey="practice"
      items={items}
      onAllDone={onComplete}
    />
  );
}

