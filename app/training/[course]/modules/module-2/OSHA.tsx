import React from 'react';
import OshaBasicsCard from '@/components/training/OshaBasicsCard';

interface Props {
  onContinue?: () => void;
}

export default function Module2OSHA(props: Props) {
  return (
    <main className="space-y-4">
      <OshaBasicsCard
        title="OSHA Basics — 8-Point Inspection"
        bullets={[
          { text: 'Forks: cracks, bends, locking pins seated.' },
          { text: 'Chains & hoses: no frays, leaks, kinks; proper tension.' },
          { text: 'Tires & wheels: wear, damage; proper inflation (if pneumatic).' },
          { text: 'Lights & horn: functioning; reverse beeper audible.' },
          { text: 'Seatbelt & data plate: present, legible, capacity known.' },
          { text: 'Leaks: undercarriage/mast area clear of fluids.' },
          { text: 'Battery/LP: secure connections; charger lines intact.' },
          { text: 'Safety devices: parking brake, deadman, alarms.' }
        ]}
        tip={'Checklist: inspect at start of shift and after any incident or repair.'}
        onContinue={() => { try { props?.onContinue?.(); } catch {} }}
        testId="osha-m2"
      />
    </main>
  );
}
