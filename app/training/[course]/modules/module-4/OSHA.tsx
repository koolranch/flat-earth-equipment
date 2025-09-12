import React from 'react';
import OshaBasicsCard from '@/components/training/OshaBasicsCard';

interface Props {
  onContinue?: () => void;
}

export default function Module4OSHA(props: Props) {
  return (
    <main className="space-y-4">
      <OshaBasicsCard
        title="OSHA Basics — Hazard Awareness"
        bullets={[
          { text: 'Blind corners: stop, horn, creep; mirrors help but don\'t replace right-of-way.' },
          { text: 'Pedestrian aisles: yield to people; maintain eye contact; never pass a person between racks and the truck.' },
          { text: 'Overhead: look up for pipes, sprinklers, doors, low beams before raising mast.' },
          { text: 'Ramps & docks: chock wheels; never turn on a slope; approach docks square.' },
          { text: 'Spills/debris: stop and get hazards cleaned; do not drive through unknown liquids.' },
          { text: 'Unstable loads: wrap/strap or re-stack; never move a swaying or leaning stack.' }
        ]}
        tip={'Report and tag out unsafe conditions. Use spotters where visibility is limited.'}
        onContinue={() => { try { props?.onContinue?.(); } catch {} }}
        testId="osha-m4"
      />
    </main>
  );
}
