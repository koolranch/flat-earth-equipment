import React from 'react';
import OshaBasicsCard from '@/components/training/OshaBasicsCard';
import { OSHA_BASICS } from '@/app/training/oshaBasics';
import { completeStep } from '@/lib/trainingProgress';
import { useModuleTabs } from '@/hooks/useModuleTabs';

interface Props {
  onContinue?: () => void;
}

const COURSE_ID = 'forklift_operator';
const MODULE_KEY = 'm1';

export default function Module1OSHA(props: Props) {
  const { setActiveTab } = useModuleTabs('osha');
  
  const handleContinue = async () => {
    try {
      await completeStep(COURSE_ID, MODULE_KEY as any, 'osha');
      setActiveTab('practice');
      props?.onContinue?.();
    } catch {}
  };

  return (
    <main className="space-y-4">
      <OshaBasicsCard
        title={OSHA_BASICS.m1.title}
        bullets={OSHA_BASICS.m1.bullets.map(text => ({ text }))}
        tip={OSHA_BASICS.m1.note}
        ctaLabel="Continue to Practice"
        onContinue={handleContinue}
        testId="osha-m1"
        continueTestId="m1-osha-continue"
      />
    </main>
  );
}
