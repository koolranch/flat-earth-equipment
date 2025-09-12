import React from 'react';
import OshaBasicsCard from '@/components/training/OshaBasicsCard';
import { OSHA_BASICS } from '@/app/training/oshaBasics';

interface Props {
  onContinue?: () => void;
}

export default function Module1OSHA(props: Props) {
  return (
    <main className="space-y-4">
      <OshaBasicsCard
        title={OSHA_BASICS.m1.title}
        bullets={OSHA_BASICS.m1.bullets.map(text => ({ text }))}
        tip={OSHA_BASICS.m1.note}
        ctaLabel="Continue to Module 2"
        onContinue={() => { try { props?.onContinue?.(); } catch {} }}
        testId="osha-m1"
      />
    </main>
  );
}
