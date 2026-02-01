"use client";
import React from 'react';
import { Checklist, type ChecklistItem } from '@/components/practice/Checklist';

export function Module4Practice({ onComplete }: { onComplete: () => void }){
  const items: ChecklistItem[] = [
    { 
      id: "spill", 
      label: "Identify spill hazard",
      tip: "Stop and report spills immediately — liquids cause loss of traction and uncontrolled skids"
    },
    { 
      id: "corner", 
      label: "Identify blind corner hazard",
      tip: "Sound horn and slow down at blind corners — collisions with pedestrians are often fatal"
    },
    { 
      id: "overhead", 
      label: "Identify overhead obstruction",
      tip: "Watch mast height and overhead clearance — striking pipes, lights, or sprinklers causes serious damage"
    },
    { 
      id: "pedestrian", 
      label: "Identify pedestrian crossing area",
      tip: "Pedestrians always have the right of way — make eye contact before proceeding"
    },
    { 
      id: "dock", 
      label: "Identify dock edge/ramp hazard",
      tip: "Check dock plates are secure and trailer brakes are set — dock falls are often fatal"
    },
    { 
      id: "speed", 
      label: "Identify speed zone violation",
      tip: "Reduce speed in designated zones — forklifts need 3x the stopping distance of a car"
    },
    { 
      id: "unstable", 
      label: "Identify unstable load hazard",
      tip: "Don't move unstable loads — restack or secure before transport"
    },
    { 
      id: "congestion", 
      label: "Identify congested aisle hazard",
      tip: "Clear the area or find alternate route — congested aisles increase collision risk"
    },
  ];

  return (
    <Checklist
      title="Hazard hunt — mark each hazard"
      subtitle="Tap each hazard to learn the correct response"
      moduleId="m4"
      sectionKey="practice"
      items={items}
      onAllDone={onComplete}
      completionTitle="Hazard Spotter Certified!"
      completionMessage="You've trained your eye to spot hazards! In real operations, identify and report hazards BEFORE an incident occurs — prevention is the goal. (OSHA 1910.178(l))"
    />
  );
}

