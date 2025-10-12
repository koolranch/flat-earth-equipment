import React from 'react';
import InteractiveChecklist, { ChecklistItem } from '@/components/training/InteractiveChecklist';

export default function Module2OSHA() {
  const checklistItems: ChecklistItem[] = [
    {
      id: 'daily-inspection',
      title: 'Daily Inspection Required',
      description: 'Run the full inspection each shift and record defects. Remove trucks from service if any condition adversely affects safety.',
      icon: '📋'
    },
    {
      id: 'forks',
      title: 'Inspect Forks',
      description: 'No cracks or bends; matched pair; lock pins in place; heel wear within limit. Damaged forks cause dropped loads.',
      icon: '🔱'
    },
    {
      id: 'chains-hoses',
      title: 'Check Chains & Hoses',
      description: 'No kinks, tight/broken links, frays, or leaks; proper tension/lubrication; guards in place. Test lift/tilt functions.',
      icon: '⛓️'
    },
    {
      id: 'tires-wheels',
      title: 'Inspect Tires & Wheels',
      description: 'Adequate tread/inflation (pneumatic); no chunks/splits; wheel lugs tight; rims undamaged. Tire failure causes tip-overs.',
      icon: '🛞'
    },
    {
      id: 'horn-lights',
      title: 'Test Horn & Lights',
      description: 'Horn works (use at blind corners); head/taillights, beacon, and reverse beeper functional. Prevent pedestrian accidents.',
      icon: '📢'
    },
    {
      id: 'seatbelt-dataplate',
      title: 'Verify Seatbelt & Data Plate',
      description: 'Seatbelt present/working and must be worn; data plate present, legible, and matches attachments/capacity.',
      icon: '🦺'
    },
    {
      id: 'leaks',
      title: 'Check for Leaks',
      description: 'No hydraulic, fuel, or coolant leaks; mast/undercarriage clear; clean spills per procedure. Fuel leaks create fire hazards.',
      icon: '💧'
    },
    {
      id: 'battery-lp',
      title: 'Check Battery/LP System',
      description: 'Cables/connectors intact and secure; charger leads OK; LP cylinder secured, no leaks/odor. LP leaks are fire hazards.',
      icon: '🔋'
    },
    {
      id: 'safety-devices',
      title: 'Test Safety Devices',
      description: 'Parking brake, deadman, brakes, and steering respond correctly; alarms present and working. Test before moving.',
      icon: '🛡️'
    },
  ];

  return (
    <InteractiveChecklist
      title="OSHA 1910.178 — 8-Point Inspection"
      subtitle="Master the daily safety inspection checklist."
      items={checklistItems}
      requireAllChecked={true}
      onComplete={() => {
        // This will be called by TabbedModuleLayout's button
        console.log('Module 2 OSHA checklist completed');
      }}
    />
  );
}
