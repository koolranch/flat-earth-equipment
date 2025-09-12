import React from 'react';
import OshaBasicsCard from '@/components/training/OshaBasicsCard';

interface Props {
  onContinue?: () => void;
}

export default function Module5OSHA(props: Props) {
  return (
    <main className="space-y-4">
      <OshaBasicsCard
        title="OSHA Basics — Advanced Operations"
        bullets={[
          { text: 'Slopes: drive forward up; reverse down. Keep load upgrade; no turning on slope.' },
          { text: 'Trailers/ramps: verify dock plates are rated and secured; chock/lock trailers.' },
          { text: 'Attachments: capacity/data plate must reflect the attachment; re-train if new device is installed.' },
          { text: 'Charging/refuel: follow site procedures; PPE as posted; no ignition sources.' },
          { text: 'Parking: neutral, forks down, brake set, key off, charger connected (electric).' },
          { text: 'After incidents: stop, secure, report; do not return to service until inspected.' }
        ]}
        tip={'These practices augment manufacturer instructions and your site policy; where rules differ, follow the stricter requirement.'}
        onContinue={props?.onContinue}
        testId="osha-m5"
      />
    </main>
  );
}
