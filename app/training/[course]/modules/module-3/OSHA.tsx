import React from 'react';
import OshaBasicsCard from '@/components/training/OshaBasicsCard';

interface Props {
  onContinue?: () => void;
}

export default function Module3OSHA(props: Props) {
  return (
    <main className="space-y-4">
      <OshaBasicsCard
        title="OSHA Basics — Balance & Load Handling"
        bullets={[
          { text: 'Keep combined center of gravity inside the stability triangle.' },
          { text: 'Approach square to the load; space forks evenly; fully insert.' },
          { text: 'Adjust fork width to the load; keep the load centered.' },
          { text: 'Tilt back to stabilize; raise only as high as needed to travel.' },
          { text: 'Travel with forks low (4–6 in / 10–15 cm) and tilted slightly up.' },
          { text: 'Observe load center values on the data plate; attachments change capacity.' }
        ]}
        tip={'If the truck or load becomes unstable, lower the load, stop, and re-evaluate. Do not jump from a tipping truck — lean away and hold on.'}
        onContinue={() => { try { props?.onContinue?.(); } catch {} }}
        testId="osha-m3"
      />
    </main>
  );
}
