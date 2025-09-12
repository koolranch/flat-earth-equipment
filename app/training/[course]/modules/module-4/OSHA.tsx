import React from 'react';
import OshaBasicsCard from '@/components/training/OshaBasicsCard';
import { OSHA_BASICS } from '@/app/training/oshaBasics';

interface Props {
  onContinue?: () => void;
}

export default function Module4OSHA(props: Props) {
  return (
    <main className="space-y-4">
      <OshaBasicsCard
        title={OSHA_BASICS.m4.title}
        bullets={OSHA_BASICS.m4.bullets.map(text => ({ text }))}
        tip={OSHA_BASICS.m4.note}
        onContinue={() => { try { props?.onContinue?.(); } catch {} }}
        testId="osha-m4"
      />
    </main>
  );
}
