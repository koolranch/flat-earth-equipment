import React from 'react';
import OshaBasicsCard from '@/components/training/OshaBasicsCard';

interface Props {
  onContinue?: () => void;
}

export default function Module1OSHA(props: Props) {
  return (
    <main className="space-y-4">
      <OshaBasicsCard
        title="OSHA 1910.178 — Pre-Operation Requirements"
        calloutTitle="Daily Inspection Required"
        calloutBody={<p>Powered industrial trucks must be inspected at least daily and when used on each shift.</p>}
        bullets={[
          { text: 'Remove truck from service if any defect affects safety.' },
          { text: 'Verify the data plate matches truck/attachments and is legible.' },
          { text: 'Wear seatbelt and required PPE as posted.' },
          { text: 'Test horn before moving; use at intersections and blind corners.' },
          { text: 'Confirm lights/beacons work as required.' },
          { text: 'Check tires, forks, chains, hydraulics; look for leaks.' }
        ]}
        tip={'This is a plain-language summary to help you pass and operate safely. Always follow your site policy and the manufacturer\'s manual.'}
        ctaLabel="Continue to Module 2"
        onContinue={() => { try { props?.onContinue?.(); } catch {} }}
        testId="osha-m1"
      />
    </main>
  );
}
