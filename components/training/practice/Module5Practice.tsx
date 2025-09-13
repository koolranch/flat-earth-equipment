"use client";
import React from 'react';
import { Checklist, type ChecklistItem } from '@/components/practice/Checklist';

export function Module5Practice({ onComplete }: { onComplete: () => void }){
  const items: ChecklistItem[] = [
    { id: "shutdown", label: "Review shutdown procedures" },
    { id: "attachments", label: "Review attachment safety" },
    { id: "charging", label: "Review charging safety protocols" },
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

