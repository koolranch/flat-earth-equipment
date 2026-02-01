"use client";
import React from 'react';
import { Checklist, type ChecklistItem } from '@/components/practice/Checklist';

export function Module5Practice({ onComplete }: { onComplete: () => void }){
  const items: ChecklistItem[] = [
    { 
      id: "shutdown", 
      label: "Review shutdown procedures",
      tip: "Follow the sequence: Neutral → Brake → Forks down → Key off — skipping steps creates hazards"
    },
    { 
      id: "attachments", 
      label: "Review attachment safety",
      tip: "Attachments must be approved for your truck — they change capacity and require data plate update"
    },
    { 
      id: "charging", 
      label: "Review charging safety protocols",
      tip: "Batteries produce explosive hydrogen gas during charging — proper ventilation prevents ignition"
    },
    { 
      id: "charging-area", 
      label: "Verify charging area is safe (ventilation, no flames)",
      tip: "No smoking, open flames, or sparks within 25 feet — hydrogen gas is highly explosive"
    },
    { 
      id: "ppe", 
      label: "Check PPE for battery handling",
      tip: "Face shield, rubber gloves, and apron required — battery acid causes severe burns"
    },
    { 
      id: "sequence", 
      label: "Confirm proper shutdown sequence",
      tip: "Neutral, parking brake, forks flat on floor — prevents roll-away and trip hazards"
    },
    { 
      id: "connections", 
      label: "Inspect fuel/power connections",
      tip: "Check for leaks, corrosion, and secure connections — fuel leaks cause fires, loose cables arc"
    },
    { 
      id: "parking", 
      label: "Verify parking brake and forks lowered",
      tip: "Forks flat on floor prevents tripping — parking brake prevents uncontrolled movement"
    },
  ];

  return (
    <Checklist
      title="End-of-shift safety checks"
      subtitle="Tap each item to review end-of-shift safety"
      moduleId="m5"
      sectionKey="practice"
      items={items}
      onAllDone={onComplete}
      completionTitle="Shutdown Expert!"
      completionMessage="You know how to safely end your shift! Never walk away from a forklift without completing shutdown — an unsecured truck is a hazard to everyone. (OSHA 1910.178(m))"
    />
  );
}

