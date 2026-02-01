"use client";
import React from 'react';
import { Checklist, type ChecklistItem } from '@/components/practice/Checklist';

export function Module3Practice({ onComplete }: { onComplete: () => void }){
  const items: ChecklistItem[] = [
    { 
      id: "level", 
      label: "Level forks at entry/exit",
      tip: "Approach loads with forks level to prevent sliding or catching — tilt back only after load is secure"
    },
    { 
      id: "tilt", 
      label: "Keep load low & tilted back when traveling",
      tip: "4-6 inches off ground with back tilt lowers center of gravity for maximum stability"
    },
    { 
      id: "capacity", 
      label: "Verify load is within rated capacity",
      tip: "Check the data plate — capacity decreases as load center distance increases"
    },
    { 
      id: "triangle", 
      label: "Check stability triangle alignment",
      tip: "The triangle is formed by the two front wheels and rear pivot — keep the combined center of gravity inside it"
    },
    { 
      id: "square", 
      label: "Position load square and centered on forks",
      tip: "Off-center loads shift the center of gravity sideways, increasing tip-over risk"
    },
    { 
      id: "turns", 
      label: "Make slow, controlled turns with load",
      tip: "Centrifugal force during turns can push the combined center of gravity outside the stability triangle"
    },
    { 
      id: "elevated", 
      label: "Avoid traveling with elevated loads",
      tip: "Elevated loads raise the center of gravity, dramatically reducing stability on turns and inclines"
    },
  ];

  return (
    <Checklist
      title="Balance & load handling checks"
      subtitle="Tap each check to learn how it prevents tip-overs"
      moduleId="m3"
      sectionKey="practice"
      items={items}
      onAllDone={onComplete}
      completionTitle="Load Handling Mastered!"
      completionMessage="Always keep the combined center of gravity within the stability triangle — the #1 cause of forklift fatalities is tip-overs. (OSHA 1910.178(o))"
    />
  );
}

