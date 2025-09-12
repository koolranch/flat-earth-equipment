import React from 'react';
import OshaBasicsCard from '@/components/training/OshaBasicsCard';
import { OSHA_BASICS } from '@/app/training/oshaBasics';

interface Props {
  onContinue?: () => void;
}

export default function Module5OSHA(props: Props) {
  return (
    <main className="space-y-4">
      <OshaBasicsCard
        title={OSHA_BASICS.m5.title}
        bullets={OSHA_BASICS.m5.bullets.map(text => ({ text }))}
        tip={OSHA_BASICS.m5.note}
        onContinue={() => { try { props?.onContinue?.(); } catch {} }}
        testId="osha-m5"
      />
    </main>
  );
}
