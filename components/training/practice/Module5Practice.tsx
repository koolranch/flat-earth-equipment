"use client";
import React from 'react';
import { Checklist, type ChecklistItem } from '@/components/practice/Checklist';

export function Module5Practice({ onComplete }: { onComplete: () => void }){
  const items: ChecklistItem[] = [
    { id: "shutdown", label: "Review shutdown procedures" },
    { id: "attachments", label: "Review attachment safety" },
    { id: "charging", label: "Review charging safety protocols" },
    { id: "charging-area", label: "Verify charging area is safe (ventilation, no flames)" },
    { id: "ppe", label: "Check PPE for battery handling" },
    { id: "sequence", label: "Confirm proper shutdown sequence" },
    { id: "connections", label: "Inspect fuel/power connections" },
    { id: "parking", label: "Verify parking brake and forks lowered" },
  ];

  return (
    <Checklist
      title="Advanced operations checks"
      moduleId="m5"
      sectionKey="practice"
      items={items}
      onAllDone={onComplete}
    />
  );
}

