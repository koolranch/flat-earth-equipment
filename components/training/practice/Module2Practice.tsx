"use client";
import React from 'react';
import { Checklist, type ChecklistItem } from '@/components/practice/Checklist';

export function Module2Practice({ onComplete }: { onComplete: () => void }){
  const items: ChecklistItem[] = [
    { 
      id: "forks", 
      label: "Forks inspected",
      tip: "Check for cracks, bends, and worn heel — damaged forks can fail under load"
    },
    { 
      id: "chains", 
      label: "Chains & hoses OK",
      tip: "Look for wear, leaks, and proper tension — chain failure causes uncontrolled drops"
    },
    { 
      id: "tires", 
      label: "Tires/Wheels OK",
      tip: "Check for damage, proper inflation, and lug nuts — bad tires reduce stability"
    },
    { 
      id: "horn", 
      label: "Horn & lights work",
      tip: "Test before every shift — your horn warns pedestrians, lights signal your presence"
    },
    { 
      id: "seatbelt", 
      label: "Seatbelt present",
      tip: "Verify it latches securely — OSHA requires use if your forklift is equipped"
    },
    { 
      id: "dataplate", 
      label: "Data plate legible",
      tip: "Must show capacity, weight, and attachments — never exceed rated capacity"
    },
    { 
      id: "leaks", 
      label: "No visible leaks",
      tip: "Check for oil, hydraulic fluid, or fuel — leaks indicate mechanical problems"
    },
    { 
      id: "battery", 
      label: "Battery/LP secure",
      tip: "Ensure connections tight, LP tank strapped properly — prevents fire and acid hazards"
    },
  ];

  return (
    <Checklist
      title="Run the 8-point inspection"
      subtitle="Tap each inspection point to learn why it matters"
      moduleId="m2"
      sectionKey="practice"
      items={items}
      onAllDone={onComplete}
      completionTitle="Inspection Complete!"
      completionMessage="Report any defects immediately — never operate an unsafe truck. (OSHA 1910.178(q)(7))"
    />
  );
}

